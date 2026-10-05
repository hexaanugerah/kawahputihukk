// ============================================================================
// MOCK DATA — sumber data sementara.
//
// Sesuai permintaan: tampilan frontend harus mengikuti desain UI/UX
// (UIUXAdmin / UIUXManager / UIUXPetugas / UIUXHalamanUtama) dan DISAMBUNGKAN
// KE BACKEND, tetapi BELUM ke database. Semua angka & baris di file ini
// diambil apa adanya dari wireframe desain sehingga halaman langsung
// tampil utuh tanpa perlu MySQL berjalan.
//
// Cara pindah ke backend nyata nanti: ganti pemanggilan fungsi di
// `frontend/services/report.service.ts` (dan service lain) dari mock ke
// axiosInstance — bentuk tipenya sudah sengaja dibuat sama dengan envelope
// ApiResponse<T> backend, jadi penggantian tidak menyentuh komponen.
// ============================================================================

// ---------------------------------------------------------------- Admin ----

export interface AdminKpi {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
}

export const adminDashboardKpis: [AdminKpi, AdminKpi, AdminKpi, AdminKpi, AdminKpi] = [
  { label: "Total Tiket Terjual", value: "3.562", delta: "15% dari kemarin", trend: "up" },
  { label: "Total Booking", value: "1.248", delta: "12% dari kemarin", trend: "up" },
  { label: "Pendapatan", value: "Rp 178.540.000", delta: "14% dari kemarin", trend: "up" },
  { label: "Pengunjung Hari Ini", value: "742", delta: "11% dari kemarin", trend: "up" },
  { label: "Booking Hari Ini", value: "186", delta: "8% dari kemarin", trend: "up" },
];

export const adminTotalPengunjung = { value: "3.421", delta: "10% dari kemarin" };

export interface SalesPoint {
  label: string;
  value: number;
}

export const ticketSales7Days: SalesPoint[] = [
  { label: "Sen", value: 420 },
  { label: "Sel", value: 480 },
  { label: "Rab", value: 395 },
  { label: "Kam", value: 520 },
  { label: "Jum", value: 610 },
  { label: "Sab", value: 780 },
  { label: "Min", value: 690 },
];

export const adminReportCards = [
  { key: "penjualan", title: "Laporan Penjualan", desc: "Ringkasan data dan statistik wisata." },
  { key: "kunjungan", title: "Laporan Kunjungan", desc: "Statistik kunjungan wisatawan." },
  { key: "tiket", title: "Laporan Tiket", desc: "Informasi dan data tiket wisata." },
  { key: "pembayaran", title: "Laporan Pembayaran", desc: "Data pembayaran tiket wisata." },
];

export interface StaffRow {
  id: string;
  no: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export const staffRows: StaffRow[] = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
  id: `petugas-${n}`,
  no: n,
  name: `Petugas ${n}`,
  email: `petugas${n}@kawahputih.id`,
  role: "Petugas",
  status: n === 7 ? "Nonaktif" : "Aktif",
}));

export const adminContentMenu = [
  { key: "informasi", title: "Informasi Kawah Putih", desc: "Informasi lengkap mengenai destinasi, sejarah, dan daya tarik Kawah Putih." },
  { key: "galeri", title: "Galeri", desc: "Kumpulan foto dan dokumentasi keindahan Kawah Putih dan area wisata." },
  { key: "faq", title: "FAQ", desc: "Kumpulan pertanyaan yang sering diajukan oleh pengunjung." },
  { key: "fasilitas", title: "Informasi Fasilitas", desc: "Informasi fasilitas dan layanan yang tersedia untuk kenyamanan pengunjung." },
  { key: "aturan", title: "Aturan Kunjungan", desc: "Panduan dan ketentuan yang perlu diperhatikan selama berkunjung." },
];

export interface VisitorRow {
  id: string;
  no: number;
  name: string;
  email: string;
  joined: string;
}

export const visitorRows: VisitorRow[] = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
  id: `pengunjung-${n}`,
  no: n,
  name: `Pengunjung ${n}`,
  email: `pengunjung${n}@gmail.com`,
  joined: "17 Sept 2025",
}));

export interface PurchaseRow {
  id: string;
  no: number;
  code: string;
  name: string;
  amount: string;
  date: string;
  status: string;
}

export const purchaseRows: PurchaseRow[] = [
  { id: "p-1", no: 1, code: "TRX-982341", name: "Pengunjung 1", amount: "Rp 62.000", date: "17 Sept 2025", status: "Berhasil" },
  { id: "p-2", no: 2, code: "TRX-982342", name: "Pengunjung 2", amount: "Rp 124.000", date: "17 Sept 2025", status: "Berhasil" },
  { id: "p-3", no: 3, code: "TRX-982343", name: "Pengunjung 3", amount: "Rp 31.000", date: "16 Sept 2025", status: "Gagal" },
  { id: "p-4", no: 4, code: "TRX-982344", name: "Pengunjung 4", amount: "Rp 55.000", date: "16 Sept 2025", status: "Menunggu" },
];

export interface PaymentRow {
  id: string;
  no: number;
  status: string;
  transaction: string;
  method: string;
}

export const paymentRows: PaymentRow[] = [
  { id: "pay-1", no: 1, status: "Berhasil", transaction: "TRX-982341", method: "QRIS" },
  { id: "pay-2", no: 2, status: "Gagal", transaction: "TRX-982342", method: "QRIS" },
  { id: "pay-3", no: 3, status: "Menunggu", transaction: "TRX-982343", method: "QRIS" },
  { id: "pay-4", no: 4, status: "Menunggu", transaction: "TRX-982344", method: "QRIS" },
];

export interface BookingRow {
  id: string;
  no: number;
  code: string;
  name: string;
  date: string;
  status: string;
}

export const bookingRows: BookingRow[] = [
  { id: "b-1", no: 1, code: "kd12345678", name: "Dena", date: "17 Sept 2025", status: "Berhasil" },
  { id: "b-2", no: 2, code: "kd12345679", name: "Hexa", date: "17 Sept 2025", status: "Aktif" },
  { id: "b-3", no: 3, code: "kd12345680", name: "Udin", date: "17 Sept 2025", status: "Menunggu" },
  { id: "b-4", no: 4, code: "kd12345681", name: "Aep", date: "17 Sept 2025", status: "Dibatalkan" },
  { id: "b-5", no: 5, code: "kd12345682", name: "Siti", date: "16 Sept 2025", status: "Selesai" },
  { id: "b-6", no: 6, code: "kd12345683", name: "Andi", date: "16 Sept 2025", status: "Berhasil" },
];

export const bookingSummary = {
  total: "1.248",
  selesai: "1.012",
  berhasil: "982",
  menunggu: "143",
  dibatalkan: "56",
};

export interface TicketTypeRow {
  id: string;
  no: number;
  name: string;
  price: string;
  status: string;
}

export const ticketTypes: TicketTypeRow[] = [
  { id: "t-1", no: 1, name: "HTM WISATAWAN NUSANTARA", price: "Rp31.000", status: "Aktif" },
  { id: "t-2", no: 2, name: "HTM WISATAWAN MANCANEGARA", price: "Rp90.000", status: "Aktif" },
  { id: "t-3", no: 3, name: "LHKP (Lintas Hutan Kawah Putih)", price: "Rp179.000", status: "Aktif" },
  { id: "t-4", no: 4, name: "ONTANG ANTING", price: "Rp32.000", status: "Aktif" },
  { id: "t-5", no: 5, name: "KUDA TUNGGANG", price: "Rp55.000", status: "Aktif" },
  { id: "t-6", no: 6, name: "PANAHAN", price: "Rp22.000", status: "Aktif" },
  { id: "t-7", no: 7, name: "SUNAN IBU", price: "Rp15.000", status: "Aktif" },
];

// -------------------------------------------------------------- Manager ----

export interface ManagerKpi {
  label: string;
  value: string;
}

export const managerDashboardKpis: [ManagerKpi, ManagerKpi, ManagerKpi] = [
  { label: "Tiket Terjual", value: "9.968" },
  { label: "Total Booking", value: "1.248" },
  { label: "Total Pendapatan", value: "Rp 123,4 jt" },
];

export const managerTotalPengunjung = "7.932";

export const managerVisitorTrend: SalesPoint[] = [
  { label: "Sen", value: 780 },
  { label: "Sel", value: 910 },
  { label: "Rab", value: 860 },
  { label: "Kam", value: 1120 },
  { label: "Jum", value: 1240 },
  { label: "Sab", value: 1620 },
  { label: "Min", value: 1402 },
];

export const bestSellingTickets = [
  { name: "Sunan Ibu", value: 78 },
  { name: "Jembatan Apung", value: 60 },
  { name: "Ontang Anting", value: 43 },
  { name: "HTM Nusantara", value: 30 },
];

export interface ActivityRow {
  id: string;
  time: string;
  activity: string;
  note: string;
  status: string;
}

export const recentActivities: ActivityRow[] = [
  { id: "a-1", time: "08:32", activity: "Booking baru", note: "Transaksi berhasil", status: "Berhasil" },
  { id: "a-2", time: "08:41", activity: "Validasi tiket", note: "Tiket QR-24001", status: "Berhasil" },
  { id: "a-3", time: "09:05", activity: "Pembayaran", note: "Menunggu konfirmasi", status: "Menunggu" },
  { id: "a-4", time: "09:27", activity: "Booking dibatalkan", note: "Oleh pengunjung", status: "Dibatalkan" },
];

export const managerSalesTickets = [
  { name: "Tiket Sunrise", value: 4000 },
  { name: "Tiket Wahana", value: 3114 },
  { name: "HTM", value: 2322 },
  { name: "Ontang Anting", value: 532 },
];

export const managerSalesDetail = [
  { name: "Sunan Ibu", value: 78 },
  { name: "Wahana", value: 60 },
  { name: "HTM", value: 45 },
  { name: "Ontang Anting", value: 30 },
];
export const managerSalesTotal = "9.968";

export const managerRevenueMonthly = [
  { name: "Januari", value: "Rp 18.200.000" },
  { name: "Februari", value: "Rp 21.500.000" },
  { name: "Maret", value: "Rp 19.800.000" },
];

export const managerRevenueByTicket = [
  { name: "Sunrise", value: "Rp 52.000.000" },
  { name: "Wahana", value: "Rp 31.000.000" },
  { name: "HTM", value: "Rp 25.000.000" },
];

export const managerTotalRevenue = "Rp 123.456.789";

export const managerBookingList: BookingRow[] = [
  { id: "mb-1", no: 1, code: "KP-20250921-00123", name: "Hexa Anugerah", date: "21 Sep 2025", status: "Berhasil" },
  { id: "mb-2", no: 2, code: "KP-20250921-00122", name: "Siti Nurhaliza", date: "21 Sep 2025", status: "Menunggu" },
  { id: "mb-3", no: 3, code: "KP-20250921-00121", name: "Andi Pratama", date: "21 Sep 2025", status: "Dibatalkan" },
  { id: "mb-4", no: 4, code: "KP-20250920-00120", name: "Rina Marina", date: "20 Sep 2025", status: "Selesai" },
  { id: "mb-5", no: 5, code: "KP-20250920-00119", name: "Budi Santoso", date: "20 Sep 2025", status: "Berhasil" },
];

export const visitorBreakdown = [
  { name: "Dewasa", value: 4000 },
  { name: "Anak-anak", value: 234 },
  { name: "Lansia", value: 134 },
  { name: "Rombongan", value: 3564 },
];
export const visitorBreakdownTotal = "7.932";

export interface OfficerRow {
  id: string;
  name: string;
  validated: number;
  activeTime: string;
  status: "Aktif" | "Nonaktif";
}

export const officerRows: OfficerRow[] = [
  { id: "o-1", name: "Deni Saputra", validated: 580, activeTime: "7j 42m", status: "Aktif" },
  { id: "o-2", name: "Sari Dewi", validated: 492, activeTime: "7j 10m", status: "Aktif" },
  { id: "o-3", name: "Ricky Maulana", validated: 401, activeTime: "6j 58m", status: "Aktif" },
  { id: "o-4", name: "Agus Setiawan", validated: 310, activeTime: "5j 31m", status: "Nonaktif" },
];

export const officerTotals = { active: "18", total: "24", validated: "2.350" };

export const validationPerHour: SalesPoint[] = [
  { label: "08:00", value: 78 },
  { label: "10:00", value: 60 },
  { label: "12:00", value: 45 },
  { label: "14:00", value: 30 },
];

// -------------------------------------------------------------- Petugas ----

export const petugasKpis = [
  { label: "Jumlah Pengunjung", sub: "Hari Ini", value: "7.932" },
  { label: "Tiket Sudah", sub: "Digunakan", value: "6.245" },
  { label: "Tiket Belum", sub: "Digunakan", value: "1.687" },
  { label: "Tiket", sub: "Bermasalah", value: "24" },
];

export interface ScanRow {
  id: string;
  no: number;
  time: string;
  code: string;
  name: string;
  officer: string;
  status: string;
}

export const scanHistory: ScanRow[] = [
  { id: "s-1", no: 1, time: "08:12", code: "KP-24001", name: "Siti", officer: "Petugas 01", status: "Valid" },
  { id: "s-2", no: 2, time: "08:18", code: "KP-24002", name: "Andini", officer: "Petugas 01", status: "Valid" },
  { id: "s-3", no: 3, time: "08:25", code: "KP-24003", name: "Hexa", officer: "Petugas 01", status: "Valid" },
  { id: "s-4", no: 4, time: "08:31", code: "KP-24004", name: "dena", officer: "Petugas 01", status: "Valid" },
  { id: "s-5", no: 5, time: "08:44", code: "KP-24005", name: "Rizky Dracin", officer: "Petugas 01", status: "Valid" },
];

export const petugasTicketDetail = {
  bookingName: "Hexa Anugerah",
  email: "email@email.com",
  code: "KP-24001",
  date: "21 September 2026",
  quantity: 2,
  status: "Valid",
};

// --------------------------------------------------------------- Public ----

export const visitorStories = [
  { name: "Dena", origin: "Bandung", quote: "Kawah Putih sungguh memukau — kabut tipis di pagi hari membuat suasana terasa magis dan tak terlupakan." },
  { name: "Hexa", origin: "Jakarta", quote: "Pemandangan danau berwarna putih kehijauan benar-benar berbeda dari tempat wisata lain. Perjalanan yang layak." },
  { name: "Siti", origin: "Cimahi", quote: "Udara sejuk, panorama indah, dan akses yang mudah. Kami sekeluarga sangat menikmati kunjungan kali ini." },
];

export const homeTicketOptions = [
  { key: "reguler", title: "Tiket Reguler", desc: "Akses masuk kawasan Kawah Putih", price: "Rp31.000", quantity: 1 },
  { key: "parkir", title: "Tiket Parkir", desc: "Biaya parkir kendaraan", price: "Rp22.000", quantity: 1 },
  { key: "tambahan", title: "Tiket Tambahan", desc: "Wahana & aktivitas pilihan", price: "Rp55.000", quantity: 1 },
];

export const faqItems = [
  { q: "Bagaimana cara membeli tiket?", a: "Pilih menu “Pesan Tiket”, tentukan tanggal kunjungan dan jumlah tiket, lalu lanjutkan ke pembayaran. E-tiket akan dikirim setelah pembayaran dikonfirmasi." },
  { q: "Apa saja fasilitas yang tersedia?", a: "Kawah Putih menyediakan area parkir, pusat informasi, musala, toilet, kafetaria, serta jalur pejalan kaki menuju kawah." },
  { q: "Jam operasional Kawah Putih?", a: "Kawasan dibuka setiap hari pukul 07.00 – 17.00 WIB. Disarankan datang pada pagi hari untuk mendapatkan suasana kabut terbaik." },
  { q: "Apakah tiket bisa dipesan online?", a: "Ya. Seluruh tiket dapat dipesan secara online melalui website ini dan dibayar melalui QRIS, transfer bank, atau kartu." },
  { q: "Apa aturan yang perlu diperhatikan?", a: "Tetap berada di jalur yang disediakan, tidak membuang sampah, dilarang berenang di area kawah, dan ikuti arahan petugas." },
  { q: "Bagaimana cara melihat e-tiket?", a: "E-tiket tersedia di halaman E-Tiket setelah pembayaran. Anda dapat mengunduh, mencetak, atau membagikannya." },
];

export const aboutHistory = "Kawah Putih merupakan danau kawah vulkanik yang berada di kawasan Gunung Patuha, Ciwidey, Jawa Barat. Danau ini terbentuk dari aktivitas vulkanik dan memiliki air berwarna putih kehijauan yang dapat berubah mengikuti kondisi alam. Keunikan warna dan suasana berkabutnya menjadikan Kawah Putih salah satu destinasi wisata alam yang menarik di Jawa Barat.";

export const aboutSections = [
  { key: "fasilitas", title: "Fasilitas", body: "Area parkir luas, pusat informasi wisata, musala, toilet bersih, kafetaria, serta jalur pejalan kaki yang aman menuju bibir kawah." },
  { key: "informasi", title: "Informasi Destinasi", body: "Informasi destinasi diperbarui secara berkala — termasuk jam operasional, harga tiket, dan kondisi cuaca terkini." },
  { key: "aturan", title: "Aturan Kunjungan", body: "Jaga kebersihan kawasan, ikuti jalur yang tersedia, dilarang berenang, dan selalu patuhi arahan petugas di lapangan." },
];

export const eTicket = {
  bookingCode: "KWP-2026-XXXX",
  bookingName: "Hexa Anugerah",
  visitDate: "21 September 2026",
  note: "Tiket ini hanya berlaku untuk tanggal yang tertera pada e-tiket.",
};

// ----------------------------------------------------- Alur pemesanan ----

// Jenis tiket + harga (rupiah) untuk alur pemesanan publik.
export interface OrderTicket {
  key: string;
  title: string;
  desc: string;
  price: number;
}

export const orderTickets: OrderTicket[] = [
  { key: "reguler", title: "Tiket Reguler", desc: "Akses masuk kawasan Kawah Putih", price: 31000 },
  { key: "parkir", title: "Tiket Parkir", desc: "Biaya parkir kendaraan", price: 22000 },
  { key: "tambahan", title: "Tiket Tambahan", desc: "Wahana & aktivitas pilihan", price: 55000 },
];

export const paymentMethods = [
  { key: "ewallet", label: "E-Wallet" },
  { key: "transfer", label: "Transfer Bank" },
  { key: "kartu", label: "Kartu" },
] as const;

export interface BookingOrder {
  code: string;
  name: string;
  email: string;
  phone: string;
  visitDate: string;
  visitors: { title: string; quantity: number; price: number }[];
  total: number;
}

export const mockOrder: BookingOrder = {
  code: "KWP-2026-XXXX",
  name: "Hexa Anugerah",
  email: "email@email.com",
  phone: "081234567890",
  visitDate: "21 September 2026",
  visitors: [
    { title: "Tiket Reguler", quantity: 2, price: 31000 },
    { title: "Tiket Parkir", quantity: 1, price: 22000 },
  ],
  total: 84000,
};

// --------------------------------------------------------------- Kode ----

export const ADMIN_SIDEBAR = [
  "Dashboard",
  "Kelola Tiket",
  "Kelola Booking",
  "Kelola Pembayaran",
  "Kelola Pengunjung",
  "Kelola Petugas",
  "Kelola Konten",
  "Laporan",
] as const;

export const MANAGER_SIDEBAR = [
  { section: "Dashboard", items: ["Dashboard"] },
  { section: "Statistik", items: ["Penjualan"] },
  { section: "Laporan", items: ["Pendapatan", "Booking", "Statistik Pengunjung"] },
  { section: "Monitoring", items: ["Petugas"] },
] as const;

export const PETUGAS_SIDEBAR = ["Dashboard", "Sqan QR", "Riwayat Validasi", "Detail Tiket"] as const;
