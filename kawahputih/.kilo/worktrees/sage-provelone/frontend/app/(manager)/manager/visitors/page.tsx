"use client";

import { useState } from "react";
import { BarChart, ListPanel, PageHeader, SectionCard } from "@/components/panel/panel-ui";
import { DateRangeFilter } from "@/components/panel/date-range-filter";
import { managerService, type DateRangePreset } from "@/services/dashboard.service";
import { useMockDB } from "@/hooks/use-mock-db";

// ============================================================================
// STATISTIK PENGUNJUNG — read-only, dihitung dari mock DB.
// ============================================================================

export default function ManagerVisitorsPage() {
  const db = useMockDB();
  const [range, setRange] = useState<DateRangePreset>("7d");
  const [custom, setCustom] = useState<{ from: string; to: string } | undefined>();

  void db;
  const a = managerService.getAnalytics(range, custom);

  return (
    <div>
      <PageHeader
        title="Statistik Pengunjung"
        subtitle="Ringkasan Pengunjung"
        action={
          <DateRangeFilter
            value={range}
            onChange={(p, c) => {
              setRange(p);
              setCustom(c);
            }}
          />
        }
      />

      <SectionCard title="Tren Pengunjung" subtitle={`Periode: ${a.rangeLabel}`}>
        <BarChart data={a.bookingTrend.map((p, i) => ({ label: p.label, value: a.dailyRows[i]?.visitors ?? p.value }))} color="#16876a" />
      </SectionCard>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <SectionCard title="Weekday vs Weekend" className="lg:col-span-2">
          <BarChart data={a.weekdayVsWeekend} />
        </SectionCard>

        <div className="rounded-md border border-[#1768ad] bg-[#1768ad] p-4 text-white">
          <p className="text-xs text-blue-100">Total Pengunjung</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{a.summary.totalVisitors.toLocaleString("id-ID")}</p>
          <p className={`mt-1 text-xs ${a.changes.visitors >= 0 ? "text-blue-100" : "text-red-200"}`}>
            {a.changes.visitors >= 0 ? "▲" : "▼"} {Math.abs(a.changes.visitors)}% dari periode sebelumnya
          </p>
        </div>
      </div>

      <div className="mt-3">
        <SectionCard title="Kunjungan per Jenis Tiket">
          <ListPanel items={a.ticketTypePerformance.map((t) => ({ name: t.label, value: `${t.value} tiket` }))} />
        </SectionCard>
      </div>
    </div>
  );
}
