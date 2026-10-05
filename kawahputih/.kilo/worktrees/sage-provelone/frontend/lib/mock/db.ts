import type {
  AppNotification,
  Booking,
  BookingItem,
  BookingStatus,
  ETicket,
  LocalAccount,
  Payment,
  PaymentStatus,
  ScanRecord,
  Staff,
  Ticket,
  Visitor,
} from "@/types/domain";
import { MOCK_DB_STORAGE_KEY } from "@/config/app.config";
import {
  addDaysISO,
  calculateBookingTotals,
  generateBookingId,
  generatePaymentId,
  generateTicketId,
  randomInt,
  todayISO,
} from "@/lib/business";

// ============================================================================
// MOCK DB — "database" in-memory yang dipersist ke localStorage.
//
// Semua modul (booking, payment, e-ticket, admin, manager, petugas) membaca &
// menulis ke SATU sumber data ini, sehingga:
//   booking baru → payment → PAID → booking CONFIRMED → e-tiket VALID
//   → dashboard admin naik → analytics manager naik → petugas bisa scan.
//
// Future backend: ganti file ini dengan API calls; bentuk tipe sudah sama.
// ============================================================================

export interface MockDB {
  tickets: Ticket[];
  bookings: Booking[];
  payments: Payment[];
  eTickets: ETicket[];
  visitors: Visitor[];
  staff: Staff[];
  scanHistory: ScanRecord[];
  notifications: AppNotification[];
  accounts: LocalAccount[];
  /** Penghitung seed — dipakai untuk mendeteksi DB lama yang perlu re-seed. */
  version: number;
}

export const MOCK_DB_VERSION = 3;

// ---------------------------------------------------------------------------
// SEED DATA
// ---------------------------------------------------------------------------

const seedTickets = (): Ticket[] => [
  { id: "tkt-reguler", name: "Tiket Reguler", description: "Akses masuk kawasan Kawah Putih", price: 31000, capacity: 1000, status: "AKTIF", createdAt: "2025-01-01T08:00:00.000Z" },
  { id: "tkt-vip", name: "Tiket VIP", description: "Akses prioritas + guide pribadi", price: 90000, capacity: 200, status: "AKTIF", createdAt: "2025-01-01T08:00:00.000Z" },
  { id: "tkt-anak", name: "Tiket Anak", description: "Anak usia 3-10 tahun", price: 20000, capacity: 300, status: "AKTIF", createdAt: "2025-01-01T08:00:00.000Z" },
  { id: "tkt-rombongan", name: "Tiket Rombongan", description: "Grup minimal 20 orang", price: 27000, capacity: 500, status: "AKTIF", createdAt: "2025-01-01T08:00:00.000Z" },
  { id: "tkt-parkir", name: "Tiket Parkir", description: "Biaya parkir kendaraan roda empat", price: 22000, capacity: 400, status: "AKTIF", createdAt: "2025-01-01T08:00:00.000Z" },
  { id: "tkt-ontang", name: "Ontang Anting", description: "Wahana bersejarah berkeliling kawah", price: 32000, capacity: 150, status: "AKTIF", createdAt: "2025-01-01T08:00:00.000Z" },
  { id: "tkt-kuda", name: "Kuda Tunggang", description: "Berkuda di area persawahan", price: 55000, capacity: 60, status: "AKTIF", createdAt: "2025-01-01T08:00:00.000Z" },
  { id: "tkt-panahan", name: "Panahan", description: "Sesi panahan 30 menit", price: 22000, capacity: 40, status: "NONAKTIF", createdAt: "2025-01-01T08:00:00.000Z" },
  { id: "tkt-sunan", name: "Sunan Ibu", description: "Spot foto sunset Sunan Ibu", price: 15000, capacity: 100, status: "AKTIF", createdAt: "2025-01-01T08:00:00.000Z" },
  { id: "tkt-lhkp", name: "LHKP", description: "Lintas Hutan Kawah Putih (trekking)", price: 179000, capacity: 50, status: "AKTIF", createdAt: "2025-01-01T08:00:00.000Z" },
  { id: "tkt-manca", name: "HTM Mancanegara", description: "Wisatawan asing", price: 90000, capacity: 100, status: "AKTIF", createdAt: "2025-01-01T08:00:00.000Z" },
  { id: "tkt-apung", name: "Jembatan Apung", description: "Atraksi jembatan apung danau", price: 35000, capacity: 80, status: "AKTIF", createdAt: "2025-01-01T08:00:00.000Z" },
];

const SEED_NAMES = [
  "Budi Santoso", "Siti Nurhaliza", "Andi Pratama", "Rina Marina", "Dewi Lestari",
  "Agus Wijaya", "Rina Kartika", "Dena Ramadhan", "Hexa Anugerah", "Udin Saputra",
  "Aep Kurnia", "Fitri Handayani", "Gilang Prakasa", "Hana Zahira", "Irfan Maulana",
  "Joko Susilo", "Kartika Ayu", "Lukman Hakim", "Maya Puspita", "Nanda Pratama",
  "Oki Setiawan", "Putri Amelia", "Qori Ramadhani", "Rizky Dracin", "Salsabila Azka",
];

const seedStaff = (): Staff[] => [
  { id: "stf-1", name: "Deni Saputra", email: "deni@kawahputih.com", phone: "081300000001", role: "PETUGAS GERBANG", shift: "PAGI", gate: "Gerbang 1", status: "AKTIF", lastLogin: "2026-10-03T06:45:00.000Z" },
  { id: "stf-2", name: "Sari Dewi", email: "sari@kawahputih.com", phone: "081300000002", role: "PETUGAS GERBANG", shift: "PAGI", gate: "Gerbang 2", status: "AKTIF", lastLogin: "2026-10-03T06:50:00.000Z" },
  { id: "stf-3", name: "Ricky Maulana", email: "ricky@kawahputih.com", phone: "081300000003", role: "PETUGAS TIKET", shift: "SIANG", gate: "Booth Tengah", status: "AKTIF", lastLogin: "2026-10-02T11:10:00.000Z" },
  { id: "stf-4", name: "Agus Setiawan", email: "agus@kawahputih.com", phone: "081300000004", role: "SUPERVISOR", shift: "PAGI", gate: "Kantor", status: "NONAKTIF", lastLogin: "2026-09-28T07:00:00.000Z" },
  { id: "stf-5", name: "Lina Marlina", email: "lina@kawahputih.com", phone: "081300000005", role: "PETUGAS TIKET", shift: "SIANG", gate: "Booth Timur", status: "AKTIF", lastLogin: "2026-10-03T10:30:00.000Z" },
  { id: "stf-6", name: "Bambang Priyono", email: "bambang@kawahputih.com", phone: "081300000006", role: "PETUGAS GERBANG", shift: "MALAM", gate: "Gerbang 3", status: "AKTIF", lastLogin: "2026-10-01T19:20:00.000Z" },
  { id: "stf-7", name: "Citra Kirana", email: "citra@kawahputih.com", phone: "081300000007", role: "SUPERVISOR", shift: "SIANG", gate: "Kantor", status: "AKTIF", lastLogin: "2026-10-03T08:05:00.000Z" },
  { id: "stf-8", name: "Eko Nugroho", email: "eko@kawahputih.com", phone: "081300000008", role: "PETUGAS TIKET", shift: "MALAM", gate: "Booth Barat", status: "NONAKTIF", lastLogin: "2026-09-20T17:40:00.000Z" },
  { id: "stf-9", name: "Farah Diba", email: "farah@kawahputih.com", phone: "081300000009", role: "PETUGAS GERBANG", shift: "PAGI", gate: "Gerbang 1", status: "AKTIF", lastLogin: "2026-10-02T06:55:00.000Z" },
  { id: "stf-10", name: "Gunawan Halim", email: "gunawan@kawahputih.com", phone: "081300000010", role: "SUPERVISOR", shift: "MALAM", gate: "Kantor", status: "AKTIF", lastLogin: "2026-09-30T18:00:00.000Z" },
];

function seedBookings(): { bookings: Booking[]; payments: Payment[]; eTickets: ETicket[]; visitors: Visitor[] } {
  const bookings: Booking[] = [];
  const payments: Payment[] = [];
  const eTickets: ETicket[] = [];
  const visitorMap = new Map<string, Visitor>();

  const statuses: BookingStatus[] = [
    "CONFIRMED", "CONFIRMED", "CONFIRMED", "USED", "USED", "PAID", "PENDING",
    "CANCELLED", "EXPIRED", "CONFIRMED", "USED", "CONFIRMED", "PAID", "CANCELLED",
    "CONFIRMED", "EXPIRED", "USED", "CONFIRMED", "PENDING", "CONFIRMED",
  ];

  for (let i = 0; i < 24; i++) {
    const name = SEED_NAMES[i % SEED_NAMES.length] ?? "Tamu";
    const email = `${name.toLowerCase().replace(/\s+/g, ".")}${i}@gmail.com`;
    const phone = `08${randomInt(1111111111, 9999999999)}`;
    // Sebar booking dari -20 hari sampai +12 hari.
    const offset = i < 16 ? -randomInt(0, 20) : randomInt(1, 12);
    const visitDate = addDaysISO(todayISO(), offset);
    const createdOffset = offset >= 0 ? -randomInt(0, 2) : offset;
    const createdAt = `${addDaysISO(todayISO(), createdOffset)}T0${randomInt(7, 9)}:${String(randomInt(10, 59))}:00.000Z`;

    const t1 = { ticketId: "tkt-reguler", ticketName: "Tiket Reguler", price: 31000, quantity: randomInt(1, 5) };
    const extras: BookingItem[] = [
      { ticketId: "tkt-vip", ticketName: "Tiket VIP", price: 90000, quantity: 1 },
      { ticketId: "tkt-anak", ticketName: "Tiket Anak", price: 20000, quantity: randomInt(1, 3) },
      { ticketId: "tkt-ontang", ticketName: "Ontang Anting", price: 32000, quantity: 1 },
    ];
    const extra = extras[randomInt(0, 2)] ?? extras[0];
    const items: BookingItem[] = randomInt(0, 10) > 6 && extra ? [t1, extra] : [t1];
    const totals = calculateBookingTotals(items);

    const id = generateBookingId(visitDate);
    const status = statuses[i % statuses.length] ?? "CONFIRMED";
    const booking: Booking = {
      id, userId: `seed-usr-${(i % 10) + 1}`, visitorName: name, email, phone,
      visitDate, items, ...totals, status, createdAt,
      ticketId: null, checkedInAt: undefined,
    };

    // Payment: PENDING/PENDING_PAYMENT → PENDING, EXPIRED booking → EXPIRED, lainnya PAID.
    const paymentStatus: PaymentStatus =
      status === "PENDING" ? (randomInt(0, 1) ? "PENDING" : "PROCESSING") :
      status === "EXPIRED" ? "EXPIRED" :
      status === "CANCELLED" ? (randomInt(0, 1) ? "REFUNDED" : "FAILED") : "PAID";

    const payment: Payment = {
      id: generatePaymentId(visitDate),
      bookingId: id,
      method: "QRIS",
      amount: totals.total,
      status: paymentStatus,
      createdAt,
      paidAt: paymentStatus === "PAID" ? createdAt : undefined,
      expiredAt: `${visitDate}T23:59:59.000Z`,
    };
    payments.push(payment);

    // E-tiket: hanya untuk booking CONFIRMED/USED.
    const firstItem = items[0];
    if ((status === "CONFIRMED" || status === "USED") && firstItem) {
      const ticketId = generateTicketId();
      const et: ETicket = {
        id: ticketId, bookingId: id, visitorName: name, email,
        visitDate, ticketName: firstItem.ticketName, quantity: totals.totalTickets,
        total: totals.total,
        status: status === "USED" ? "USED" : "VALID",
        generatedAt: createdAt,
        checkedInAt: status === "USED" ? createdAt : undefined,
        checkedInGate: status === "USED" ? "Gerbang 1" : undefined,
      };
      eTickets.push(et);
      booking.ticketId = ticketId;
    }

    bookings.push(booking);

    if (!visitorMap.has(email)) {
      visitorMap.set(email, { id: `vis-${i + 1}`, name, email, phone, joinedAt: createdAt });
    }
  }

  return { bookings, payments, eTickets, visitors: [...visitorMap.values()] };
}

const seedScanHistory = (bookings: Booking[], eTickets: ETicket[]): ScanRecord[] => {
  const used = eTickets.filter((t) => t.status === "USED");
  const records: ScanRecord[] = [];
  for (let i = 0; i < Math.max(20, used.length); i++) {
    const et = used[i % Math.max(1, used.length)];
    if (!et) continue;
    const booking = bookings.find((b) => b.id === et.bookingId);
    const ts = new Date(Date.now() - randomInt(1, 20) * 86_400_000 - randomInt(0, 8) * 3_600_000).toISOString();
    records.push({
      id: `scan-${i + 1}`,
      ticketId: et.id,
      bookingId: et.bookingId,
      visitorName: booking?.visitorName ?? "Tamu",
      timestamp: ts,
      gate: `Gerbang ${randomInt(1, 3)}`,
      petugas: `Petugas ${((i % 4) + 1).toString().padStart(2, "0")}`,
      status: i % 7 === 6 ? "SUDAH DIGUNAKAN" : "VALID",
    });
  }
  return records;
};

const seedNotifications = (): AppNotification[] => [
  { id: "ntf-1", title: "Booking baru", message: "Booking KP-20261003-000111 telah dibuat oleh Siti Nurhaliza.", type: "booking", status: "Berhasil", createdAt: "2026-10-03T08:32:00.000Z", read: false },
  { id: "ntf-2", title: "Pembayaran berhasil", message: "Pembayaran KP-20261003-000110 dikonfirmasi via QRIS.", type: "payment", status: "Berhasil", createdAt: "2026-10-03T08:41:00.000Z", read: false },
  { id: "ntf-3", title: "Tiket digunakan", message: "Tiket TK-A1B2C3 discan di Gerbang 1.", type: "ticket", status: "Berhasil", createdAt: "2026-10-03T09:05:00.000Z", read: true },
  { id: "ntf-4", title: "Pembayaran gagal", message: "Pembayaran KP-20261002-000109 gagal diproses.", type: "payment", status: "Gagal", createdAt: "2026-10-02T15:44:00.000Z", read: true },
];

function createSeedDB(): MockDB {
  const { bookings, payments, eTickets, visitors } = seedBookings();
  return {
    tickets: seedTickets(),
    bookings,
    payments,
    eTickets,
    visitors,
    staff: seedStaff(),
    scanHistory: seedScanHistory(bookings, eTickets),
    notifications: seedNotifications(),
    accounts: [],
    version: MOCK_DB_VERSION,
  };
}

// ---------------------------------------------------------------------------
// STORE + REACTIVITY
// ---------------------------------------------------------------------------

let cache: MockDB | null = null;
const listeners = new Set<() => void>();

function loadFromStorage(): MockDB {
  if (typeof window === "undefined") return createSeedDB();
  try {
    const raw = window.localStorage.getItem(MOCK_DB_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MockDB;
      if (parsed.version === MOCK_DB_VERSION) return parsed;
    }
  } catch {
    // ignore corrupt storage
  }
  return createSeedDB();
}

function persist(db: MockDB) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(db));
  } catch {
    // storage penuh dsb — abaikan, aplikasi tetap jalan in-memory
  }
}

export function getDB(): MockDB {
  if (!cache) {
    cache = loadFromStorage();
  }
  return cache;
}

function setDB(next: MockDB) {
  cache = next;
  persist(next);
  listeners.forEach((l) => l());
}

/** Subscribe ke perubahan DB (dipakai useMockDB / sinkronisasi antar halaman). */
export function subscribeDB(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshotDB(): MockDB {
  return getDB();
}

/** Mutasi atomik: ambil DB terbaru, ubah, simpan + broadcast. */
export function mutateDB(fn: (db: MockDB) => MockDB): void {
  setDB(fn(getDB()));
}

// ---------------------------------------------------------------------------
// RESET DEMO DATA
// ---------------------------------------------------------------------------

export function resetMockDB() {
  setDB(createSeedDB());
}
