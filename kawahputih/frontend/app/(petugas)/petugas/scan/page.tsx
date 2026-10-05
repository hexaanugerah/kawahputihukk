"use client";

import { useState } from "react";
import { ScanLine, Loader2 } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/panel/panel-ui";
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

      <SectionCard bodyClassName="p-0">
        <div className="grid min-h-[420px] place-items-center px-6 py-8">
          <div className="w-full max-w-[360px] text-center">
            <div className="mx-auto mb-[-15px] h-9 w-40 rounded-full border-4 border-[#1768ad] bg-white pt-1 text-xs font-extrabold tracking-wide text-[#1768ad]">
              {scanning ? "MEMINDAI" : "SCAN HERE"}
            </div>
            <div className="grid aspect-square w-full place-items-center rounded-lg border-4 border-[#1768ad] bg-white">
              <div className="w-[70%] space-y-2">
                {scanning ? (
                  <Loader2 className="mx-auto h-16 w-16 animate-spin text-[#1768ad]" />
                ) : (
                  <>
                    {Array.from({ length: 11 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-2 rounded-sm bg-black"
                        style={{ width: `${i % 3 === 0 ? 100 : i % 3 === 1 ? 82 : 92}%`, marginLeft: i % 2 ? "auto" : 0 }}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-[#e5edf3] bg-white px-6 py-4">
          <p className="mb-3 text-sm text-[#698097]">Pastikan QR code sesuai dengan tiket pengunjung sebelum melakukan validasi.</p>
          <div className="flex flex-wrap gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runScan(code)}
              placeholder="Masukkan kode tiket manual"
              className="h-10 flex-1 rounded-md border border-[#d7e3ed] px-3 text-sm outline-none focus:border-[#1768ad]"
              aria-label="Kode tiket"
            />
            <button
              onClick={() => runScan(code)}
              disabled={scanning}
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-[#1768ad] px-4 text-sm font-semibold text-white hover:bg-[#14548f] disabled:opacity-60"
            >
              <ScanLine className="h-4 w-4" /> Validasi
            </button>
            <button
              onClick={simulateScan}
              disabled={scanning}
              className="h-10 rounded-md border border-[#1768ad] px-4 text-sm font-semibold text-[#1768ad] hover:bg-[#f2f7fb] disabled:opacity-60"
            >
              Simulasi Scan
            </button>
          </div>
          {result && (
            <p className="mt-3 text-sm font-semibold text-[#1768ad]">
              Hasil: {result.kind === "VALID" ? "Tiket valid" : result.kind === "USED" ? "Tiket sudah digunakan" : "Tiket tidak valid"}
            </p>
          )}
          <p className="mt-2 text-[11px] text-[#94A3B8]">
            {db.eTickets.filter((t) => t.status === "VALID").length} tiket VALID siap discan -{" "}
            {db.eTickets.filter((t) => t.status === "USED").length} tiket sudah digunakan
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
