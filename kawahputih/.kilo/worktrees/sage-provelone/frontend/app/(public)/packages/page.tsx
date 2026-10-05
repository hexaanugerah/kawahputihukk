"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Minus, Plus } from "lucide-react";
import { homeTicketOptions } from "@/services/content.service";

export default function PilihTiketPage() {
  const [date, setDate] = useState("");
  const [qty, setQty] = useState<Record<string, number>>(
    Object.fromEntries(homeTicketOptions.map((t) => [t.key, 1]))
  );

  function change(key: string, delta: number) {
    setQty((prev) => ({ ...prev, [key]: Math.max(0, Math.min(20, (prev[key] ?? 0) + delta)) }));
  }

  const totalItems = Object.values(qty).reduce((a, b) => a + b, 0);

  return (
    <div className="page-shell py-10">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-heading text-3xl font-bold text-[#17324d]">Pilih Tiket</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#698097]">
          “Temukan pilihan tiket untuk pengalaman berkunjung yang lebih mudah dan nyaman.”
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="rounded-md border border-[#d7e3ed] bg-white p-5">
            <h2 className="text-lg font-bold text-[#17324d]">Kawah Putih</h2>
            <p className="mt-1 text-sm text-[#698097]">
              Pilih tanggal kunjungan dan jumlah tiket yang Anda butuhkan.
            </p>

            <label className="mt-5 block">
              <span className="mb-1.5 block text-xs font-semibold text-[#29445e]">Pilih tanggal kunjungan</span>
              <span className="relative flex items-center">
                <Calendar className="pointer-events-none absolute left-3 h-4 w-4 text-[#94A3B8]" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10 w-full rounded-md border border-[#d7e3ed] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#1768ad]"
                />
              </span>
            </label>
          </div>

          <div className="mt-4 space-y-3">
            {homeTicketOptions.map((t) => (
              <div key={t.key} className="flex items-center justify-between rounded-md border border-[#d7e3ed] bg-white p-4">
                <div>
                  <p className="text-sm font-bold text-[#17324d]">{t.title}</p>
                  <p className="text-xs text-[#698097]">{t.desc}</p>
                  <p className="mt-1 text-sm font-semibold text-[#1768ad]">{t.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => change(t.key, -1)}
                    className="grid h-8 w-8 place-items-center rounded-md border border-[#d7e3ed] text-[#29445e] hover:bg-[#f2f7fb]"
                    aria-label={`Kurangi ${t.title}`}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold tabular-nums text-[#17324d]">{qty[t.key]}</span>
                  <button
                    onClick={() => change(t.key, 1)}
                    className="grid h-8 w-8 place-items-center rounded-md border border-[#d7e3ed] text-[#29445e] hover:bg-[#f2f7fb]"
                    aria-label={`Tambah ${t.title}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-md border border-[#d7e3ed] bg-white p-5 lg:sticky lg:top-24">
          <h3 className="text-sm font-bold text-[#17324d]">Ringkasan</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#698097]">Tanggal</dt>
              <dd className="font-medium text-[#17324d]">{date || "Belum dipilih"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#698097]">Jumlah tiket</dt>
              <dd className="font-medium tabular-nums text-[#17324d]">{totalItems}</dd>
            </div>
          </dl>
          <Link
            href="/booking"
            className="mt-5 flex h-11 items-center justify-center rounded-md bg-[#1768ad] text-sm font-semibold text-white hover:bg-[#14548f]"
          >
            Pesan
          </Link>
          <p className="mt-2 text-center text-[11px] text-[#94A3B8]">Lanjut ke data pemesanan & pembayaran.</p>
        </aside>
      </div>
    </div>
  );
}
