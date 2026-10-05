"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { LineChart, ListPanel, PageHeader, SectionCard, StatCard, StatGrid } from "@/components/panel/panel-ui";
import { DateRangeFilter } from "@/components/panel/date-range-filter";
import { managerService, type DateRangePreset } from "@/services/dashboard.service";
import { useMockDB } from "@/hooks/use-mock-db";
import { exportReportPDF, exportReportExcel, type ReportData } from "@/lib/report-export";
import { rupiah } from "@/lib/business";

// ============================================================================
// LAPORAN PENDAPATAN — read-only, dihitung dari mock DB + rentang tanggal.
// ============================================================================

export default function ManagerRevenuePage() {
  const db = useMockDB();
  const [range, setRange] = useState<DateRangePreset>("30d");
  const [custom, setCustom] = useState<{ from: string; to: string } | undefined>();

  void db;
  const a = managerService.getAnalytics(range, custom);

  function buildReport(): ReportData {
    return {
      title: "Laporan Pendapatan",
      dateRangeLabel: a.rangeLabel,
      summary: [
        { label: "Total Pendapatan", value: rupiah(a.summary.totalRevenue) },
        { label: "Pendapatan Hari Ini", value: rupiah(a.summary.revenueToday) },
        { label: "Total Booking", value: a.summary.totalBookings.toLocaleString("id-ID") },
        { label: "Rata-rata Nilai Booking", value: rupiah(a.summary.avgBookingValue) },
        { label: "Perubahan vs Periode Lalu", value: `${a.changes.revenue >= 0 ? "+" : ""}${a.changes.revenue}%` },
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
        title="Laporan Pendapatan"
        subtitle="Ringkasan Pendapatan"
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

      <StatGrid cols={3}>
        <StatCard label="Total Pendapatan" value={rupiah(a.summary.totalRevenue)} delta={`${a.changes.revenue >= 0 ? "+" : ""}${a.changes.revenue}% vs periode lalu`} trend={a.changes.revenue >= 0 ? "up" : "down"} />
        <StatCard label="Pendapatan Hari Ini" value={rupiah(a.summary.revenueToday)} />
        <StatCard label="Rata-rata / Booking" value={rupiah(a.summary.avgBookingValue)} />
      </StatGrid>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <SectionCard title="Tren Pendapatan" subtitle={`Periode: ${a.rangeLabel}`} className="lg:col-span-2">
          <LineChart data={a.revenueTrend.map((p) => ({ ...p, value: Math.round(p.value) }))} />
        </SectionCard>

        <SectionCard title="Pendapatan per Jenis Tiket">
          <ListPanel
            items={a.ticketTypePerformance.map((t) => ({ name: t.label, value: `${t.value} tiket` }))}
          />
        </SectionCard>
      </div>
    </div>
  );
}
