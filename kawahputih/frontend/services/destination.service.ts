import type { CreatePackagePayload, TourismPackage, UpdatePackagePayload } from "@/types/destination";

// ============================================================================
// DESTINATION SERVICE (mock) — paket wisata dari dataset lokal.
// Tidak ada database/backend: data hidup di memori modul ini dan perubahan
// dari CMS admin dipersist ke localStorage (guard SSR aman). Tipe
// TourismPackage tetap sama; ketika backend nyata tersedia cukup tukar isi
// fungsi-fungsi di bawah dengan axios calls tanpa mengubah halaman.
// ============================================================================

const PACKAGE_STORAGE_KEY = "kawahputih.mock.packages.v1";

/** Muat paket: localStorage (browser) atau dataset awal (server/reset). */
function loadPackages(): TourismPackage[] {
  if (typeof window === "undefined") return MOCK_PACKAGES;
  try {
    const raw = window.localStorage.getItem(PACKAGE_STORAGE_KEY);
    if (!raw) return MOCK_PACKAGES;
    const parsed = JSON.parse(raw) as TourismPackage[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_PACKAGES;
  } catch {
    return MOCK_PACKAGES;
  }
}

/** Simpan paket ke localStorage — diabaikan saat SSR/storage diblok. */
function persistPackages(items: TourismPackage[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PACKAGE_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage penuh/di-block — mock tetap hidup di memori */
  }
}

const MOCK_PACKAGES: TourismPackage[] = [
  {
    id: "pkg-1",
    name: "Tiket Masuk Kawah Putih — Reguler",
    slug: "kawah-putih-reguler",
    description:
      "Tiket masuk reguler ke kawah putih susu kehijauan yang legendaris di Rancabali, Ciwidey. Nikmati panorama danau kawah berbelerang, spot foto dermaga bambu, dan jalur setapak hutan pinus.\n\nTermasuk:\n- Tiket masuk area kawah\n- Parkir motor/mobil\n- Asuransi kecelakaan dasar",
    cover_image: "https://picsum.photos/seed/kawah-putih-reguler/1200/700",
    price_cents: 3500000,
    currency: "IDR",
    duration_hours: 3,
    max_capacity: 1000,
    is_active: true,
  },
  {
    id: "pkg-2",
    name: "Paket VIP — Area Premium & Kursi Panorama",
    slug: "kawah-putih-vip",
    description:
      "Pengalaman premium dengan akses area depan kawah, kursi panorama menghadap danau, dan layanan pendamping foto.\n\nTermasuk:\n- Semua fasilitas paket reguler\n- Akses area VIP tanpa antre\n- Kursi panorama + tenda pribadi\n- Pendamping foto (1 jam)",
    cover_image: "https://picsum.photos/seed/kawah-putih-vip/1200/700",
    price_cents: 15000000,
    currency: "IDR",
    duration_hours: 4,
    max_capacity: 200,
    is_active: true,
  },
  {
    id: "pkg-3",
    name: "Paket Rombongan (Min. 20 Orang)",
    slug: "kawah-putih-rombongan",
    description:
      "Paket khusus rombongan sekolah, kantor, atau komunitas dengan diskon grup dan pemandu tersendiri.\n\nTermasuk:\n- Semua fasilitas paket reguler\n- Pemandu lokal bersertifikat\n- Prioritas gerbang masuk rombongan\n- Ruang istirahat grup",
    cover_image: "https://picsum.photos/seed/kawah-putih-rombongan/1200/700",
    price_cents: 2800000,
    currency: "IDR",
    duration_hours: 4,
    max_capacity: 500,
    is_active: true,
  },
  {
    id: "pkg-4",
    name: "Sunrise Trip Kawah Putih + Kawah Upas",
    slug: "sunrise-kawah-putih-upas",
    description:
      "Berangkat pagi buta menyambat matahari terbit di ketinggian 2.400 mdpl, lanjut trekking ringan ke Kawah Upas.\n\nTermasuk:\n- Tiket dua destinasi\n- Kopi hangat pagi\n- Trekking guide\n- Sertifikat digital trip",
    cover_image: "https://picsum.photos/seed/kawah-putih-sunrise/1200/700",
    price_cents: 9500000,
    currency: "IDR",
    duration_hours: 6,
    max_capacity: 150,
    is_active: true,
  },
];

export const destinationService = {
  /** Daftar paket wisata, opsional hanya yang aktif. */
  async list(params?: { page?: number; limit?: number; active_only?: boolean }): Promise<TourismPackage[]> {
    const { limit, active_only } = params ?? {};
    let items = [...loadPackages()];
    if (active_only) items = items.filter((p) => p.is_active);
    if (limit) items = items.slice(0, limit);
    return items;
  },

  /** Detail paket berdasarkan id — null bila tidak ditemukan. */
  async get(id: string): Promise<TourismPackage | null> {
    return loadPackages().find((p) => p.id === id) ?? null;
  },

  /** Buat paket baru (aktif secara default). */
  async create(payload: CreatePackagePayload): Promise<TourismPackage> {
    const items = loadPackages();
    const slug =
      payload.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `paket-${Date.now()}`;
    const pkg: TourismPackage = {
      id: `pkg-${Date.now()}`,
      name: payload.name,
      slug,
      description: payload.description,
      cover_image: payload.cover_image ?? "",
      price_cents: payload.price_cents,
      currency: "IDR",
      duration_hours: payload.duration_hours,
      max_capacity: payload.max_capacity,
      is_active: true,
    };
    items.unshift(pkg);
    persistPackages(items);
    return pkg;
  },

  /** Perbarui paket (termasuk aktif/nonaktif). */
  async update(id: string, payload: UpdatePackagePayload): Promise<TourismPackage> {
    const items = loadPackages();
    const target = items.find((p) => p.id === id);
    if (!target) throw new Error("Paket tidak ditemukan.");
    const updated: TourismPackage = {
      ...target,
      ...payload,
      cover_image: payload.cover_image ?? target.cover_image,
    };
    persistPackages(items.map((p) => (p.id === id ? updated : p)));
    return updated;
  },

  /** Hapus paket. */
  async remove(id: string): Promise<void> {
    const items = loadPackages();
    persistPackages(items.filter((p) => p.id !== id));
  },
};
