import type { Metadata } from "next";
import Link from "next/link";
import { Car, Coffee, Clock3, Info, Landmark, ShieldCheck, ShowerHead, TentTree, UtensilsCrossed, Waves } from "lucide-react";

export const metadata: Metadata = {
  title: "Fasilitas",
  description: "Fasilitas dan layanan yang tersedia untuk kenyamanan pengunjung Kawah Putih Rancabali.",
};

// ============================================================================
// FASILITAS (publik) — informasi fasilitas wisata (konten statis/mock).
// Desain mengikuti bahaya visual halaman publik lain (page-shell, chip, kartu).
// ============================================================================

const FACILITIES = [
  { icon: Waves, title: "Area Pandang Kawah", desc: "Dek viewing aman di tepi danau kawah dengan papan informasi dan garis pengaman." },
  { icon: Landmark, title: "Dermaga Bambu", desc: "Spot foto ikonik di tepi kawah, favorit pengunjung untuk berfoto kenang-kenangan." },
  { icon: Car, title: "Area Parkir Luas", desc: "Parkir motor, mobil, dan bus rombongan dengan tarif terjangkau dan petugas jaga." },
  { icon: ShowerHead, title: "Toilet & Mushola", desc: "Toilet bersih dan mushola tersedia di area gerbang masuk dan parkir." },
  { icon: UtensilsCrossed, title: "Pusat Jajanan", desc: "Warung makanan/minuman hangat seperti bajigur, jagung bakar, dan mi instan." },
  { icon: TentTree, title: "Area Piknik", desc: "Ruang terbuka hijau berteduh pinus untuk bersantai bersama keluarga." },
  { icon: ShieldCheck, title: "Keamanan & Pos Medis", desc: "Petugas keamanan dan pos kesehatan siap membantu selama jam operasional." },
  { icon: Coffee, title: "Ruang Istirahat VIP", desc: "Tenda panorama dan kursi santai khusus pemegang tiket VIP (akses terbatas)." },
  { icon: Clock3, title: "Jam Operasional", desc: "Setiap hari pukul 07.00–17.00 WIB. Tiket online bisa dibuat sebelum datang." },
];

export default function FacilitiesPage() {
  return (
    <div className="page-shell py-12">
      <div className="mb-8 max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#e9f3fb] px-3 py-1 text-xs font-semibold text-[#1768ad]">
          <Info className="h-3.5 w-3.5" /> Informasi Wisata
        </span>
        <h1 className="mt-4 font-heading text-3xl font-bold text-[#17324d]">Fasilitas Kawah Putih</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#698097]">
          “Temukan pilihan tiket untuk pengalaman berkunjung yang lebih mudah dan nyaman.”
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FACILITIES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-md border border-[#d7e3ed] bg-white p-5 transition-colors hover:border-[#1768ad]">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#e7f2fb] text-[#1768ad]">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 className="mt-3 text-[15px] font-bold text-[#17324d]">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#698097]">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-md bg-[#1768ad] p-6 text-white sm:flex-row">
        <div>
          <h2 className="text-lg font-bold">Siap berkunjung?</h2>
          <p className="mt-1 text-sm text-blue-100">Pesan tiket online sekarang dan hindari antre di lokasi.</p>
        </div>
        <Link
          href="/booking"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-white px-5 text-sm font-bold text-[#14548f] hover:bg-blue-50"
        >
          Pesan Tiket Sekarang
        </Link>
      </div>
    </div>
  );
}
