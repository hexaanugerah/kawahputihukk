"use client";

import { useMemo, useState } from "react";
import { PageHeader, SectionCard, StatusPill } from "@/components/panel/panel-ui";
import { SearchInput } from "@/components/panel/panel-toolbar";
import { useMockDB } from "@/hooks/use-mock-db";
import { paginate, searchIn, sortData } from "@/lib/business";
import type { ScanRecord } from "@/types/domain";

// ============================================================================
// RIWAYAT VALIDASI — semua scan (sukses & gagal) dari mock DB, tahan refresh.
// Mendukung pencarian, filter status, sort waktu, paginasi.
// ============================================================================

const STATUS_OPTIONS = ["VALID", "SUDAH DIGUNAKAN", "INVALID", "EXPIRED", "CANCELLED"];
const STATUS_ID: Record<string, string> = {
  VALID: "Valid",
  "SUDAH DIGUNAKAN": "Sudah Digunakan",
  INVALID: "Invalid",
  EXPIRED: "Kadaluarsa",
  CANCELLED: "Dibatalkan",
};

export default function PetugasHistoryPage() {
  const db = useMockDB();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    let list = searchIn(db.scanHistory as ScanRecord[], q, ["ticketId", "bookingId", "visitorName", "petugas"]);
    if (status) list = list.filter((s) => s.status === status);
    return sortData(list, "timestamp", sortDir);
  }, [db.scanHistory, q, status, sortDir]);

  const paged = paginate(rows, page, 10);

  return (
    <div>
      <PageHeader title="Riwayat Validasi" subtitle="Riwayat Tiket" />

      <SectionCard action={<span className="text-sm font-semibold text-[#1768ad]">{rows.length} scan</span>}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Cari kode / nama / petugas…" className="w-full sm:max-w-xs" />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="h-9 rounded-md border border-[#d7e3ed] bg-white px-3 text-sm text-[#29445e] outline-none focus:border-[#1768ad]"
            aria-label="Filter status scan"
          >
            <option value="">Semua status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_ID[s]}</option>
            ))}
          </select>
          <button
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="h-9 rounded-md border border-[#d7e3ed] bg-white px-3 text-sm text-[#29445e] hover:bg-[#f2f7fb]"
          >
            Waktu {sortDir === "asc" ? "↑" : "↓"}
          </button>
        </div>

        <div className="panel-scroll rounded-md border border-[#e5edf3]">
          <table className="panel-table">
            <thead>
              <tr>
                <th>Waktu Scan</th>
                <th>Kode Tiket</th>
                <th>Nama Pengunjung</th>
                <th>Petugas</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-[#94A3B8]">
                    Belum ada riwayat scan.
                  </td>
                </tr>
              ) : (
                paged.rows.map((s) => (
                  <tr key={s.id}>
                    <td className="tabular-nums text-xs">{new Date(s.timestamp).toLocaleString("id-ID")}</td>
                    <td className="font-medium text-[#17324d]">{s.ticketId}</td>
                    <td>{s.visitorName}</td>
                    <td>{s.petugas}</td>
                    <td><StatusPill status={STATUS_ID[s.status] ?? s.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {paged.totalPages > 1 && (
          <div className="mt-3 flex items-center justify-end gap-1 text-xs text-[#698097]">
            <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="rounded-md border border-[#d7e3ed] px-2 py-1 disabled:opacity-40">‹</button>
            <span className="px-2">Hal {paged.page} / {paged.totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page >= paged.totalPages} className="rounded-md border border-[#d7e3ed] px-2 py-1 disabled:opacity-40">›</button>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
