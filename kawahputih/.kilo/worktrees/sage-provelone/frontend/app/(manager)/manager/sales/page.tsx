"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { BarChart, PageHeader, ProgressList, SectionCard, ListPanel } from "@/components/panel/panel-ui";
import { DateRangeFilter } from "@/components/panel/date-range-filter";
import { managerService, type DateRangePreset } from "@/services/dashboard.service";
import { useMockDB } from "@/hooks/use-mock-db";
import { exportReportPDF, exportReportExcel, type ReportData } from "@/lib/report-export";
import { rupiah } from "@/lib/business";

// ============================================================================
// STATISTIK PENJUALAN — read-only, dihitung dari mock DB sesuai rentang
// tanggal yang dipilih. Bisa diekspor ke PDF & Excel.
// ============================================================================

export default function ManagerSalesPage() {
  const db = useMockDB();
  const [range, setRange] = useState<DateRangePreset>("7d");
  const [custom, setCustom] = useState<{ from: string; to: string } | undefined>();

  const a = managerService.getAnalytics(range, custom);
  void db; // subscribe DB agar angka hidup

  const ticketSales = a.ticketTypePerformance.map((t) => ({ name: t.label, value: t.value }));

  function buildReport(): ReportData {
    return {
      title: "Laporan Statistik Penjualan",
      dateRangeLabel: a.rangeLabel,
      summary: [
        { label: "Total Booking", value: a.summary.totalBookings.toLocaleString("id-ID") },
        { label: "Tiket Terjual", value: a.summary.totalVisitors.toLocaleString("id-ID") },
        { label: "Total Pendapatan", value: rupiah(a.summary.totalRevenue) },
        { label: "Rata-rata Nilai Booking", value: rupiah(a.summary.avgBookingValue) },
        { label: "Conversion Rate", value: `${a.summary.conversionRate}%` },
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
        title="Statistik Penjualan"
        subtitle="Ringkasan Penjualan Tiket"
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

      <div className="grid gap-3 lg:grid-cols-2">
        <SectionCard title="Booking per Hari" subtitle={`Periode: ${a.rangeLabel}`}>
          <BarChart data={a.bookingTrend} />
        </SectionCard>

        <SectionCard title="Weekday vs Weekend" subtitle="Jumlah tiket">
          <BarChart data={a.weekdayVsWeekend} color="#16876a" />
        </SectionCard>

        <SectionCard title="Penjualan per Jenis Tiket">
          <ProgressList data={ticketSales} />
        </SectionCard>

        <SectionCard title="Detail Penjualan">
          <ListPanel
            items={a.ticketTypePerformance.map((t) => ({ name: t.label, value: `${t.value} tiket` }))}
          />
          <div className="mt-3 flex items-center justify-between rounded-md bg-[#eef5fb] px-4 py-3">
            <span className="text-sm font-semibold text-[#29445e]">Total Pendapatan</span>
            <span className="text-lg font-bold tabular-nums text-[#1768ad]">{rupiah(a.summary.totalRevenue)}</span>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
