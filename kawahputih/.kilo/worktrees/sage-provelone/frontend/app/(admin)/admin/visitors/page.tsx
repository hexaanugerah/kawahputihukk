"use client";

import { useMemo, useState } from "react";
import { Eye, History } from "lucide-react";
import { PageHeader, SectionCard, StatusPill } from "@/components/panel/panel-ui";
import { SearchInput } from "@/components/panel/panel-toolbar";
import { adminService } from "@/services/dashboard.service";
import { useMockDB } from "@/hooks/use-mock-db";
import { rupiah, paginate, searchIn, sortData } from "@/lib/business";
import type { Booking } from "@/types/domain";

// ============================================================================
// KELOLA PENGUNJUNG — diturunkan dari booking mock (bukan data terpisah).
// Menampilkan riwayat kunjungan & booking per pengunjung.
// ============================================================================

type VisitorRow = ReturnType<typeof adminService.listVisitors>[number];

export default function AdminVisitorsPage() {
  const db = useMockDB();

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<VisitorRow | null>(null);

  // Rehitung saat DB berubah (dependency db.bookings).
  const rows = useMemo(() => {
    void db.bookings;
    let list = adminService.listVisitors() as (VisitorRow & { id: string })[];
    list = searchIn(list, q, ["name", "email", "phone"]);
    return sortData(list, "joinedAt", "desc");
  }, [db.bookings, q]);

  const paged = paginate(rows, page, 8);

  const visitorBookings = useMemo(() => {
    if (!detail) return [];
    void db.bookings;
    return db.bookings
      .filter((b) => b.email.toLowerCase() === detail.email.toLowerCase())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [detail, db.bookings]);

  return (
    <div>
      <PageHeader title="Kelola Pengunjung" subtitle="Data pengunjung beserta riwayat kunjungan" />

      <SectionCard title="Daftar Pengunjung" action={<span className="text-sm font-semibold text-[#1768ad]">{rows.length} data</span>}>
        <div className="mb-3">
          <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Cari nama / email…" className="w-full sm:max-w-xs" />
        </div>

        <div className="panel-scroll rounded-md border border-[#e5edf3]">
          <table className="panel-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Telepon</th>
                <th>Total Booking</th>
                <th>Total Belanja</th>
                <th>Kunjungan Terakhir</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.rows.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-sm text-[#94A3B8]">Belum ada data pengunjung.</td></tr>
              ) : (
                paged.rows.map((v) => (
                  <tr key={v.id}>
                    <td className="font-medium text-[#17324d]">{v.name}</td>
                    <td>{v.email}</td>
                    <td className="tabular-nums">{v.phone}</td>
                    <td className="tabular-nums">{v.totalBookings}</td>
                    <td className="tabular-nums">{rupiah(v.totalSpent)}</td>
                    <td className="tabular-nums">{v.lastVisit ?? "-"}</td>
                    <td>
                      <button
                        onClick={() => setDetail(v)}
                        className="inline-flex h-7 items-center gap-1 rounded-md border border-[#d7e3ed] px-2 text-xs font-semibold text-[#29445e] hover:bg-[#f2f7fb]"
                      >
                        <History className="h-3.5 w-3.5" /> Riwayat
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
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#e5edf3] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#17324d]">{detail.name}</h3>
                <p className="text-xs text-[#698097]">{detail.email} • {detail.phone}</p>
              </div>
              <button onClick={() => setDetail(null)} className="text-[#698097] hover:text-[#17324d]" aria-label="Tutup">✕</button>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-[#f7fbff] p-3">
                <p className="text-xs text-[#698097]">Total Booking</p>
                <p className="text-lg font-bold tabular-nums">{detail.totalBookings}</p>
              </div>
              <div className="rounded-md bg-[#f7fbff] p-3">
                <p className="text-xs text-[#698097]">Total Belanja</p>
                <p className="text-lg font-bold tabular-nums">{rupiah(detail.totalSpent)}</p>
              </div>
              <div className="rounded-md bg-[#f7fbff] p-3">
                <p className="text-xs text-[#698097]">Terakhir Berkunjung</p>
                <p className="text-sm font-bold">{detail.lastVisit ?? "-"}</p>
              </div>
            </div>

            <p className="mt-4 text-xs font-bold text-[#29445e]">RIWAYAT BOOKING</p>
            <div className="mt-2 space-y-2">
              {visitorBookings.length === 0 ? (
                <p className="py-4 text-center text-sm text-[#94A3B8]">Belum ada booking.</p>
              ) : (
                visitorBookings.map((b: Booking) => (
                  <div key={b.id} className="flex items-center justify-between rounded-md border border-[#e5edf3] px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium text-[#17324d]">{b.id}</p>
                      <p className="text-xs text-[#698097]">Kunjungan {b.visitDate} • {b.totalTickets} tiket</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums text-sm">{rupiah(b.total)}</span>
                      <StatusPill
                        status={
                          b.status === "CONFIRMED" ? "Terkonfirmasi" :
                          b.status === "USED" ? "Selesai" :
                          b.status === "PENDING" ? "Menunggu" :
                          b.status === "CANCELLED" ? "Dibatalkan" :
                          b.status === "EXPIRED" ? "Kadaluarsa" : "Berhasil"
                        }
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
