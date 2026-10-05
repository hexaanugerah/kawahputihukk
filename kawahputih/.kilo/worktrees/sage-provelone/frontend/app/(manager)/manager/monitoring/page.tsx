"use client";

import { BarChart, PageHeader, SectionCard, StatCard, StatGrid, StatusPill } from "@/components/panel/panel-ui";
import { useMockDB } from "@/hooks/use-mock-db";
import { todayISO } from "@/lib/business";

// ============================================================================
// MONITORING PETUGAS — read-only. Aktivitas validasi petugas dihitung dari
// riwayat scan mock DB.
// ============================================================================

export default function ManagerMonitoringPage() {
  const db = useMockDB();
  const today = todayISO();

  const staffStats = db.staff.map((s) => {
    const scans = db.scanHistory.filter((h) => h.petugas === s.name || h.petugas === s.name.split(" ")[0]);
    return {
      id: s.id,
      name: s.name,
      role: s.role,
      gate: s.gate,
      validated: scans.filter((h) => h.status === "VALID").length,
      lastActivity: scans.sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]?.timestamp ?? null,
      status: s.status,
    };
  });

  const activeStaff = db.staff.filter((s) => s.status === "AKTIF").length;
  const totalValidated = db.scanHistory.filter((h) => h.status === "VALID").length;
  const validatedToday = db.scanHistory.filter((h) => h.status === "VALID" && h.timestamp.slice(0, 10) === today).length;

  // Validasi per jam hari ini.
  const perHour = Array.from({ length: 10 }, (_, i) => {
    const hour = 7 + i;
    const count = db.scanHistory.filter(
      (h) => h.timestamp.slice(0, 10) === today && new Date(h.timestamp).getHours() === hour
    ).length;
    return { label: `${String(hour).padStart(2, "0")}:00`, value: count };
  });

  return (
    <div>
      <PageHeader title="Monitoring Petugas" subtitle="Aktivitas & Kinerja Petugas" />

      <StatGrid cols={3}>
        <StatCard label="Petugas Aktif" value={`${activeStaff} / ${db.staff.length}`} />
        <StatCard label="Total Tiket Validasi" value={totalValidated.toLocaleString("id-ID")} />
        <StatCard label="Validasi Hari Ini" value={validatedToday.toLocaleString("id-ID")} />
      </StatGrid>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <SectionCard title="Aktivitas Petugas" className="lg:col-span-2">
          <div className="panel-scroll">
            <table className="panel-table">
              <thead>
                <tr>
                  <th>Nama Petugas</th>
                  <th>Role</th>
                  <th>Gate</th>
                  <th>Tiket Validasi</th>
                  <th>Aktivitas Terakhir</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {staffStats.map((o) => (
                  <tr key={o.id}>
                    <td className="font-medium text-[#17324d]">{o.name}</td>
                    <td>{o.role}</td>
                    <td>{o.gate}</td>
                    <td className="tabular-nums">{o.validated.toLocaleString("id-ID")}</td>
                    <td className="text-xs text-[#698097]">
                      {o.lastActivity ? new Date(o.lastActivity).toLocaleString("id-ID") : "-"}
                    </td>
                    <td><StatusPill status={o.status === "AKTIF" ? "Aktif" : "Nonaktif"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Validasi Per Jam (hari ini)">
          <BarChart data={perHour} height={160} />
        </SectionCard>
      </div>

      <SectionCard title="Rekap Kunjungan" className="mt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#29445e]">Total kunjungan tercatat (semua waktu)</span>
          <span className="text-2xl font-bold tabular-nums text-[#1768ad]">
            {db.eTickets.filter((t) => t.status === "USED").reduce((sum, t) => sum + t.quantity, 0).toLocaleString("id-ID")}
          </span>
        </div>
      </SectionCard>
    </div>
  );
}
