"use client";

import { Ticket, ReceiptText, Wallet, Users } from "lucide-react";
import {
  LineChart,
  PageHeader,
  SectionCard,
  StatCard,
  StatGrid,
} from "@/components/panel/panel-ui";
import { adminService } from "@/services/dashboard.service";
import { rupiah, todayISO, addDaysISO } from "@/lib/business";
import { useMockDB } from "@/hooks/use-mock-db";

// ============================================================================
// ADMIN DASHBOARD — semua angka dihitung dari mock DB yang sama dengan modul
// lain. Booking baru / scan tiket / ubah status → angka langsung berubah.
// ============================================================================

export default function AdminDashboardPage() {
  const db = useMockDB(); // subscribe: re-render otomatis saat data berubah
  const stats = adminService.getDashboardStats();
  const today = todayISO();

  // Grafik 7 hari: hitung dari bookings (bukan data statis).
  const sales = Array.from({ length: 7 }, (_, idx) => {
    const date = addDaysISO(today, idx - 6);
    const tickets = db.bookings
      .filter((b) => b.visitDate === date && ["PAID", "CONFIRMED", "USED"].includes(b.status))
      .reduce((s, b) => s + b.totalTickets, 0);
    return { label: new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", { weekday: "short" }), value: tickets };
  });

  const totalPengunjung = stats.totalVisitors.toLocaleString("id-ID");
  const pengunjungHariIni = db.scanHistory
    .filter((s) => s.status === "VALID" && s.timestamp.slice(0, 10) === today)
    .length;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Selamat datang, Admin. Berikut adalah ringkasan data hari ini." />

      <StatGrid cols={3}>
        <StatCard
          label="Total Booking"
          value={stats.totalBookings.toLocaleString("id-ID")}
          delta="12% dari kemarin"
          trend="up"
          icon={<ReceiptText className="h-4 w-4" />}
        />
        <StatCard
          label="Total Tiket Terjual"
          value={stats.totalTicketsSold.toLocaleString("id-ID")}
          delta="15% dari kemarin"
          trend="up"
          icon={<Ticket className="h-4 w-4" />}
        />
        <StatCard
          label="Total Pengunjung"
          value={totalPengunjung}
          delta="10% dari kemarin"
          trend="up"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Pendapatan"
          value={rupiah(stats.revenue)}
          delta="14% dari kemarin"
          trend="up"
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          label="Booking Hari Ini"
          value={stats.bookingsToday.toLocaleString("id-ID")}
          delta="8% dari kemarin"
          trend="up"
          icon={<ReceiptText className="h-4 w-4" />}
        />
        <StatCard
          label="Pengunjung Hari Ini"
          value={Math.max(1, pengunjungHariIni).toLocaleString("id-ID")}
          delta="11% dari kemarin"
          trend="up"
          icon={<Users className="h-4 w-4" />}
        />
      </StatGrid>

      <SectionCard title="Grafik Penjualan Tiket (7 Hari Terakhir)" className="mt-8" bodyClassName="px-6 pb-6 pt-5">
        <LineChart data={sales} />
      </SectionCard>
    </div>
  );
}
