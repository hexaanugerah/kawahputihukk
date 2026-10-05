"use client";

import { Database, RotateCcw, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionCard } from "@/components/panel/panel-ui";
import { resetMockDB, useMockDB } from "@/hooks/use-mock-db";
import { useAuthStore } from "@/store/auth.store";
import { BOOKING_CONFIG, APP_CONFIG } from "@/config/app.config";
import { rupiah } from "@/lib/business";

// ============================================================================
// SETTINGS — halaman pengaturan + ALAT DEVELOPMENT yang jelas ditandai:
//   Reset Data Demo, info konfigurasi, dan info sesi saat ini.
// ============================================================================

export default function AdminSettingsPage() {
  const db = useMockDB();
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <PageHeader title="Settings" subtitle="Konfigurasi aplikasi & alat demo" />

      <div className="grid gap-3 lg:grid-cols-2">
        <SectionCard title="Konfigurasi Booking" subtitle="Nilai terpusat (config/app.config.ts)">
          <dl className="space-y-2 text-sm">
            <Row label="Kapasitas pengunjung / hari" value={`${APP_CONFIG.dailyVisitorCapacity} orang`} />
            <Row label="Maks. hari ke depan" value={`${BOOKING_CONFIG.maxDaysAhead} hari`} />
            <Row label="Maks. tiket per jenis" value={`${BOOKING_CONFIG.maxQuantityPerTicket} tiket`} />
            <Row label="Biaya layanan" value={rupiah(BOOKING_CONFIG.serviceFee)} />
            <Row label="Kadaluarsa pembayaran" value={`${BOOKING_CONFIG.paymentExpiryMinutes} menit`} />
            <Row label="Metode pembayaran" value="QRIS (simulasi)" />
          </dl>
          <p className="mt-3 text-[11px] text-[#94A3B8]">
            Ubah nilai konfigurasi langsung di file <code className="rounded bg-[#f7fbff] px-1">config/app.config.ts</code>.
          </p>
        </SectionCard>

        <SectionCard title="Sesi Saat Ini" subtitle="Informasi sesi mock">
          <dl className="space-y-2 text-sm">
            <Row label="Pengguna" value={user?.name ?? "-"} />
            <Row label="Email" value={user?.email ?? "-"} />
            <Row label="Role" value={user?.role ?? "-"} />
            <Row label="Gate" value={user?.gate ?? "-"} />
          </dl>
          <div className="mt-3 flex items-center gap-2 rounded-md bg-[#f7fbff] px-3 py-2 text-xs text-[#29445e]">
            <UserCheck className="h-4 w-4 text-[#16876a]" />
            Kredensial akun demo dapat diubah di <code className="mx-1 rounded bg-white px-1">config/auth.config.ts</code>
          </div>
        </SectionCard>

        <SectionCard title="Status Data Mock" subtitle="Jumlah record per entitas">
          <dl className="space-y-2 text-sm">
            <Row label="Jenis tiket" value={db.tickets.length.toLocaleString("id-ID")} />
            <Row label="Booking" value={db.bookings.length.toLocaleString("id-ID")} />
            <Row label="Pembayaran" value={db.payments.length.toLocaleString("id-ID")} />
            <Row label="E-tiket" value={db.eTickets.length.toLocaleString("id-ID")} />
            <Row label="Pengunjung" value={db.visitors.length.toLocaleString("id-ID")} />
            <Row label="Petugas" value={db.staff.length.toLocaleString("id-ID")} />
            <Row label="Riwayat scan" value={db.scanHistory.length.toLocaleString("id-ID")} />
          </dl>
        </SectionCard>

        <SectionCard title="Alat Development" subtitle="Hanya untuk mode demo — tidak untuk produksi">
          <div className="rounded-md border border-dashed border-[#b7791f] bg-[#fdf3e3] p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-[#b7791f]">
              <Database className="h-4 w-4" /> Zona Alat Demo
            </p>
            <p className="mt-1 text-xs text-[#8a6420]">
              Reset mengembalikan seluruh data mock (booking, pembayaran, tiket, scan) ke dataset awal. Semua perubahan lokal hilang.
            </p>
            <button
              onClick={() => {
                resetMockDB();
                toast.success("Data demo berhasil direset ke dataset awal");
              }}
              className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-md bg-[#c53030] px-4 text-xs font-semibold text-white hover:brightness-95"
            >
              <RotateCcw className="h-4 w-4" /> Reset Data Demo
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[#698097]">{label}</dt>
      <dd className="text-right font-medium text-[#17324d]">{value}</dd>
    </div>
  );
}
