"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { QrCode, X, CalendarDays, Download } from "lucide-react";
import { toast } from "sonner";
import { bookingService } from "@/services/booking.service";
import { downloadETicketPDF } from "@/lib/eticket-pdf";
import { eTicketService } from "@/services/booking.service";
import { useMockDB } from "@/hooks/use-mock-db";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty/empty-state";
import { rupiah, todayISO } from "@/lib/business";
import type { Booking } from "@/types/domain";

// ============================================================================
// MY BOOKINGS LIST — riwayat booking pengunjung, dari mock DB.
// Tab: Akan Datang / Selesai / Dibatalkan. Tiap booking: detail, e-tiket,
// unduh PDF, batalkan (untuk yang masih PENDING).
// ============================================================================

const STATUS_ID: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Dibayar",
  CONFIRMED: "Terkonfirmasi",
  USED: "Digunakan",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kadaluarsa",
};

type Tab = "upcoming" | "past" | "cancelled";

export function MyBookingsList() {
  const db = useMockDB();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [qrFor, setQrFor] = useState<Booking | null>(null);
  const [detailFor, setDetailFor] = useState<Booking | null>(null);
  const today = todayISO();

  useEffect(() => {
    bookingService.listMine().then(setBookings);
  }, [db.bookings.length]);

  if (!bookings) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  const upcoming = bookings.filter((b) => ["PENDING", "PAID", "CONFIRMED"].includes(b.status) && b.visitDate >= today);
  const past = bookings.filter((b) => b.status === "USED" || (["CONFIRMED", "PAID"].includes(b.status) && b.visitDate < today));
  const cancelled = bookings.filter((b) => ["CANCELLED", "EXPIRED"].includes(b.status));

  const visible = tab === "upcoming" ? upcoming : tab === "past" ? past : cancelled;

  async function handleCancel(b: Booking) {
    try {
      await bookingService.cancel(b.id);
      toast.success("Booking dibatalkan");
    } catch {
      toast.error("Gagal membatalkan booking");
    }
  }

  async function handleDownload(b: Booking) {
    const res = await eTicketService.getByBookingId(b.id);
    if (!res) {
      toast.error("E-tiket belum tersedia untuk booking ini");
      return;
    }
    try {
      await downloadETicketPDF(res.ticket, res.booking);
      await eTicketService.markDownloaded(b.id);
      toast.success("E-tiket diunduh");
    } catch {
      toast.error("Gagal mengunduh e-tiket");
    }
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "upcoming", label: "Akan Datang", count: upcoming.length },
    { key: "past", label: "Selesai", count: past.length },
    { key: "cancelled", label: "Dibatalkan", count: cancelled.length },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
              tab === t.key ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={tab === "upcoming" ? "Belum ada booking" : "Tidak ada data"}
          description={tab === "upcoming" ? "Pesan tiket sekarang untuk merencanakan kunjunganmu." : undefined}
        />
      ) : (
        visible.map((b) => (
          <Card key={b.id} className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="font-medium">{b.id}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  b.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                  b.status === "USED" ? "bg-blue-100 text-blue-700" :
                  b.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {STATUS_ID[b.status] ?? b.status}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Kunjungan {b.visitDate} • {b.totalTickets} tiket • {rupiah(b.total)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["CONFIRMED", "PAID"].includes(b.status) && b.ticketId && (
                <>
                  <Link
                    href={`/e-ticket?code=${b.id}`}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-3 text-xs font-semibold hover:bg-slate-50"
                  >
                    <QrCode className="h-3.5 w-3.5" /> E-Tiket
                  </Link>
                  <button
                    onClick={() => handleDownload(b)}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-3 text-xs font-semibold hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" /> PDF
                  </button>
                </>
              )}
              {b.status === "PENDING" && (
                <>
                  <Link
                    href={`/payment?code=${b.id}`}
                    className="inline-flex h-8 items-center rounded-md bg-brand px-3 text-xs font-semibold text-white hover:bg-brand-dark"
                  >
                    Bayar Sekarang
                  </Link>
                  <button
                    onClick={() => handleCancel(b)}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <X className="h-3.5 w-3.5" /> Batalkan
                  </button>
                </>
              )}
              <button
                onClick={() => setDetailFor(b)}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-3 text-xs font-semibold hover:bg-slate-50"
              >
                <CalendarDays className="h-3.5 w-3.5" /> Detail
              </button>
            </div>
          </Card>
        ))
      )}

      {/* QR dialog */}
      {qrFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setQrFor(null)}>
          <div className="rounded-2xl bg-white p-6 text-center dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <p className="mb-4 text-sm text-slate-500">Tunjukkan QR ini di gerbang masuk</p>
            <div className="mx-auto w-fit rounded-xl bg-white p-4">
              <QRCode value={JSON.stringify({ b: qrFor.id, t: qrFor.ticketId })} size={200} />
            </div>
            <p className="mt-3 font-mono text-sm tracking-wider">{qrFor.ticketId}</p>
            <button className="mt-4 w-full rounded-md border border-slate-300 py-2 text-sm font-semibold" onClick={() => setQrFor(null)}>
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Detail dialog */}
      {detailFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetailFor(null)} role="dialog" aria-modal="true">
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Detail Booking</h3>
              <button onClick={() => setDetailFor(null)} aria-label="Tutup" className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <dl className="space-y-2 text-sm">
              <Row label="Kode Booking" value={detailFor.id} />
              <Row label="Nama" value={detailFor.visitorName} />
              <Row label="Email" value={detailFor.email} />
              <Row label="Tanggal Kunjungan" value={detailFor.visitDate} />
              <Row label="Status" value={STATUS_ID[detailFor.status] ?? detailFor.status} />
              <Row label="Dibuat" value={new Date(detailFor.createdAt).toLocaleString("id-ID")} />
            </dl>
            <ul className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
              {detailFor.items.map((i) => (
                <li key={i.ticketId} className="flex justify-between">
                  <span className="text-slate-500">{i.ticketName} × {i.quantity}</span>
                  <span className="font-medium">{rupiah(i.price * i.quantity)}</span>
                </li>
              ))}
              <li className="flex justify-between border-t border-slate-100 pt-2 font-semibold">
                <span>Total</span>
                <span>{rupiah(detailFor.total)}</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
