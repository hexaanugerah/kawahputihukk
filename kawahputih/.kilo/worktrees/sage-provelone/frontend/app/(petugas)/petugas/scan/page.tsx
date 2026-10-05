"use client";

import { useState } from "react";
import { ScanLine, CheckCircle2, XCircle, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { PageHeader, SectionCard, StatusPill } from "@/components/panel/panel-ui";
import { validateTicket, randomScanInput, type ScanOutcome } from "@/lib/scanner";
import { useAuthStore } from "@/store/auth.store";
import { useMockDB } from "@/hooks/use-mock-db";
import { toast } from "sonner";

// ============================================================================
// SCAN QR — validasi tiket mock dengan aturan realistis:
//   VALID → USED (sukses), USED → "Sudah Digunakan", kode asing → INVALID,
//   EXPIRED/CANCELLED sesuai status. Hasil + tiket mana pun tercatat di
//   riwayat scan dan mengubah statistik modul lain.
// ============================================================================

export default function PetugasScanPage() {
  const user = useAuthStore((s) => s.user);
  const db = useMockDB();
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanOutcome | null>(null);

  const gate = user?.gate ?? "Gerbang 1";
  const petugas = user?.name ?? "Petugas";

  function runScan(input: string) {
    if (!input.trim()) {
      toast.error("Masukkan atau pilih kode tiket terlebih dahulu");
      return;
    }
    setScanning(true);
    setResult(null);
    // simulasi delay scanner
    setTimeout(() => {
      const outcome = validateTicket(input, gate, petugas);
      setResult(outcome);
      setScanning(false);
      if (outcome.kind === "VALID") toast.success("Tiket valid — pengunjung dipersilakan masuk");
      else if (outcome.kind === "USED") toast.warning("Tiket sudah digunakan");
      else toast.error("Tiket tidak dapat digunakan");
    }, 600);
  }

  function simulateScan() {
    runScan(randomScanInput());
  }

  return (
    <div>
      <PageHeader title="Scan QR Code" subtitle={`Arahkan kamera ke QR Code tiket — ${gate}, Shift ${user?.shift ?? "Pagi"}`} />

      <div className="grid gap-3 lg:grid-cols-2">
        <SectionCard title="Kamera Scanner">
          <div className="grid aspect-square w-full place-items-center rounded-md border-2 border-dashed border-[#1768ad] bg-[#f7fbff]">
            <div className="text-center">
              {scanning ? (
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#1768ad]" />
              ) : (
                <ScanLine className="mx-auto h-12 w-12 text-[#1768ad]" />
              )}
              <p className="mt-2 text-sm font-bold tracking-widest text-[#1768ad]">{scanning ? "MEMINDAI..." : "SCAN HERE"}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-[#698097]">
            Kamera fisik belum diintegrasikan (mode demo) — masukkan kode tiket manual atau pakai simulasi.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runScan(code)}
              placeholder="Masukkan kode tiket manual… (TK-… / KP-…)"
              className="h-9 flex-1 rounded-md border border-[#d7e3ed] px-3 text-sm outline-none focus:border-[#1768ad]"
              aria-label="Kode tiket"
            />
            <button
              onClick={() => runScan(code)}
              disabled={scanning}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#1768ad] px-4 text-sm font-semibold text-white hover:bg-[#14548f] disabled:opacity-60"
            >
              <ScanLine className="h-4 w-4" /> Validasi
            </button>
          </div>
          <button
            onClick={simulateScan}
            disabled={scanning}
            className="mt-2 h-9 w-full rounded-md border border-dashed border-[#1768ad] text-sm font-semibold text-[#1768ad] hover:bg-[#f2f7fb] disabled:opacity-60"
          >
            Simulasi Scan Tiket Acak
          </button>
          <p className="mt-2 text-[11px] text-[#94A3B8]">
            {db.eTickets.filter((t) => t.status === "VALID").length} tiket VALID siap discan •{" "}
            {db.eTickets.filter((t) => t.status === "USED").length} tiket sudah digunakan
          </p>
        </SectionCard>

        <SectionCard title="Hasil Validasi">
          {!result && !scanning && (
            <p className="py-10 text-center text-sm text-[#94A3B8]">
              Belum ada tiket dipindai. Arahkan kamera atau masukkan kode tiket.
            </p>
          )}

          {scanning && <div className="h-48 animate-pulse rounded-md bg-[#f7fbff]" />}

          {result?.kind === "VALID" && (
            <div className="rounded-md border border-[#16876a] bg-[#f0fbf7] p-4">
              <div className="flex items-center gap-2 text-[#16876a]">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-bold">Tiket Valid</span>
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <Row label="Nama Pemesan" value={result.visitorName} />
                <Row label="Kode Tiket" value={result.ticketId} />
                <Row label="Kode Booking" value={result.bookingId} />
                <Row label="Tanggal Kunjungan" value={result.visitDate} />
                <Row label="Jenis Tiket" value={result.ticketName} />
                <Row label="Jumlah" value={`${result.quantity} tiket`} />
                <Row label="Gate" value={result.gate} />
                <div className="flex items-center justify-between">
                  <dt className="text-[#698097]">Status</dt>
                  <dd><StatusPill status="Valid" /></dd>
                </div>
              </dl>
              <p className="mt-3 rounded-md bg-white/70 px-3 py-2 text-xs text-[#3d6b5e]">
                Tiket kini berstatus USED — scan ulang akan ditolak.
              </p>
            </div>
          )}

          {result?.kind === "USED" && (
            <div className="rounded-md border border-[#b7791f] bg-[#fdf3e3] p-4">
              <div className="flex items-center gap-2 text-[#b7791f]">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-bold">Tiket Sudah Digunakan</span>
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <Row label="Pengunjung" value={result.visitorName} />
                <Row label="Waktu Scan Sebelumnya" value={result.previousScanTime} />
                <Row label="Gate Sebelumnya" value={result.previousGate} />
                <div className="flex items-center justify-between">
                  <dt className="text-[#698097]">Status</dt>
                  <dd><StatusPill status="Sudah Digunakan" /></dd>
                </div>
              </dl>
            </div>
          )}

          {result?.kind === "INVALID" && (
            <div className="rounded-md border border-[#c53030] bg-[#fdeaea] p-4">
              <div className="flex items-center gap-2 text-[#c53030]">
                <XCircle className="h-5 w-5" />
                <span className="font-bold">Tiket Invalid</span>
              </div>
              <p className="mt-2 text-sm text-[#8a2828]">{result.message}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-[#8a2828]">
                <Clock className="h-4 w-4" /> Percobaan scan tetap tercatat pada riwayat validasi.
              </div>
            </div>
          )}

          {result?.kind === "EXPIRED" && (
            <div className="rounded-md border border-[#b7791f] bg-[#fdf3e3] p-4">
              <div className="flex items-center gap-2 text-[#b7791f]">
                <Clock className="h-5 w-5" />
                <span className="font-bold">Tiket Kedaluwarsa</span>
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                {result.visitorName && <Row label="Pengunjung" value={result.visitorName} />}
                {result.visitDate && <Row label="Tanggal Kunjungan" value={result.visitDate} />}
                <div className="flex items-center justify-between">
                  <dt className="text-[#698097]">Status</dt>
                  <dd><StatusPill status="Kadaluarsa" /></dd>
                </div>
              </dl>
            </div>
          )}

          {result?.kind === "CANCELLED" && (
            <div className="rounded-md border border-[#c53030] bg-[#fdeaea] p-4">
              <div className="flex items-center gap-2 text-[#c53030]">
                <XCircle className="h-5 w-5" />
                <span className="font-bold">Tiket Dibatalkan</span>
              </div>
              {result.visitorName && <p className="mt-2 text-sm text-[#8a2828]">Pengunjung: {result.visitorName}</p>}
              <p className="mt-1 text-sm text-[#8a2828]">Booking ini telah dibatalkan dan tidak dapat digunakan.</p>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[#698097]">{label}</dt>
      <dd className="font-medium text-[#17324d]">{value}</dd>
    </div>
  );
}
