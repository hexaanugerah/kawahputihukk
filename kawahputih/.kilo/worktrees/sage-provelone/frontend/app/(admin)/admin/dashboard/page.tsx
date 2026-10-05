"use client";

import { toast } from "sonner";
import { Activity, Ticket, ReceiptText, Wallet, Users, TrendingUp } from "lucide-react";
import {
  BarChart,
  PageHeader,
  SectionCard,
  StatCard,
  StatGrid,
} from "@/components/panel/panel-ui";
import { adminService } from "@/services/dashboard.service";
import { rupiah, todayISO, addDaysISO } from "@/lib/business";
import { useMockDB } from "@/hooks/use-mock-db";
import { resetMockDB } from "@/hooks/use-mock-db";

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

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Selamat datang, Admin. Berikut adalah ringkasan data hari ini."
        action={
          <button
            onClick={() => {
              resetMockDB();
              toast.success("Data demo direset");
            }}
            className="h-9 rounded-md border border-[#d7e3ed] bg-white px-3 text-xs font-semibold text-[#698097] hover:bg-[#f2f7fb]"
          >
            Reset Data Demo
          </button>
        }
      />

      <div className="mb-3 rounded-md border border-[#1768ad] bg-[#1768ad] p-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-white/15">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-blue-100">Total Pengunjung</p>
              <p className="text-2xl font-bold tabular-nums">{totalPengunjung}</p>
            </div>
          </div>
          <p className="text-xs font-semibold text-blue-100">{stats.pendingPayments} pembayaran menunggu</p>
        </div>
      </div>

      <StatGrid cols={4}>
        <StatCard
          label="Total Booking"
          value={stats.totalBookings.toLocaleString("id-ID")}
          delta="dari data demo"
          trend="up"
          icon={<ReceiptText className="h-4 w-4" />}
        />
        <StatCard
          label="Total Tiket Terjual"
          value={stats.totalTicketsSold.toLocaleString("id-ID")}
          delta={`${stats.ticketsAvailable.toLocaleString("id-ID")} tersedia`}
          trend="up"
          icon={<Ticket className="h-4 w-4" />}
        />
        <StatCard
          label="Pendapatan"
          value={rupiah(stats.revenue)}
          delta={`${rupiah(stats.revenueToday)} hari ini`}
          trend="up"
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          label="Booking Hari Ini"
          value={stats.bookingsToday.toLocaleString("id-ID")}
          delta="transaksi baru"
          trend="up"
          icon={<Activity className="h-4 w-4" />}
        />
      </StatGrid>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <SectionCard
          title="Grafik Penjualan Tiket (7 Hari Terakhir)"
          className="lg:col-span-2"
          bodyClassName="p-4"
        >
          <BarChart data={sales} />
        </SectionCard>

        <SectionCard title="Ringkasan Hari Ini">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md bg-[#f7fbff] px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm text-[#29445e]">
                <Activity className="h-4 w-4 text-[#1768ad]" /> Booking Hari Ini
              </span>
              <span className="font-bold tabular-nums text-[#17324d]">{stats.bookingsToday}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-[#f7fbff] px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm text-[#29445e]">
                <TrendingUp className="h-4 w-4 text-[#16876a]" /> Pendapatan Hari Ini
              </span>
              <span className="text-xs font-bold tabular-nums text-[#17324d]">{rupiah(stats.revenueToday)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-[#f7fbff] px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm text-[#29445e]">
                <Wallet className="h-4 w-4 text-[#1768ad]" /> Tiket Tersedia
              </span>
              <span className="font-bold tabular-nums text-[#17324d]">{stats.ticketsAvailable.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
