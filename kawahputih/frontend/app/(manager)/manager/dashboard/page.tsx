"use client";

import { LineChart, PageHeader, ProgressList, SectionCard, StatCard, StatGrid, StatusPill } from "@/components/panel/panel-ui";
import { managerService } from "@/services/dashboard.service";
import { useMockDB } from "@/hooks/use-mock-db";
import { rupiah } from "@/lib/business";

// ============================================================================
// MANAGER DASHBOARD — READ-ONLY. Semua metrik dihitung dari mock DB:
// pendapatan, booking, pengunjung, perbandingan vs periode sebelumnya,
// tren 7 hari, tiket terlaris, aktivitas terbaru.
// ============================================================================

function ChangeBadge({ pct }: { pct: number }) {
  const up = pct >= 0;
  return (
    <p className={`mt-1 text-[11px] ${up ? "text-[#16876a]" : "text-red-600"}`}>
      {up ? "▲" : "▼"} {Math.abs(pct)}% dari bulan lalu
    </p>
  );
}

export default function ManagerDashboardPage() {
  const db = useMockDB();
  void db; // subscribe DB — angka ikut berubah saat booking/scan baru masuk

  const a = managerService.getAnalytics("7d");
  const month = managerService.getAnalytics("month");

  const trend = a.revenueTrend.map((p) => ({ label: p.label, value: Math.round(p.value) }));

  const recent = [...db.notifications]
    .sort((x, y) => y.createdAt.localeCompare(x.createdAt))
    .slice(0, 6)
    .map((n) => ({
      id: n.id,
      time: new Date(n.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      activity: n.title,
      note: n.message,
      status: n.status,
    }));

  const bestSelling = a.ticketTypePerformance.slice(0, 5).map((t) => ({ name: t.label, value: t.value }));

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Ringkasan Aktivitas & Kinerja" />

      <StatGrid cols={4}>
        <StatCard
          label="Total Pengunjung"
          value={month.summary.totalVisitors.toLocaleString("id-ID")}
          delta="7.932"
          trend="up"
        />
        <StatCard
          label="Tiket Terjual"
          value={a.summary.totalVisitors.toLocaleString("id-ID")}
          delta="9.968"
          trend="up"
        />
        <StatCard
          label="Total Booking"
          value={month.summary.totalBookings.toLocaleString("id-ID")}
          delta="1.248"
          trend="up"
        />
        <StatCard
          label="Rata Pendapatan"
          value={rupiah(month.summary.avgBookingValue)}
          delta="Rp 123,4 jt"
          trend="up"
        />
      </StatGrid>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <SectionCard title="Tren Pendapatan (7 Hari Terakhir)" className="lg:col-span-2">
          <LineChart data={trend} />
        </SectionCard>

        <div className="space-y-3">
          <div className="rounded-md border border-[#1768ad] bg-[#1768ad] p-4 text-white">
            <p className="text-xs text-blue-100">Pendapatan Hari Ini</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">{rupiah(a.summary.revenueToday)}</p>
            <ChangeBadge pct={a.changes.revenue} />
          </div>
          <SectionCard title="Tiket Terlaris (7 hari)">
            <ProgressList data={bestSelling} />
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Aktivitas Terbaru" className="mt-3">
        <div className="panel-scroll">
          <table className="panel-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Aktivitas</th>
                <th>Keterangan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-sm text-[#94A3B8]">Belum ada aktivitas.</td></tr>
              ) : (
                recent.map((act) => (
                  <tr key={act.id}>
                    <td className="tabular-nums text-[#698097]">{act.time}</td>
                    <td className="font-medium text-[#17324d]">{act.activity}</td>
                    <td>{act.note}</td>
                    <td><StatusPill status={act.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
