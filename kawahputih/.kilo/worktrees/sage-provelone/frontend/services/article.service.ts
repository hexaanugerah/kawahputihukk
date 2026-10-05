import type { Article, CreateArticlePayload } from "@/types/article";

// ============================================================================
// ARTICLE SERVICE (mock) — konten artikel dari dataset lokal.
// Tidak ada database/backend: data hidup di memori modul ini dan perubahan
// dari CMS admin dipersist ke localStorage (guard SSR aman). Bentuk tipe
// Article tetap sama sehingga saat backend nyata tersedia cukup tukar isi
// fungsi-fungsi di bawah dengan axios calls tanpa mengubah halaman.
// ============================================================================

const ARTICLE_STORAGE_KEY = "kawahputih.mock.articles.v1";

/** Muat artikel: localStorage (browser) atau dataset awal (server/reset). */
function loadArticles(): Article[] {
  if (typeof window === "undefined") return MOCK_ARTICLES;
  try {
    const raw = window.localStorage.getItem(ARTICLE_STORAGE_KEY);
    if (!raw) return MOCK_ARTICLES;
    const parsed = JSON.parse(raw) as Article[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_ARTICLES;
  } catch {
    return MOCK_ARTICLES;
  }
}

/** Simpan artikel ke localStorage — diabaikan saat SSR/storage diblok. */
function persistArticles(items: Article[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ARTICLE_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage penuh/di-block — mock tetap hidup di memori */
  }
}

const MOCK_ARTICLES: Article[] = [
  {
    id: "art-1",
    title: "Menikmati Kabut Pagi di Kawah Putih Ciwidey",
    slug: "menikmati-kabut-pagi-kawah-putih",
    excerpt:
      "Waktu terbaik berkunjung,spot foto terbaik, dan tips berpakaian agar tetap nyaman di udara pegunungan yang dingin.",
    content:
      "Kawah Putih terletak di ketinggian sekitar 2.400 meter di atas permukaan laut, sehingga udaranya cukup dingin — bisa mencapai 8-12°C di pagi hari.\n\nWaktu terbaik untuk berkunjung adalah pukul 07.00-10.00 saat kabut tipis masih menyelimuti kawah dan cahaya matahari belum terlalu terik. Suasana ini menciptakan pemandangan surga untuk foto.\n\nTips berpakaian:\n- Gunakan jaket tebal atau sweater\n- Bawa penutup kepala dan sarung tangan bila mudah kedinginan\n- Kenakan sepatu yang nyaman untuk berjalan di area kawah\n\nJangan lupa menjaga kebersihan — bawa kembali semua sampah Anda.",
    cover_image: "",
    status: "published",
    author_id: "admin",
    published_at: 1759101600,
  },
  {
    id: "art-2",
    title: "Panduan Lengkap Booking Tiket Online Kawah Putih",
    slug: "panduan-booking-tiket-online",
    excerpt:
      "Langkah demi langkah memesan tiket melalui website: pilih tanggal, jenis tiket, pembayaran QRIS, hingga e-tiket masuk ke genggaman Anda.",
    content:
      "Memesan tiket Kawah Putih kini bisa dilakukan dari rumah melalui situs resmi.\n\n1. Buka halaman Booking dan pilih tanggal kunjungan Anda.\n2. Pilih jenis tiket — Reguler, VIP, Anak, atau Rombongan.\n3. Isi data pengunjung (nama, email, telepon).\n4. Lakukan pembayaran QRIS sebelum batas waktu kedaluwarsa.\n5. E-tiket berisi QR code otomatis terbit setelah pembayaran berhasil.\n\nTunjukkan QR code kepada petugas di gerbang masuk. Satu kali scan, tiket otomatis tercatat sebagai digunakan.",
    cover_image: "",
    status: "published",
    author_id: "admin",
    published_at: 1758496800,
  },
  {
    id: "art-3",
    title: "5 Spot Foto Terbaik di Sekitar Kawah Putih",
    slug: "5-spot-foto-terbaik-kawah-putih",
    excerpt:
      "Dari dermaga bambu hingga hutan pinus di sekeliling kawah — inilah sudut-sudut paling Instagramable yang wajib Anda coba.",
    content:
      "Selalu ada sudut baru yang menarik di Kawah Putih. Beberapa favorit pengunjung:\n\n1. Dermaga bambu di tepi kawah — frame klasik dengan latar danau putih kehijauan.\n2. Jalur setapak hutan pinus — cahaya menembus pohon menciptakan efek dramatis.\n3. Spot papan nama \"Kawah Putih\" — wajib untuk foto kenang-kenangan.\n4. Tebing sebelah timur — pemandangan kawah dari ketinggian.\n5. Area parkir Kawah Upas — wisata tambahan dalam satu tiket.\n\nDatanglah di hari cerah setelah hujan ringan: kombinasi langit biru dan uap belerang tipis membuat warna danau makin cantik.",
    cover_image: "",
    status: "published",
    author_id: "admin",
    published_at: 1757892000,
  },
  {
    id: "art-4",
    title: "Fakta Menarik Warna Air Kawah Putih yang Berubah-ubah",
    slug: "fakta-warna-air-kawah-putih",
    excerpt:
      "Kenapa danau kawah ini bisa tampak putih susu, hijau toska, hingga kebiruan? Jawabannya ada pada kandungan belerang dan cuaca.",
    content:
      "Warna air Kawah Putih tidak pernah benar-benar sama dari hari ke hari. Fenomena ini disebabkan oleh:\n\n- Konsentrasi belerang yang berubah sesuai aktivitas vulkanik\n- Suhu udara dan intensitas cahaya matahari\n- Curah hujan yang mengencerkan larutan belerang di permukaan\n\nSaat cuaca cerah, danau cenderung tampak hijau toska cerah. Ketika berkabut atau mendung, permukaannya tampak putih keabu-abuan seperti susu — asal usul nama \"Kawah Putih\".\n\nZona berbahaya di sekitar kawah dipagasi; nikmati keindahannya dari area yang telah disediakan.",
    cover_image: "",
    status: "published",
    author_id: "admin",
    published_at: 1757287200,
  },
  {
    id: "art-5",
    title: "Persiapan Berkunjung Bersama Anak ke Kawah Putih",
    slug: "persiapan-berkunjung-bersama-anak",
    excerpt:
      "Checklist perlengkapan, aturan keselamatan, dan aktivitas seru yang aman untuk keluarga dengan anak-anak.",
    content:
      "Membawa anak berwisata ke ketinggian memerlukan persiapan ekstra:\n\n- Bawa pakaian hangat tambahan dan selimut kecil\n- Siapkan camilan dan air minum yang cukup\n- Jangan lepas pandang anak di dekat area kawah — patuhi garis pengaman\n- Tiket Anak tersedia untuk usia 3-10 tahun dengan harga khusus\n\nArea piknik di sekitar pintu masuk cocok untuk rehat keluarga sebelum atau sesudah menikmati kawah.",
    cover_image: "",
    status: "draft",
    author_id: "admin",
  },
];

export const articleService = {
  /** Daftar artikel, opsional difilter status & dibatasi jumlahnya. */
  async list(params?: { page?: number; limit?: number; status?: string }): Promise<Article[]> {
    const { limit, status } = params ?? {};
    let items = [...loadArticles()].sort((a, b) => (b.published_at ?? 0) - (a.published_at ?? 0));
    if (status) items = items.filter((a) => a.status === status);
    if (limit) items = items.slice(0, limit);
    return items;
  },

  /** Detail artikel berdasarkan id — null bila tidak ditemukan. */
  async get(id: string): Promise<Article | null> {
    return loadArticles().find((a) => a.id === id) ?? null;
  },

  /** Buat artikel baru (status draft). */
  async create(payload: CreateArticlePayload): Promise<Article> {
    const items = loadArticles();
    const slug =
      payload.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `artikel-${Date.now()}`;
    const article: Article = {
      id: `art-${Date.now()}`,
      title: payload.title,
      slug,
      excerpt: payload.excerpt,
      content: payload.content,
      cover_image: payload.cover_image ?? "",
      status: "draft",
      author_id: "admin",
    };
    items.unshift(article);
    persistArticles(items);
    return article;
  },

  /** Perbarui isi artikel. */
  async update(id: string, payload: CreateArticlePayload): Promise<Article> {
    const items = loadArticles();
    const target = items.find((a) => a.id === id);
    if (!target) throw new Error("Artikel tidak ditemukan.");
    const updated: Article = {
      ...target,
      ...payload,
      cover_image: payload.cover_image ?? target.cover_image,
    };
    persistArticles(items.map((a) => (a.id === id ? updated : a)));
    return updated;
  },

  /** Terbitkan artikel draft. */
  async publish(id: string): Promise<Article> {
    return setStatus(id, "published");
  },

  /** Arsipkan artikel. */
  async archive(id: string): Promise<Article> {
    return setStatus(id, "archived");
  },

  /** Hapus artikel. */
  async remove(id: string): Promise<void> {
    const items = loadArticles();
    persistArticles(items.filter((a) => a.id !== id));
  },
};

// Helper internal untuk publish/archive (menjaga service object tetap rapi).
async function setStatus(id: string, status: Article["status"]): Promise<Article> {
  const items = loadArticles();
  const target = items.find((a) => a.id === id);
  if (!target) throw new Error("Artikel tidak ditemukan.");
  const updated: Article = {
    ...target,
    status,
    published_at: status === "published" ? Math.floor(Date.now() / 1000) : target.published_at,
  };
  persistArticles(items.map((a) => (a.id === id ? updated : a)));
  return updated;
}
