"use client";

import { useMemo, useState } from "react";
import { PageHeader, SectionCard, StatusPill } from "@/components/panel/panel-ui";
import { SearchInput } from "@/components/panel/panel-toolbar";
import { DateRangeFilter } from "@/components/panel/date-range-filter";
import { useMockDB } from "@/hooks/use-mock-db";
import { paginate, searchIn, sortData, rupiah } from "@/lib/business";
import type { DateRangePreset } from "@/services/dashboard.service";
import type { Booking } from "@/types/domain";

// ============================================================================
// LAPORAN BOOKING — READ-ONLY (manager tidak bisa mengubah data).
// ============================================================================

const STATUS_ID: Record<string, string> = {
  PENDING: "Menunggu",
  PAID: "Berhasil",
  CONFIRMED: "Terkonfirmasi",
  USED: "Selesai",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kadaluarsa",
};

export default function ManagerBookingsPage() {
  const db = useMockDB();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    let list = searchIn(db.bookings as Booking[], q, ["id", "visitorName", "email"]);
    if (status) list = list.filter((b) => b.status === status);
    return sortData(list, "createdAt", "desc");
  }, [db.bookings, q, status]);

  const paged = paginate(rows, page, 10);

  const summary = useMemo(() => {
    const count = (s: string) => db.bookings.filter((b) => b.status === s).length;
    return [
      { label: "Semua", value: db.bookings.length },
      { label: "Terkonfirmasi", value: count("CONFIRMED") },
      { label: "Menunggu", value: count("PENDING") },
      { label: "Selesai", value: count("USED") },
      { label: "Dibatalkan", value: count("CANCELLED") },
    ];
  }, [db.bookings]);

  return (
    <div>
      <PageHeader
        title="Laporan Booking"
        subtitle="Ringkasan Data Booking (read-only)"
        action={<DateRangeFilter value="7d" onChange={() => {}} />}
      />

      <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {summary.map((s) => (
          <div key={s.label} className="rounded-md border border-[#d7e3ed] bg-white px-4 py-3">
            <p className="text-xs font-semibold text-[#698097]">{s.label}</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-[#17324d]">{s.value.toLocaleString("id-ID")}</p>
          </div>
        ))}
      </div>

      <SectionCard title="Daftar Booking">
        <div className="mb-3 flex flex-wrap gap-2">
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Cari kode / nama…" className="w-full sm:max-w-xs" />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="h-9 rounded-md border border-[#d7e3ed] bg-white px-3 text-sm text-[#29445e] outline-none focus:border-[#1768ad]"
            aria-label="Filter status"
          >
            <option value="">Semua status</option>
            {Object.entries(STATUS_ID).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div className="panel-scroll rounded-md border border-[#e5edf3]">
          <table className="panel-table">
            <thead>
              <tr>
                <th>Kode Booking</th>
                <th>Nama Pemesan</th>
                <th>Tanggal Kunjungan</th>
                <th>Jumlah Tiket</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.rows.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-sm text-[#94A3B8]">Tidak ada data booking.</td></tr>
              ) : (
                paged.rows.map((b) => (
                  <tr key={b.id}>
                    <td className="font-medium text-[#17324d]">{b.id}</td>
                    <td>{b.visitorName}</td>
                    <td className="tabular-nums">{b.visitDate}</td>
                    <td className="tabular-nums">{b.totalTickets}</td>
                    <td className="tabular-nums">{rupiah(b.total)}</td>
                    <td><StatusPill status={STATUS_ID[b.status] ?? b.status} /></td>
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
