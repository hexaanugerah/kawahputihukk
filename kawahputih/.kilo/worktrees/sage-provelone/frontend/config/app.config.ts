// ============================================================================
// APP CONFIG — pengaturan umum aplikasi (brand, kapasitas, biaya, dsb).
// Semua nilai yang mungkin perlu diubah pemilik proyek dikumpulkan di sini.
// ============================================================================

export const APP_CONFIG = {
  name: "Kawah Putih Rancabali",
  shortName: "Kawah Putih",
  tagline: "Wisata Alam Bandung",
  currency: "IDR",
  /** Kapasitas pengunjung per hari — dipakai simulasi ketersediaan tanggal. */
  dailyVisitorCapacity: 1000,
  operationalHour: { open: "07:00", close: "17:00" },
  contact: {
    address: "Jl. Raya Soreang - Ciwidey No.KM.25, Ciwidey, Bandung, Jawa Barat",
    phone: "022-1234567",
    email: "info@kawahputih.com",
  },
} as const;

export const BOOKING_CONFIG = {
  /** Tanggal minimum pemesanan (hari dari sekarang). */
  minDaysAhead: 0,
  /** Batas maksimum pemesanan ke depan (hari). */
  maxDaysAhead: 30,
  /** Maksimum tiket per jenis dalam satu pesanan. */
  maxQuantityPerTicket: 20,
  /** Biaya layanan flat per transaksi (Rp). */
  serviceFee: 2500,
  /** Persentase diskon promo (0 = nonaktif). */
  discountPercent: 0,
  /** Pajak (0 = nonaktif). */
  taxPercent: 0,
  /** Kadaluarsa pembayaran QRIS mock (menit). */
  paymentExpiryMinutes: 15,
  /**
   * Simulasi pembayaran: peluang sukses (0-1). PENTING untuk demo:
   * pembayaran HAMPIR selalu sukses agar alur e-tiket mudah ditunjukkan.
   * Set `forceOutcome` untuk memaksa hasil tertentu saat demo.
   */
  paymentSuccessRate: 0.9,
} as const;

/** Key localStorage database mock. */
export const MOCK_DB_STORAGE_KEY = "kpr-mock-db-v1";

/** Latensi simulasi request mock (ms). */
export const MOCK_LATENCY_MS = 300;
