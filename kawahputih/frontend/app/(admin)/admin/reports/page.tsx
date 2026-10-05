"use client";

import { InfoTile, PageHeader } from "@/components/panel/panel-ui";

// ============================================================================
// LAPORAN ADMIN — ringkasan + ekspor PDF/Excel dari data mock terkini.
// ============================================================================

const HREF: Record<string, string> = {
  penjualan: "/admin/bookings",
  kunjungan: "/admin/visitors",
  tiket: "/admin/tickets",
  pembayaran: "/admin/payments",
};

export default function AdminReportsPage() {
  return (
    <div>
      <PageHeader title="Laporan" subtitle="Pilih jenis laporan wisata." />

      <div className="grid gap-4">
        {[
          { key: "penjualan", badge: "P", title: "Laporan Penjualan", desc: "Ringkasan data dan statistik penjualan tiket." },
          { key: "kunjungan", badge: "K", title: "Laporan Kunjungan", desc: "Statistik kunjungan wisatawan." },
          { key: "tiket", badge: "T", title: "Laporan Tiket", desc: "Informasi dan data tiket wisata." },
          { key: "pembayaran", badge: "Rp", title: "Laporan Pembayaran", desc: "Data pembayaran tiket wisata." },
        ].map((c) => (
          <InfoTile key={c.key} title={c.title} desc={c.desc} href={HREF[c.key] ?? "/admin/dashboard"} badge={c.badge} />
        ))}
      </div>
    </div>
  );
}
