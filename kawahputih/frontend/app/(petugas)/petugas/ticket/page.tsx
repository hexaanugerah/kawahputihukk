"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, XCircle, Search } from "lucide-react";
import { PageHeader, SectionCard, StatusPill } from "@/components/panel/panel-ui";
import { useMockDB } from "@/hooks/use-mock-db";

// ============================================================================
// DETAIL TIKET — petugas mencari tiket/booking dan melihat status terkininya
// sebelum memutuskan validasi manual.
// ============================================================================

const STATUS_PILL: Record<string, string> = {
  VALID: "Valid",
  USED: "Sudah Digunakan",
  EXPIRED: "Kadaluarsa",
  CANCELLED: "Dibatalkan",
};

export default function PetugasTicketPage() {
  const db = useMockDB();
  const [code, setCode] = useState("");
  const [searched, setSearched] = useState("");

  const ticket = db.eTickets.find((t) => t.id === searched.toUpperCase() || t.bookingId === searched.toUpperCase());
  const booking = ticket ? db.bookings.find((b) => b.id === ticket.bookingId) : null;
  const scans = ticket ? db.scanHistory.filter((s) => s.ticketId === ticket.id) : [];

  return (
    <div>
      <PageHeader title="Detail Tiket" subtitle="Validasi Tiket" />

      <SectionCard>
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearched(code.trim())}
              placeholder="Masukkan kode tiket (TK-…) atau booking (KP-…)…"
              className="h-9 w-full rounded-md border border-[#d7e3ed] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#1768ad]"
              aria-label="Cari tiket"
            />
          </div>
          <button
            onClick={() => setSearched(code.trim())}
            className="h-9 rounded-md bg-[#1768ad] px-4 text-sm font-semibold text-white hover:bg-[#14548f]"
          >
            Cari
          </button>
        </div>

        {!searched ? (
          <p className="py-10 text-center text-sm text-[#94A3B8]">Masukkan kode tiket untuk melihat detail.</p>
        ) : !ticket || !booking ? (
          <div className="py-10 text-center">
            <XCircle className="mx-auto h-8 w-8 text-[#c53030]" />
            <p className="mt-2 text-sm text-[#c53030]">Tiket &quot;{searched}&quot; tidak ditemukan dalam sistem.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <SectionCard title="Informasi Pemesan" className="lg:col-span-2">
              <p className="text-lg font-bold text-[#17324d]">{booking.visitorName}</p>
              <p className="text-sm text-[#698097]">{booking.email}</p>

              <dl className="mt-4 divide-y divide-[#eef2f6] text-sm">
                <DetailRow label="Kode Tiket" value={ticket.id} />
                <DetailRow label="Kode Booking" value={booking.id} />
                <DetailRow label="Tanggal Kunjungan" value={booking.visitDate} />
                <DetailRow label="Jenis Tiket" value={ticket.ticketName} />
                <DetailRow label="Jumlah Tiket" value={`${ticket.quantity} tiket`} />
                {ticket.checkedInAt && <DetailRow label="Check-in" value={`${new Date(ticket.checkedInAt).toLocaleString("id-ID")} • ${ticket.checkedInGate ?? "-"}`} />}
                <div className="flex items-center justify-between py-3">
                  <dt className="text-[#698097]">Status</dt>
                  <dd><StatusPill status={STATUS_PILL[ticket.status] ?? ticket.status} /></dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/petugas/scan"
                  className="inline-flex h-9 items-center rounded-md bg-[#1768ad] px-4 text-sm font-semibold text-white hover:bg-[#14548f]"
                >
                  Scan Tiket
                </Link>
                <Link
                  href="/petugas/history"
                  className="inline-flex h-9 items-center rounded-md border border-[#d7e3ed] px-4 text-sm font-semibold text-[#29445e] hover:bg-[#f2f7fb]"
                >
                  Riwayat Validasi
                </Link>
              </div>
            </SectionCard>

            <div>
              {ticket.status === "VALID" ? (
                <div className="rounded-md border border-[#16876a] bg-[#f0fbf7] p-5">
                  <div className="flex items-center gap-2 text-[#16876a]">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="text-lg font-bold">Tiket Diterima</span>
                  </div>
                  <p className="mt-2 text-sm text-[#3d6b5e]">
                    Tiket valid dan siap digunakan pada tanggal kunjungan.
                  </p>
                </div>
              ) : ticket.status === "USED" ? (
                <div className="rounded-md border border-[#b7791f] bg-[#fdf3e3] p-5">
                  <div className="flex items-center gap-2 text-[#b7791f]">
                    <AlertTriangle className="h-6 w-6" />
                    <span className="text-lg font-bold">Sudah Digunakan</span>
                  </div>
                  <p className="mt-2 text-sm text-[#8a6420]">
                    {ticket.checkedInAt ? `Discan terakhir di ${ticket.checkedInGate ?? "-"} pada ${new Date(ticket.checkedInAt).toLocaleString("id-ID")}.` : "Tiket ini sudah dipakai."}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border border-[#c53030] bg-[#fdeaea] p-5">
                  <div className="flex items-center gap-2 text-[#c53030]">
                    <XCircle className="h-6 w-6" />
                    <span className="text-lg font-bold">Tidak Dapat Digunakan</span>
                  </div>
                  <p className="mt-2 text-sm text-[#8a2828]">Status tiket: {STATUS_PILL[ticket.status] ?? ticket.status}.</p>
                </div>
              )}

              {scans.length > 0 && (
                <div className="mt-3 rounded-md border border-[#d7e3ed] bg-white p-4">
                  <p className="text-xs font-bold text-[#29445e]">RIWAYAT SCAN TIKET INI</p>
                  <ul className="mt-2 space-y-2 text-xs">
                    {scans.map((s) => (
                      <li key={s.id} className="flex items-center justify-between">
                        <span className="text-[#698097]">{new Date(s.timestamp).toLocaleString("id-ID")}</span>
                        <span className="font-medium">{s.gate}</span>
                        <StatusPill status={s.status === "VALID" ? "Valid" : s.status === "SUDAH DIGUNAKAN" ? "Sudah Digunakan" : "Bermasalah"} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-[#698097]">{label}</dt>
      <dd className="font-medium text-[#17324d]">{value}</dd>
    </div>
  );
}
