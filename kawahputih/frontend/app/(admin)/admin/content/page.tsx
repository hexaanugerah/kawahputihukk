import { PageHeader, InfoTile } from "@/components/panel/panel-ui";

const CARDS = [
  { title: "Informasi Kawah Putih", desc: "Informasi lengkap mengenai destinasi, sejarah, dan daya tarik Kawah Putih.", href: "/admin/articles", badge: "KP" },
  { title: "Galeri", desc: "Kumpulan foto dan dokumentasi keindahan Kawah Putih dan area wisata.", href: "/admin/gallery", badge: "G" },
  { title: "FAQ", desc: "Kumpulan pertanyaan yang sering diajukan oleh pengunjung.", href: "/admin/faq", badge: "?" },
  { title: "Informasi Fasilitas", desc: "Informasi fasilitas dan layanan yang tersedia untuk kenyamanan pengunjung.", href: "/admin/facilities", badge: "F" },
  { title: "Aturan Kunjungan", desc: "Panduan dan ketentuan yang perlu diperhatikan selama berkunjung.", href: "/admin/settings", badge: "A" },
];

export default function AdminContentPage() {
  return (
    <div>
      <PageHeader title="Kelola Konten" subtitle="Atur informasi dan konten yang ditampilkan di website" />
      <div className="grid gap-4">
        {CARDS.map((c) => (
          <InfoTile key={c.title} title={c.title} desc={c.desc} href={c.href} badge={c.badge} />
        ))}
      </div>
    </div>
  );
}
