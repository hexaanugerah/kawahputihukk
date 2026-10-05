import { MOCK_LATENCY_MS, BOOKING_CONFIG } from "@/config/app.config";
import { getDB, mutateDB } from "@/lib/mock/db";
import {
  addDaysISO,
  calculateBookingTotals,
  generateBookingId,
  generatePaymentId,
  generateTicketId,
  rupiah,
  todayISO,
} from "@/lib/business";
import { useAuthStore } from "@/store/auth.store";
import type { AppNotification, Booking, BookingItem, BookingStatus, ETicket, Payment, Visitor } from "@/types/domain";

// ============================================================================
// BOOKING SERVICE — seluruh siklus hidup booking pada mode mock.
//
// Alur event-driven (satu sumber data = mock DB):
//   createBooking → payment PENDING
//   processPayment PAID → booking CONFIRMED → e-tiket VALID
//   booking tampil di riwayat pengunjung, admin, manager, dan bisa discan.
// ============================================================================

function delay(ms = MOCK_LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class BookingError extends Error {}

export interface CreateBookingPayload {
  visitDate: string; // yyyy-MM-dd
  items: { ticketId: string; quantity: number }[];
  visitorName: string;
  email: string;
  phone: string;
  note?: string;
}

export interface CreateBookingResult {
  booking: Booking;
  payment: Payment;
}

// ---------------------------------------------------------------------------
// QUERIES
// ---------------------------------------------------------------------------

export const bookingService = {
  async listTickets() {
    await delay(200);
    return getDB().tickets.filter((t) => t.status === "AKTIF");
  },

  async getBooking(id: string): Promise<Booking> {
    await delay(200);
    const b = getDB().bookings.find((x) => x.id === id);
    if (!b) throw new BookingError("Booking tidak ditemukan.");
    return b;
  },

  /** Booking milik user yang sedang login (atau match email-nya). */
  async listMine(): Promise<Booking[]> {
    await delay(250);
    const user = useAuthStore.getState().user;
    if (!user) return [];
    return getDB()
      .bookings.filter((b) => b.userId === user.id || b.email.toLowerCase() === user.email.toLowerCase())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async listAll(): Promise<Booking[]> {
    await delay(250);
    return [...getDB().bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /** Simulasi ketersediaan kapasitas per tanggal. */
  async getAvailability(dateISO: string): Promise<{ date: string; booked: number; capacity: number; remaining: number }> {
    await delay(150);
    const capacity = 1000; // lihat APP_CONFIG.dailyVisitorCapacity
    const booked = getDB()
      .bookings.filter((b) => b.visitDate === dateISO && !["CANCELLED", "EXPIRED"].includes(b.status))
      .reduce((sum, b) => sum + b.items.reduce((s, i) => s + i.quantity, 0), 0);
    return { date: dateISO, booked, capacity, remaining: Math.max(0, capacity - booked) };
  },

  // -------------------------------------------------------------------------
  // COMMANDS
  // -------------------------------------------------------------------------

  /** Validasi + buat booking (status PENDING) + payment PENDING. */
  async create(payload: CreateBookingPayload): Promise<CreateBookingResult> {
    await delay();

    // --- Validasi bisnis ---
    const today = todayISO();
    if (!payload.visitDate) throw new BookingError("Tanggal kunjungan wajib dipilih.");
    if (payload.visitDate < addDaysISO(today, BOOKING_CONFIG.minDaysAhead)) {
      throw new BookingError("Tanggal kunjungan tidak boleh di masa lalu.");
    }
    if (payload.visitDate > addDaysISO(today, BOOKING_CONFIG.maxDaysAhead)) {
      throw new BookingError(`Pemesanan maksimal ${BOOKING_CONFIG.maxDaysAhead} hari ke depan.`);
    }

    const db = getDB();
    const items: BookingItem[] = payload.items
      .filter((i) => i.quantity > 0)
      .map((i) => {
        const ticket = db.tickets.find((t) => t.id === i.ticketId);
        if (!ticket) throw new BookingError("Jenis tiket tidak ditemukan.");
        if (ticket.status !== "AKTIF") throw new BookingError(`${ticket.name} sedang tidak tersedia.`);
        if (i.quantity > BOOKING_CONFIG.maxQuantityPerTicket) {
          throw new BookingError(`Maksimal ${BOOKING_CONFIG.maxQuantityPerTicket} tiket per jenis.`);
        }
        return { ticketId: ticket.id, ticketName: ticket.name, price: ticket.price, quantity: i.quantity };
      });

    if (items.length === 0) throw new BookingError("Pilih minimal satu tiket.");

    const totals = calculateBookingTotals(items);

    const user = useAuthStore.getState().user;
    const booking: Booking = {
      id: generateBookingId(),
      userId: user?.id ?? null,
      visitorName: payload.visitorName.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      visitDate: payload.visitDate,
      items,
      ...totals,
      status: "PENDING",
      note: payload.note,
      createdAt: new Date().toISOString(),
      ticketId: null,
    };

    const payment: Payment = {
      id: generatePaymentId(),
      bookingId: booking.id,
      method: "QRIS",
      amount: totals.total,
      status: "PENDING",
      createdAt: booking.createdAt,
      expiredAt: new Date(Date.now() + BOOKING_CONFIG.paymentExpiryMinutes * 60_000).toISOString(),
    };

    mutateDB((d) => ({
      ...d,
      bookings: [booking, ...d.bookings],
      payments: [payment, ...d.payments],
      visitors: d.visitors.some((v) => v.email.toLowerCase() === booking.email.toLowerCase())
        ? d.visitors
        : [
            { id: `vis-${Date.now()}`, name: booking.visitorName, email: booking.email, phone: booking.phone, joinedAt: booking.createdAt } satisfies Visitor,
            ...d.visitors,
          ],
      notifications: [
        {
          id: `ntf-${Date.now()}`,
          title: "Booking baru",
          message: `Booking ${booking.id} telah dibuat oleh ${booking.visitorName} (${rupiah(booking.total)}).`,
          type: "booking" as const,
          status: "Berhasil" as const,
          createdAt: booking.createdAt,
          read: false,
        },
        ...d.notifications,
      ],
    }));

    return { booking, payment };
  },

  /** Batalkan booking (oleh pengunjung atau admin). */
  async cancel(id: string, reason?: string): Promise<Booking> {
    await delay(200);
    const db = getDB();
    const booking = db.bookings.find((b) => b.id === id);
    if (!booking) throw new BookingError("Booking tidak ditemukan.");
    if (booking.status === "USED") throw new BookingError("Booking yang sudah digunakan tidak dapat dibatalkan.");

    const updated: Booking = { ...booking, status: "CANCELLED" };
    const ticket = db.eTickets.find((t) => t.bookingId === id);

    mutateDB((d) => ({
      ...d,
      bookings: d.bookings.map((b) => (b.id === id ? updated : b)),
      eTickets: d.eTickets.map((t) => (t.bookingId === id ? { ...t, status: "CANCELLED" as const } : t)),
      payments: d.payments.map((p) =>
        p.bookingId === id && p.status === "PAID" ? { ...p, status: "REFUNDED" as const } : p
      ),
    }));

    void reason;
    void ticket;
    return updated;
  },

  /** Admin: ubah status booking secara manual (simulasi operasional). */
  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    await delay(200);
    const db = getDB();
    const booking = db.bookings.find((b) => b.id === id);
    if (!booking) throw new BookingError("Booking tidak ditemukan.");

    mutateDB((d) => ({
      ...d,
      bookings: d.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
      // Sinkronkan e-tiket supaya scanner tahu status terbaru.
      eTickets: d.eTickets.map((t) =>
        t.bookingId === id
          ? { ...t, status: status === "USED" ? "USED" : status === "CANCELLED" ? "CANCELLED" : status === "EXPIRED" ? "EXPIRED" : t.status }
          : t
      ),
    }));

    return { ...booking, status };
  },
};

// ---------------------------------------------------------------------------
// PAYMENT SERVICE (mock QRIS)
// ---------------------------------------------------------------------------

export type PaymentOutcome = "SUCCESS" | "FAILED" | "EXPIRED";

export const paymentService = {
  async getByBookingId(bookingId: string): Promise<Payment | null> {
    await delay(150);
    return getDB().payments.find((p) => p.bookingId === bookingId) ?? null;
  },

  async listAll(): Promise<Payment[]> {
    await delay(250);
    return [...getDB().payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /**
   * Simulasi proses pembayaran QRIS: PENDING → PROCESSING → hasil.
   * Outcome demo dapat dipaksa (FAILED/EXPIRED) untuk menguji alur error.
   */
  async processPayment(bookingId: string, forced?: PaymentOutcome): Promise<{ booking: Booking; payment: Payment; outcome: PaymentOutcome }> {
    await delay(600); // simulasi "memproses..."

    const db = getDB();
    const booking = db.bookings.find((b) => b.id === bookingId);
    if (!booking) throw new BookingError("Booking tidak ditemukan.");
    const payment = db.payments.find((p) => p.bookingId === bookingId);
    if (!payment) throw new BookingError("Data pembayaran tidak ditemukan.");

    if (booking.status !== "PENDING") throw new BookingError("Booking ini sudah diproses sebelumnya.");

    // Kadaluarsa: melewati expiredAt → EXPIRED.
    const now = Date.now();
    const outcome: PaymentOutcome =
      forced ??
      (new Date(payment.expiredAt).getTime() < now
        ? "EXPIRED"
        : Math.random() < Number(BOOKING_CONFIG.paymentSuccessRate)
          ? "SUCCESS"
          : "FAILED");

    // Notifikasi dibuat lebih dulu agar semua cabang outcome bisa memakainya.
    const successNotification: AppNotification = {
      id: `ntf-${Date.now()}`,
      title: "Pembayaran berhasil",
      message: `Pembayaran ${booking.id} dikonfirmasi via QRIS (${rupiah(booking.total)}). E-tiket diterbitkan.`,
      type: "payment",
      status: "Berhasil",
      createdAt: new Date().toISOString(),
      read: false,
    };

    const failedNotification: AppNotification = {
      id: `ntf-${Date.now()}`,
      title: "Pembayaran gagal",
      message: `Pembayaran ${booking.id} gagal diproses.`,
      type: "payment",
      status: "Gagal",
      createdAt: new Date().toISOString(),
      read: false,
    };

    if (outcome === "FAILED") {
      const failedPayment: Payment = { ...payment, status: "FAILED" };
      mutateDB((d) => ({
        ...d,
        payments: d.payments.map((p) => (p.id === payment.id ? failedPayment : p)),
        notifications: [failedNotification, ...d.notifications],
      }));
      return { booking, payment: failedPayment, outcome };
    }

    if (outcome === "EXPIRED") {
      const expiredPayment: Payment = { ...payment, status: "EXPIRED" };
      mutateDB((d) => ({
        ...d,
        payments: d.payments.map((p) => (p.id === payment.id ? expiredPayment : p)),
        bookings: d.bookings.map((b) => (b.id === bookingId ? { ...b, status: "EXPIRED" as const } : b)),
      }));
      return { booking: { ...booking, status: "EXPIRED" }, payment: expiredPayment, outcome };
    }

    // --- SUCCESS: payment PAID → booking CONFIRMED → e-tiket VALID ---
    const paidAt = new Date().toISOString();
    const paidPayment: Payment = { ...payment, status: "PAID", paidAt };
    const confirmedBooking: Booking = { ...booking, status: "CONFIRMED" };

    // E-tiket per jenis tiket — pakai tiket utama (kuantitas terbesar) untuk QR.
    const mainItem = [...booking.items].sort((a, b) => b.quantity - a.quantity)[0] ?? booking.items[0];
    if (!mainItem) throw new BookingError("Data item booking tidak valid.");
    const ticket: ETicket = {
      id: generateTicketId(),
      bookingId: booking.id,
      visitorName: booking.visitorName,
      email: booking.email,
      visitDate: booking.visitDate,
      ticketName: mainItem.ticketName,
      quantity: booking.totalTickets,
      total: booking.total,
      status: "VALID",
      generatedAt: paidAt,
    };

    mutateDB((d) => ({
      ...d,
      payments: d.payments.map((p) => (p.id === payment.id ? paidPayment : p)),
      bookings: d.bookings.map((b) => (b.id === bookingId ? { ...confirmedBooking, ticketId: ticket.id } : b)),
      eTickets: [ticket, ...d.eTickets],
      notifications: [successNotification, ...d.notifications],
    }));

    return { booking: { ...confirmedBooking, ticketId: ticket.id }, payment: paidPayment, outcome };
  },

  /** Pengunjung membatalkan pembayaran yang tertunda (menandai EXPIRED). */
  async expirePayment(bookingId: string): Promise<void> {
    await delay(150);
    mutateDB((d) => ({
      ...d,
      payments: d.payments.map((p) => (p.bookingId === bookingId && p.status === "PENDING" ? { ...p, status: "EXPIRED" } : p)),
      bookings: d.bookings.map((b) => (b.id === bookingId && b.status === "PENDING" ? { ...b, status: "EXPIRED" as const } : b)),
    }));
  },
};

// ---------------------------------------------------------------------------
// E-TICKET SERVICE
// ---------------------------------------------------------------------------

export const eTicketService = {
  async listMine(): Promise<ETicket[]> {
    await delay(250);
    const user = useAuthStore.getState().user;
    if (!user) return [];
    const bookings = getDB().bookings.filter(
      (b) => b.userId === user.id || b.email.toLowerCase() === user.email.toLowerCase()
    );
    const ids = new Set(bookings.map((b) => b.id));
    return getDB().eTickets.filter((t) => ids.has(t.bookingId));
  },

  async getByBookingId(bookingId: string): Promise<{ ticket: ETicket; booking: Booking } | null> {
    await delay(200);
    const db = getDB();
    const ticket = db.eTickets.find((t) => t.bookingId === bookingId);
    const booking = db.bookings.find((b) => b.id === bookingId);
    if (!ticket || !booking) return null;
    return { ticket, booking };
  },

  /** Tandai tiket sudah dicetak/unduh (notif + statistik download). */
  async markDownloaded(bookingId: string): Promise<void> {
    await delay(100);
    const db = getDB();
    const booking = db.bookings.find((b) => b.id === bookingId);
    if (booking) {
      mutateDB((d) => ({
        ...d,
        notifications: [
          {
            id: `ntf-${Date.now()}`,
            title: "Tiket diunduh",
            message: `E-tiket ${bookingId} telah diunduh oleh ${booking.visitorName}.`,
            type: "ticket" as const,
            status: "Berhasil" as const,
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...d.notifications,
        ],
      }));
    }
  },
};

/** Ringkasan order untuk halaman payment/success (helper sinkron). */
export function summarizeBooking(b: Booking): { label: string; qty: number; amount: number }[] {
  return b.items.map((i) => ({ label: i.ticketName, qty: i.quantity, amount: i.price * i.quantity }));
}

export { rupiah };
