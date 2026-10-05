"use client";

import { PageHeader, SectionCard, StatGrid, StatusPill } from "@/components/panel/panel-ui";
import { useMockDB } from "@/hooks/use-mock-db";
import { useAuthStore } from "@/store/auth.store";
import { todayISO } from "@/lib/business";

// ============================================================================
// DASHBOARD PETUGAS — ringkasan aktivitas gerbang hari ini, dari mock DB.
// ============================================================================

export default function PetugasDashboardPage() {
  const db = useMockDB();
  const user = useAuthStore((s) => s.user);
  const today = todayISO();

  const todayScans = db.scanHistory.filter((s) => s.timestamp.slice(0, 10) === today);
  const validToday = todayScans.filter((s) => s.status === "VALID").length;
  const usedToday = todayScans.filter((s) => s.status === "SUDAH DIGUNAKAN").length;
  const problemToday = todayScans.filter((s) => ["INVALID", "EXPIRED", "CANCELLED"].includes(s.status)).length;

  const kpis = [
    { label: "Scan Valid", sub: "Hari Ini", value: validToday },
    { label: "Tiket Sudah", sub: "Digunakan", value: usedToday },
    { label: "Tiket", sub: "Bermasalah", value: problemToday },
    { label: "Total Tiket", sub: "Digunakan Sistem", value: db.eTickets.filter((t) => t.status === "USED").length },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Ringkasan Aktivitas ${user?.gate ?? "Gerbang"} — ${user?.name ?? "Petugas"}`}
      />

      <StatGrid cols={4}>
        {kpis.map((k) => (
          <div key={k.label + k.sub} className="rounded-md border border-[#d7e3ed] bg-white px-4 py-3.5">
            <p className="text-xs font-semibold text-[#698097]">{k.label}</p>
            <p className="text-xs text-[#698097]">{k.sub}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-[#17324d]">{k.value.toLocaleString("id-ID")}</p>
          </div>
        ))}
      </StatGrid>

      <SectionCard title="Riwayat Scan Terbaru" className="mt-3">
        <div className="panel-scroll">
          <table className="panel-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>Waktu Scan</th>
                <th>Kode Tiket</th>
                <th>Nama Pengunjung</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {db.scanHistory.slice(0, 8).length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-sm text-[#94A3B8]">Belum ada scan hari ini.</td></tr>
              ) : (
                db.scanHistory.slice(0, 8).map((s, i) => (
                  <tr key={s.id}>
                    <td className="tabular-nums text-[#698097]">{i + 1}.</td>
                    <td className="tabular-nums">{new Date(s.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="font-medium text-[#17324d]">{s.ticketId}</td>
                    <td>{s.visitorName}</td>
                    <td>
                      <StatusPill
                        status={
                          s.status === "VALID" ? "Valid" :
                          s.status === "SUDAH DIGUNAKAN" ? "Sudah Digunakan" :
                          s.status === "EXPIRED" ? "Kadaluarsa" :
                          s.status === "CANCELLED" ? "Dibatalkan" : "Bermasalah"
                        }
                      />
                    </td>
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
