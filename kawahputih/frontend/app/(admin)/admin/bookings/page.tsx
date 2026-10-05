"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionCard, StatusPill } from "@/components/panel/panel-ui";
import { SearchInput, FilterSelect } from "@/components/panel/panel-toolbar";
import { adminService } from "@/services/dashboard.service";
import { useMockDB } from "@/hooks/use-mock-db";
import { rupiah, paginate, searchIn, sortData } from "@/lib/business";
import type { Booking, BookingStatus } from "@/types/domain";

// ============================================================================
// KELOLA BOOKING — data langsung dari mock DB. Admin bisa: cari (kode/nama),
// filter tanggal/status, sort, paginasi, lihat detail, ubah status (lokal).
// ============================================================================

const STATUS_OPTIONS: BookingStatus[] = ["PENDING", "PAID", "CONFIRMED", "USED", "CANCELLED", "EXPIRED"];

const STATUS_ID: Record<BookingStatus, string> = {
  PENDING: "Menunggu",
  PAID: "Berhasil (Dibayar)",
  CONFIRMED: "Terkonfirmasi",
  USED: "Selesai (Digunakan)",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kadaluarsa",
};

type SortKey = "createdAt" | "total" | "visitDate";

export default function AdminBookingsPage() {
  const db = useMockDB();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [detail, setDetail] = useState<Booking | null>(null);

  const rows = useMemo(() => {
    let list = db.bookings as Booking[];
    list = searchIn(list, q, ["id", "visitorName", "email"]);
    if (status) list = list.filter((b) => b.status === status);
    if (date) list = list.filter((b) => b.visitDate === date);
    list = sortData(list, sortKey, sortDir);
    return list;
  }, [db.bookings, q, status, date, sortKey, sortDir]);

  const paged = paginate(rows, page, pageSize);

  const summary = useMemo(() => {
    const count = (s: BookingStatus) => db.bookings.filter((b) => b.status === s).length;
    return [
      { label: "Total Booking", value: db.bookings.length },
      { label: "Berhasil", value: count("PAID") + count("CONFIRMED") },
      { label: "Menunggu Pembayaran", value: count("PENDING") },
      { label: "Dibatalkan", value: count("CANCELLED") },
      { label: "Selesai (Digunakan)", value: count("USED") },
    ];
  }, [db.bookings]);

  async function changeStatus(b: Booking, next: BookingStatus) {
    await adminService.updateBookingStatus(b.id, next);
    toast.success(`Status ${b.id} → ${STATUS_ID[next]}`);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div>
      <PageHeader title="Kelola Booking" subtitle="Pantau dan kelola booking" />

      <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {summary.map((s) => (
          <div key={s.label} className="rounded-md border border-[#d7e3ed] bg-white px-4 py-3">
            <p className="text-xs font-semibold text-[#698097]">{s.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#17324d]">{s.value.toLocaleString("id-ID")}</p>
          </div>
        ))}
      </div>

      <SectionCard title="Semua Booking" action={<span className="text-sm font-semibold text-[#1768ad]">{rows.length} data</span>}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Cari kode booking / nama…" className="w-full sm:max-w-xs" />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="h-9 rounded-md border border-[#d7e3ed] bg-white px-3 text-sm text-[#29445e] outline-none focus:border-[#1768ad]"
            aria-label="Filter status"
          >
            <option value="">Semua status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_ID[s]}</option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1); }}
            className="h-9 rounded-md border border-[#d7e3ed] bg-white px-3 text-sm text-[#29445e] outline-none focus:border-[#1768ad]"
            aria-label="Filter tanggal kunjungan"
          />
        </div>

        <div className="panel-scroll rounded-md border border-[#e5edf3]">
          <table className="panel-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>Kode Booking</th>
                <th>Nama Pemesan</th>
                <th>
                  <button onClick={() => toggleSort("visitDate")} className="font-bold uppercase">
                    Tanggal {sortKey === "visitDate" && (sortDir === "asc" ? "↑" : "↓")}
                  </button>
                </th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-[#94A3B8]">
                    Belum ada data booking.
                  </td>
                </tr>
              ) : (
                paged.rows.map((b, index) => (
                  <tr key={b.id}>
                    <td className="tabular-nums text-[#698097]">{(paged.page - 1) * pageSize + index + 1}.</td>
                    <td className="font-medium text-[#17324d]">{b.id}</td>
                    <td>{b.visitorName}</td>
                    <td className="tabular-nums">{b.visitDate}</td>
                    <td><StatusPill status={STATUS_ID[b.status]} /></td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setDetail(b)}
                          className="grid h-7 w-7 place-items-center rounded-md border border-[#d7e3ed] text-[#29445e] hover:bg-[#f2f7fb]"
                          aria-label={`Detail ${b.id}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <select
                          value={b.status}
                          onChange={(e) => changeStatus(b, e.target.value as BookingStatus)}
                          className="h-7 rounded-md border border-[#d7e3ed] bg-white px-1.5 text-xs outline-none focus:border-[#1768ad]"
                          aria-label={`Ubah status ${b.id}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{STATUS_ID[s]}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={paged.page} totalPages={paged.totalPages} total={paged.total} onPage={setPage} pageSize={pageSize} onPageSize={setPageSize} />
      </SectionCard>

      {/* Detail dialog */}
      {detail && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setDetail(null)} role="dialog" aria-modal="true">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-md bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#e5edf3] pb-3">
              <h3 className="text-base font-bold text-[#17324d]">Detail Booking</h3>
              <button onClick={() => setDetail(null)} className="text-sm text-[#698097] hover:text-[#17324d]" aria-label="Tutup">✕</button>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Kode Booking" value={detail.id} />
              <Row label="Nama" value={detail.visitorName} />
              <Row label="Email" value={detail.email} />
              <Row label="Telepon" value={detail.phone} />
              <Row label="Tanggal Kunjungan" value={detail.visitDate} />
              <Row label="Status" value={STATUS_ID[detail.status]} />
              <Row label="Dibuat" value={new Date(detail.createdAt).toLocaleString("id-ID")} />
              {detail.note && <Row label="Catatan" value={detail.note} />}
            </dl>
            <div className="mt-3 rounded-md bg-[#f7fbff] p-3">
              <p className="text-xs font-bold text-[#29445e]">Rincian Tiket</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {detail.items.map((i) => (
                  <li key={i.ticketId} className="flex justify-between">
                    <span className="text-[#698097]">{i.ticketName} × {i.quantity}</span>
                    <span className="tabular-nums font-medium">{rupiah(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between border-t border-[#e5edf3] pt-2 text-sm font-bold">
                <span>Total</span>
                <span className="tabular-nums">{rupiah(detail.total)}</span>
              </div>
            </div>
            {detail.ticketId && (
              <p className="mt-3 text-xs text-[#698097]">Kode E-Tiket: <span className="font-mono font-bold text-[#17324d]">{detail.ticketId}</span></p>
            )}
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

function Pagination({
  page, totalPages, total, onPage, pageSize, onPageSize,
}: {
  page: number; totalPages: number; total: number; onPage: (p: number) => void; pageSize: number; onPageSize: (n: number) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#698097]">
      <div className="flex items-center gap-2">
        <span>Baris/hal</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
          className="h-7 rounded-md border border-[#d7e3ed] bg-white px-1.5 outline-none"
          aria-label="Ukuran halaman"
        >
          {[8, 15, 30].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <span>{total} data</span>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1} className="rounded-md border border-[#d7e3ed] px-2 py-1 disabled:opacity-40">‹</button>
        <span className="px-2">Hal {page} / {totalPages}</span>
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages} className="rounded-md border border-[#d7e3ed] px-2 py-1 disabled:opacity-40">›</button>
      </div>
    </div>
  );
}
