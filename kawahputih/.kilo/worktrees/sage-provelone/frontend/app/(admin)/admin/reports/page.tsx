"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { BarChart, InfoTile, PageHeader, SectionCard, StatGrid, StatCard } from "@/components/panel/panel-ui";
import { DateRangeFilter } from "@/components/panel/date-range-filter";
import { adminService, managerService, type DateRangePreset } from "@/services/dashboard.service";
import { useMockDB } from "@/hooks/use-mock-db";
import { exportReportPDF, exportReportExcel, type ReportData } from "@/lib/report-export";
import { rupiah } from "@/lib/business";

// ============================================================================
// LAPORAN ADMIN — ringkasan + ekspor PDF/Excel dari data mock terkini.
// ============================================================================

const HREF: Record<string, string> = {
  penjualan: "/admin/bookings",
  kunjungan: "/admin/visitors",
  tiket: "/admin/tickets",
  pembayaran: "/admin/payments",
};

export default function AdminReportsPage() {
  const db = useMockDB();
  const [range, setRange] = useState<DateRangePreset>("7d");
  const [custom, setCustom] = useState<{ from: string; to: string } | undefined>();

  void db;
  const a = managerService.getAnalytics(range, custom);
  const stats = adminService.getDashboardStats();

  const sales = a.bookingTrend.map((p) => ({ label: p.label, value: p.value * 3 })); // aproksimasi tiket

  function buildReport(): ReportData {
    return {
      title: "Laporan Operasional Kawah Putih",
      dateRangeLabel: a.rangeLabel,
      summary: [
        { label: "Total Booking", value: stats.totalBookings.toLocaleString("id-ID") },
        { label: "Tiket Terjual", value: stats.totalTicketsSold.toLocaleString("id-ID") },
        { label: "Total Pendapatan", value: rupiah(stats.revenue) },
        { label: "Pendapatan Hari Ini", value: rupiah(stats.revenueToday) },
        { label: "Total Pengunjung Terdaftar", value: stats.totalVisitors.toLocaleString("id-ID") },
      ],
      revenueSeries: a.revenueTrend,
      bookingSeries: a.bookingTrend,
      ticketPerformance: a.ticketTypePerformance,
      paymentStatus: a.paymentStatus,
      dailyRows: a.dailyRows,
    };
  }

  return (
    <div>
      <PageHeader
        title="Laporan"
        subtitle="Ringkasan data dan statistik wisata."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <DateRangeFilter
              value={range}
              onChange={(p, c) => {
                setRange(p);
                setCustom(c);
              }}
            />
            <button
              onClick={() => {
                exportReportPDF(buildReport());
                toast.success("Laporan PDF diunduh");
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#1768ad] px-3 text-xs font-semibold text-white hover:bg-[#14548f]"
            >
              <Download className="h-4 w-4" /> PDF
            </button>
            <button
              onClick={() => {
                exportReportExcel(buildReport());
                toast.success("Laporan Excel diunduh");
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#d7e3ed] bg-white px-3 text-xs font-semibold text-[#29445e] hover:bg-[#f2f7fb]"
            >
              <Download className="h-4 w-4" /> Excel
            </button>
          </div>
        }
      />

      <StatGrid cols={4}>
        <StatCard label="Total Booking" value={stats.totalBookings.toLocaleString("id-ID")} />
        <StatCard label="Tiket Terjual" value={stats.totalTicketsSold.toLocaleString("id-ID")} />
        <StatCard label="Pendapatan" value={rupiah(stats.revenue)} />
        <StatCard label="Booking Hari Ini" value={stats.bookingsToday.toLocaleString("id-ID")} />
      </StatGrid>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {[
          { key: "penjualan", title: "Laporan Penjualan", desc: "Ringkasan data dan statistik penjualan tiket." },
          { key: "kunjungan", title: "Laporan Kunjungan", desc: "Statistik kunjungan wisatawan." },
          { key: "tiket", title: "Laporan Tiket", desc: "Informasi dan data tiket wisata." },
          { key: "pembayaran", title: "Laporan Pembayaran", desc: "Data pembayaran tiket wisata." },
        ].map((c) => (
          <InfoTile key={c.key} title={c.title} desc={c.desc} href={HREF[c.key] ?? "/admin/dashboard"} />
        ))}
      </div>

      <SectionCard title={`Tren Booking (${a.rangeLabel})`} className="mt-3">
        <BarChart data={sales} />
      </SectionCard>
    </div>
  );
}
