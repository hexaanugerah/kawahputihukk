import type { CreateGalleryItemPayload, GalleryItem } from "@/types/gallery";

// ============================================================================
// GALLERY SERVICE (mock) — item galeri dari dataset lokal.
// Tidak ada database/backend: data hidup di memori modul ini dan perubahan
// dari CMS admin dipersist ke localStorage (guard SSR aman). Tipe
// GalleryItem tetap sama; ketika backend nyata tersedia cukup tukar isi
// fungsi-fungsi di bawah dengan axios calls tanpa mengubah halaman.
// ============================================================================

const GALLERY_STORAGE_KEY = "kawahputih.mock.gallery.v1";

/** Muat galeri: localStorage (browser) atau dataset awal (server/reset). */
function loadGallery(): GalleryItem[] {
  if (typeof window === "undefined") return MOCK_GALLERY;
  try {
    const raw = window.localStorage.getItem(GALLERY_STORAGE_KEY);
    if (!raw) return MOCK_GALLERY;
    const parsed = JSON.parse(raw) as GalleryItem[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MOCK_GALLERY;
  } catch {
    return MOCK_GALLERY;
  }
}

/** Simpan galeri ke localStorage — diabaikan saat SSR/storage diblok. */
function persistGallery(items: GalleryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage penuh/di-block — mock tetap hidup di memori */
  }
}

const MOCK_GALLERY: GalleryItem[] = [
  { id: "gal-1", title: "Panorama Kawah Putih", image_url: "https://picsum.photos/seed/kp-galeri-1/800/800", category: "Pemandangan", sort_order: 1, uploaded_by: "admin" },
  { id: "gal-2", title: "Dermaga Bambu", image_url: "https://picsum.photos/seed/kp-galeri-2/800/800", category: "Spot Foto", sort_order: 2, uploaded_by: "admin" },
  { id: "gal-3", title: "Kabut Pagi di Kawah", image_url: "https://picsum.photos/seed/kp-galeri-3/800/800", category: "Pemandangan", sort_order: 3, uploaded_by: "admin" },
  { id: "gal-4", title: "Hutan Pinus Ciwidey", image_url: "https://picsum.photos/seed/kp-galeri-4/800/800", category: "Pemandangan", sort_order: 4, uploaded_by: "admin" },
  { id: "gal-5", title: "Jalur Setapak Pengunjung", image_url: "https://picsum.photos/seed/kp-galeri-5/800/800", category: "Aktivitas", sort_order: 5, uploaded_by: "admin" },
  { id: "gal-6", title: "Warna Danau Toska", image_url: "https://picsum.photos/seed/kp-galeri-6/800/800", category: "Pemandangan", sort_order: 6, uploaded_by: "admin" },
  { id: "gal-7", title: "Wisatawan di Tepi Kawah", image_url: "https://picsum.photos/seed/kp-galeri-7/800/800", category: "Aktivitas", sort_order: 7, uploaded_by: "admin" },
  { id: "gal-8", title: "Senja di Area Parkir", image_url: "https://picsum.photos/seed/kp-galeri-8/800/800", category: "Pemandangan", sort_order: 8, uploaded_by: "admin" },
  { id: "gal-9", title: "Papan Nama Kawah Putih", image_url: "https://picsum.photos/seed/kp-galeri-9/800/800", category: "Spot Foto", sort_order: 9, uploaded_by: "admin" },
  { id: "gal-10", title: "Uap Belerang Tipis", image_url: "https://picsum.photos/seed/kp-galeri-10/800/800", category: "Pemandangan", sort_order: 10, uploaded_by: "admin" },
  { id: "gal-11", title: "Rombongan Sekolah", image_url: "https://picsum.photos/seed/kp-galeri-11/800/800", category: "Aktivitas", sort_order: 11, uploaded_by: "admin" },
  { id: "gal-12", title: "Tenda Piknik Keluarga", image_url: "https://picsum.photos/seed/kp-galeri-12/800/800", category: "Fasilitas", sort_order: 12, uploaded_by: "admin" },
];

export const galleryService = {
  /** Daftar foto galeri, opsional difilter kategori & dibatasi jumlahnya. */
  async list(params?: { page?: number; limit?: number; category?: string }): Promise<GalleryItem[]> {
    const { limit, category } = params ?? {};
    let items = [...loadGallery()].sort((a, b) => a.sort_order - b.sort_order);
    if (category) items = items.filter((i) => i.category === category);
    if (limit) items = items.slice(0, limit);
    return items;
  },

  /** Tambah foto ke galeri (sort_order otomatis di belakang). */
  async create(payload: CreateGalleryItemPayload): Promise<GalleryItem> {
    const items = loadGallery();
    const maxOrder = items.reduce((max, i) => Math.max(max, i.sort_order), 0);
    const item: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: payload.title,
      image_url: payload.image_url,
      category: payload.category ?? "Umum",
      sort_order: payload.sort_order ?? maxOrder + 1,
      uploaded_by: "admin",
    };
    items.unshift(item);
    persistGallery(items);
    return item;
  },

  /** Hapus foto galeri. */
  async remove(id: string): Promise<void> {
    const items = loadGallery();
    persistGallery(items.filter((i) => i.id !== id));
  },
};
