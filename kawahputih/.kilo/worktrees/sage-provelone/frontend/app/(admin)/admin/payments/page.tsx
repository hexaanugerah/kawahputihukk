"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { PageHeader, SectionCard, StatusPill } from "@/components/panel/panel-ui";
import { SearchInput } from "@/components/panel/panel-toolbar";
import { adminService } from "@/services/dashboard.service";
import { useMockDB } from "@/hooks/use-mock-db";
import { rupiah, paginate, searchIn, sortData } from "@/lib/business";
import type { Payment, PaymentStatus } from "@/types/domain";

// ============================================================================
// KELOLA PEMBAYARAN — daftar payment dari mock DB dengan pencarian, filter
// status, sort, paginasi, dan dialog detail. Status berubah otomatis saat
// pengunjung menyelesaikan pembayaran (event-driven via mock DB).
// ============================================================================

const STATUS_ID: Record<PaymentStatus, string> = {
  PENDING: "Menunggu",
  PROCESSING: "Diproses",
  PAID: "Berhasil",
  FAILED: "Gagal",
  EXPIRED: "Kadaluarsa",
  REFUNDED: "Refund",
};

const STATUS_OPTIONS = Object.keys(STATUS_ID) as PaymentStatus[];

export default function AdminPaymentsPage() {
  const db = useMockDB();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Payment | null>(null);

  const rows = useMemo(() => {
    let list = searchIn(db.payments as (Payment & { id: string })[], q, ["id", "bookingId"]);
    if (status) list = list.filter((p) => p.status === status);
    return sortData(list, "createdAt", sortDir);
  }, [db.payments, q, status, sortDir]);

  const paged = paginate(rows, page, 8);

  const summary = useMemo(() => {
    const sum = (filter: (p: Payment) => boolean) => db.payments.filter(filter).reduce((s, p) => s + p.amount, 0);
    return [
      { label: "Total Berhasil", value: rupiah(sum((p) => p.status === "PAID")) },
      { label: "Menunggu", value: String(db.payments.filter((p) => p.status === "PENDING").length) },
      { label: "Gagal", value: String(db.payments.filter((p) => p.status === "FAILED").length) },
      { label: "Refund", value: rupiah(sum((p) => p.status === "REFUNDED")) },
    ];
  }, [db.payments]);

  return (
    <div>
      <PageHeader title="Kelola Pembayaran" subtitle="Riwayat transaksi pembayaran tiket" />

      <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="rounded-md border border-[#d7e3ed] bg-white px-4 py-3">
            <p className="text-xs font-semibold text-[#698097]">{s.label}</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-[#17324d]">{s.value}</p>
          </div>
        ))}
      </div>

      <SectionCard title="Semua Pembayaran" action={<span className="text-sm font-semibold text-[#1768ad]">{rows.length} data</span>}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Cari ID pembayaran / booking…" className="w-full sm:max-w-xs" />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="h-9 rounded-md border border-[#d7e3ed] bg-white px-3 text-sm text-[#29445e] outline-none focus:border-[#1768ad]"
            aria-label="Filter status pembayaran"
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
            Tanggal {sortDir === "asc" ? "↑" : "↓"}
          </button>
        </div>

        <div className="panel-scroll rounded-md border border-[#e5edf3]">
          <table className="panel-table">
            <thead>
              <tr>
                <th>ID Pembayaran</th>
                <th>Booking</th>
                <th>Metode</th>
                <th>Nominal</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.rows.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-sm text-[#94A3B8]">Belum ada data pembayaran.</td></tr>
              ) : (
                paged.rows.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium text-[#17324d]">{p.id}</td>
                    <td>{p.bookingId}</td>
                    <td>{p.method}</td>
                    <td className="tabular-nums">{rupiah(p.amount)}</td>
                    <td className="tabular-nums">{p.createdAt.slice(0, 10)}</td>
                    <td><StatusPill status={STATUS_ID[p.status]} /></td>
                    <td>
                      <button
                        onClick={() => setDetail(p)}
                        className="grid h-7 w-7 place-items-center rounded-md border border-[#d7e3ed] text-[#29445e] hover:bg-[#f2f7fb]"
                        aria-label={`Detail ${p.id}`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
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

      {detail && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setDetail(null)} role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-md bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#e5edf3] pb-3">
              <h3 className="text-base font-bold text-[#17324d]">Detail Pembayaran</h3>
              <button onClick={() => setDetail(null)} className="text-[#698097] hover:text-[#17324d]" aria-label="Tutup">✕</button>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="ID Pembayaran" value={detail.id} />
              <Row label="Kode Booking" value={detail.bookingId} />
              <Row label="Metode" value={detail.method} />
              <Row label="Nominal" value={rupiah(detail.amount)} />
              <Row label="Status" value={STATUS_ID[detail.status]} />
              <Row label="Dibuat" value={new Date(detail.createdAt).toLocaleString("id-ID")} />
              {detail.paidAt && <Row label="Dibayar" value={new Date(detail.paidAt).toLocaleString("id-ID")} />}
              <Row label="Kadaluarsa" value={new Date(detail.expiredAt).toLocaleString("id-ID")} />
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-[#698097]">{label}</dt>
      <dd className="text-right font-medium text-[#17324d]">{value}</dd>
    </div>
  );
}
