import { getDB, mutateDB } from "@/lib/mock/db";
import { todayISO, daysBetween, randomInt } from "@/lib/business";
import { useAuthStore } from "@/store/auth.store";
import type { Booking, Payment, ScanRecord, Staff, Ticket, Visitor } from "@/types/domain";

// ============================================================================
// DASHBOARD SERVICE — statistik admin dihitung dari mock DB (bukan angka
// ketikan). Semua modul panel membaca dari sini sehingga selalu sinkron.
// ============================================================================

const PAID_STATUSES = new Set(["PAID"]);
const REVENUE_BOOKING_STATUSES = new Set(["PAID", "CONFIRMED", "USED"]);

export interface AdminDashboardStats {
  totalBookings: number;
  totalTicketsSold: number;
  revenue: number;
  totalVisitors: number;
  bookingsToday: number;
  revenueToday: number;
  ticketsAvailable: number;
  pendingPayments: number;
}

export const adminService = {
  /** Statistik dashboard dihitung langsung dari bookings/payments/eTickets. */
  getDashboardStats(): AdminDashboardStats {
    const db = getDB();
    const today = todayISO();

    const counted = db.bookings.filter((b) => REVENUE_BOOKING_STATUSES.has(b.status));
    const revenue = counted.reduce((sum, b) => sum + b.total, 0);
    const ticketsSold = counted.reduce((sum, b) => sum + b.totalTickets, 0);
    const bookingsToday = db.bookings.filter((b) => b.createdAt.slice(0, 10) === today).length;
    const revenueToday = db.bookings
      .filter((b) => REVENUE_BOOKING_STATUSES.has(b.status) && b.createdAt.slice(0, 10) === today)
      .reduce((sum, b) => sum + b.total, 0);
    const ticketsAvailable = db.tickets
      .filter((t) => t.status === "AKTIF")
      .reduce((sum, t) => sum + t.capacity, 0);
    const pendingPayments = db.payments.filter((p) => p.status === "PENDING" || p.status === "PROCESSING").length;

    return {
      totalBookings: db.bookings.length,
      totalTicketsSold: ticketsSold,
      revenue,
      totalVisitors: db.visitors.length,
      bookingsToday,
      revenueToday,
      ticketsAvailable,
      pendingPayments,
    };
  },

  listTickets(): Ticket[] {
    return [...getDB().tickets];
  },

  listBookings(): Booking[] {
    return [...getDB().bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  listPayments(): Payment[] {
    return [...getDB().payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  listVisitors(): (Visitor & { totalBookings: number; totalSpent: number; lastVisit: string | null })[] {
    return getDB().visitors.map((v) => {
      const bookings = getDB().bookings.filter((b) => b.email.toLowerCase() === v.email.toLowerCase());
      const spent = bookings
        .filter((b) => REVENUE_BOOKING_STATUSES.has(b.status))
        .reduce((sum, b) => sum + b.total, 0);
      const lastVisit = bookings
        .map((b) => b.visitDate)
        .sort()
        .pop() ?? null;
      return { ...v, totalBookings: bookings.length, totalSpent: spent, lastVisit };
    });
  },

  listStaff(): Staff[] {
    return [...getDB().staff];
  },

  listScanHistory(): ScanRecord[] {
    return [...getDB().scanHistory].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  listNotifications() {
    return [...getDB().notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  // -------------------------------------------------------------------------
  // COMMANDS (simulasi operasional admin — hanya state lokal)
  // -------------------------------------------------------------------------

  upsertTicket(ticket: Ticket): void {
    const exists = getDB().tickets.some((t) => t.id === ticket.id);
    mutateDB((d) => ({
      ...d,
      tickets: exists ? d.tickets.map((t) => (t.id === ticket.id ? ticket : t)) : [{ ...ticket }, ...d.tickets],
    }));
  },

  setTicketStatus(id: string, status: Ticket["status"]): void {
    mutateDB((d) => ({
      ...d,
      tickets: d.tickets.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
  },

  updateBookingStatus(id: string, status: Booking["status"]): void {
    mutateDB((d) => ({
      ...d,
      bookings: d.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
      eTickets: d.eTickets.map((t) =>
        t.bookingId === id
          ? { ...t, status: status === "USED" ? "USED" as const : status === "CANCELLED" ? "CANCELLED" as const : status === "EXPIRED" ? "EXPIRED" as const : t.status }
          : t
      ),
    }));
  },

  updatePaymentStatus(id: string, status: Payment["status"]): void {
    mutateDB((d) => ({
      ...d,
      payments: d.payments.map((p) => (p.id === id ? { ...p, status } : p)),
    }));
  },

  setStaffStatus(id: string, status: Staff["status"]): void {
    mutateDB((d) => ({
      ...d,
      staff: d.staff.map((s) => (s.id === id ? { ...s, status } : s)),
    }));
  },

  upsertStaff(staff: Staff): void {
    const exists = getDB().staff.some((s) => s.id === staff.id);
    mutateDB((d) => ({
      ...d,
      staff: exists ? d.staff.map((s) => (s.id === staff.id ? staff : s)) : [{ ...staff }, ...d.staff],
    }));
  },

  markNotificationsRead(): void {
    mutateDB((d) => ({
      ...d,
      notifications: d.notifications.map((n) => ({ ...n, read: true })),
    }));
  },
};

// ---------------------------------------------------------------------------
// MANAGER ANALYTICS — dihitung dari data booking riil (bukan hardcode).
// ---------------------------------------------------------------------------

export type DateRangePreset = "today" | "7d" | "30d" | "month" | "custom";

export interface ManagerAnalytics {
  summary: {
    totalRevenue: number;
    revenueToday: number;
    totalBookings: number;
    activeStaff: number;
    totalVisitors: number;
    avgBookingValue: number;
    conversionRate: number;
  };
  changes: { revenue: number; bookings: number; visitors: number };
  revenueTrend: { label: string; value: number }[];
  bookingTrend: { label: string; value: number }[];
  weekdayVsWeekend: { label: string; value: number }[];
  ticketTypePerformance: { label: string; value: number }[];
  paymentStatus: { label: string; value: number }[];
  dailyRows: { date: string; bookings: number; tickets: number; revenue: number; visitors: number; paymentStatus: string }[];
  rangeLabel: string;
}

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export const managerService = {
  getAnalytics(range: DateRangePreset, custom?: { from: string; to: string }): ManagerAnalytics {
    const db = getDB();
    const today = todayISO();

    // Tentukan window tanggal.
    let from: string;
    let to: string = today;
    let prevFrom: string;
    let prevTo: string;
    let label: string;

    switch (range) {
      case "today":
        from = today;
        prevFrom = prevTo = daysBefore(today, 1);
        label = "Hari ini";
        break;
      case "7d":
        from = daysBefore(today, 6);
        prevFrom = daysBefore(today, 13);
        prevTo = daysBefore(today, 7);
        label = "7 hari terakhir";
        break;
      case "30d":
        from = daysBefore(today, 29);
        prevFrom = daysBefore(today, 59);
        prevTo = daysBefore(today, 30);
        label = "30 hari terakhir";
        break;
      case "month": {
        const d = new Date(`${today}T00:00:00`);
        from = `${today.slice(0, 7)}-01`;
        const pm = new Date(d.getFullYear(), d.getMonth() - 1, 1);
        prevFrom = `${pm.getFullYear()}-${String(pm.getMonth() + 1).padStart(2, "0")}-01`;
        const pmLast = new Date(d.getFullYear(), d.getMonth(), 0);
        prevTo = `${pmLast.getFullYear()}-${String(pmLast.getMonth() + 1).padStart(2, "0")}-${String(pmLast.getDate()).padStart(2, "0")}`;
        label = "Bulan ini";
        break;
      }
      case "custom":
        from = custom?.from ?? today;
        to = custom?.to ?? today;
        prevFrom = daysBefore(from, daysBetween(from, to) + 1);
        prevTo = daysBefore(from, 1);
        label = `${from} s/d ${to}`;
        break;
    }

    const inRange = (date: string, f: string, t: string) => date >= f && date <= t;

    const currentBookings = db.bookings.filter((b) => inRange(b.visitDate, from, to) && REVENUE_BOOKING_STATUSES.has(b.status));
    const prevBookings = db.bookings.filter((b) => inRange(b.visitDate, prevFrom, prevTo) && REVENUE_BOOKING_STATUSES.has(b.status));

    const revenue = currentBookings.reduce((s, b) => s + b.total, 0);
    const prevRevenue = prevBookings.reduce((s, b) => s + b.total, 0);
    const revenueToday = db.bookings
      .filter((b) => b.visitDate === today && REVENUE_BOOKING_STATUSES.has(b.status))
      .reduce((s, b) => s + b.total, 0);

    const totalTickets = currentBookings.reduce((s, b) => s + b.totalTickets, 0);
    const totalVisitors = currentBookings.reduce((s, b) => s + b.totalTickets, 0);

    // Tren harian dalam window.
    const dayCount = Math.max(1, daysBetween(from, to) + 1);
    const bucketCount = Math.min(dayCount, range === "today" ? 1 : dayCount > 31 ? 31 : dayCount);
    const step = Math.max(1, Math.ceil(dayCount / bucketCount));

    const revenueTrend: { label: string; value: number }[] = [];
    const bookingTrend: { label: string; value: number }[] = [];
    const dailyRows: ManagerAnalytics["dailyRows"] = [];

    for (let i = 0; i < dayCount; i += step) {
      const d = daysBefore(to, dayCount - 1 - i);
      const dEnd = daysBefore(to, Math.max(0, dayCount - i - step));
      const bucket = db.bookings.filter((b) => b.visitDate >= d && b.visitDate <= dEnd && REVENUE_BOOKING_STATUSES.has(b.status));
      const bRevenue = bucket.reduce((s, b) => s + b.total, 0);
      const bTickets = bucket.reduce((s, b) => s + b.totalTickets, 0);
      const lbl = range === "today" ? "Hari ini" : d.slice(5);
      revenueTrend.push({ label: lbl, value: bRevenue });
      bookingTrend.push({ label: lbl, value: bucket.length });
      dailyRows.push({
        date: d,
        bookings: bucket.length,
        tickets: bTickets,
        revenue: bRevenue,
        visitors: bTickets,
        paymentStatus: bucket.length ? "PAID" : "-",
      });
    }

    // Weekday vs Weekend (dari booking dalam window).
    let weekdayTickets = 0;
    let weekendTickets = 0;
    currentBookings.forEach((b) => {
      const day = new Date(`${b.visitDate}T00:00:00`).getDay(); // 0=Minggu
      if (day === 0 || day === 6) weekendTickets += b.totalTickets;
      else weekdayTickets += b.totalTickets;
    });

    // Kinerja jenis tiket.
    const ticketMap = new Map<string, number>();
    currentBookings.forEach((b) => b.items.forEach((i) => ticketMap.set(i.ticketName, (ticketMap.get(i.ticketName) ?? 0) + i.quantity)));
    const ticketTypePerformance = [...ticketMap.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Status pembayaran dalam window.
    const payMap = new Map<string, number>();
    db.payments
      .filter((p) => inRange(p.createdAt.slice(0, 10), from, to))
      .forEach((p) => payMap.set(p.status, (payMap.get(p.status) ?? 0) + 1));
    const paymentStatus = ["PAID", "PENDING", "FAILED", "EXPIRED", "REFUNDED"].map((s) => ({
      label: s,
      value: payMap.get(s) ?? 0,
    }));

    const totalBookingsInRange = currentBookings.length;
    const allVisitors = db.visitors.length;

    return {
      summary: {
        totalRevenue: revenue,
        revenueToday,
        totalBookings: totalBookingsInRange,
        activeStaff: db.staff.filter((s) => s.status === "AKTIF").length,
        totalVisitors,
        avgBookingValue: totalBookingsInRange > 0 ? Math.round(revenue / totalBookingsInRange) : 0,
        conversionRate: allVisitors > 0 ? Math.round((totalBookingsInRange / allVisitors) * 1000) / 10 : 0,
      },
      changes: {
        revenue: pctChange(revenue, prevRevenue),
        bookings: pctChange(totalBookingsInRange, prevBookings.length),
        visitors: pctChange(totalVisitors, prevBookings.reduce((s, b) => s + b.totalTickets, 0)),
      },
      revenueTrend,
      bookingTrend,
      weekdayVsWeekend: [
        { label: "Weekday", value: weekdayTickets },
        { label: "Weekend", value: weekendTickets },
      ],
      ticketTypePerformance,
      paymentStatus,
      dailyRows,
      rangeLabel: label,
    };
  },
};

function daysBefore(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// Re-exports yang lama agar import lain tidak rusak.
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  is_verified: boolean;
  roles: string[];
}

export { randomInt };
export const getCurrentUser = () => useAuthStore.getState().user;
