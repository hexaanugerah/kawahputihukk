// ============================================================================
// AUTH CONFIG — SATU-SATUNYA tempat kredensial mock disimpan.
//
// Ubah email/password/role akun demo di sini tanpa menyentuh logika
// autentikasi. Nilai ini HANYA untuk mode demo frontend (tanpa database).
// Ketika backend nyata tersedia, service auth akan memanggil API dan file
// ini tidak lagi dipakai untuk validasi kredensial.
// ============================================================================

/** Role aplikasi — dipakai lintas modul (auth, guard, sidebar, redirect). */
export const APP_ROLES = ["PENGUNJUNG", "ADMIN", "MANAGER", "PETUGAS"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export interface MockAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: AppRole;
  phone: string;
  /** Panel/gate petugas — hanya relevan untuk role PETUGAS. */
  gate?: string;
  shift?: string;
}

/**
 * Akun demo. Kredensial di sini TIDAK aman — hanya untuk prototipe.
 * role disimpan apa adanya; mapping ke role internal backend-style
 * (visitor/admin/manager/staff_ticketing) dilakukan di auth service.
 */
export const MOCK_ACCOUNTS: Record<"pengunjung" | "admin" | "manager" | "petugas", MockAccount> = {
  pengunjung: {
    id: "usr-pengunjung",
    name: "Pengunjung Demo",
    email: "pengunjung@gmail.com",
    password: "user1234",
    role: "PENGUNJUNG",
    phone: "081200000001",
  },
  admin: {
    id: "usr-admin",
    name: "Admin Kawah Putih",
    email: "admin@kawahputih.com",
    password: "adminPass2026!",
    role: "ADMIN",
    phone: "081200000002",
  },
  manager: {
    id: "usr-manager",
    name: "Manager Operasional",
    email: "manager@kawahputih.com",
    password: "managerPass2026!",
    role: "MANAGER",
    phone: "081200000003",
  },
  petugas: {
    id: "usr-petugas",
    name: "Petugas Gerbang 1",
    email: "petugas_gerbang1@kawahputih.com",
    password: "petugasGate1!",
    role: "PETUGAS",
    phone: "081200000004",
    gate: "Gerbang 1",
    shift: "Pagi (07:00 - 15:00)",
  },
};

/** Daftar akun demo untuk account-selector di halaman login (dev aid). */
export const DEMO_ACCOUNT_LIST = Object.values(MOCK_ACCOUNTS);

/** Redirect tujuan setelah login sukses, per role. */
export const ROLE_HOME: Record<AppRole, string> = {
  PENGUNJUNG: "/dashboard",
  ADMIN: "/admin/dashboard",
  MANAGER: "/manager/dashboard",
  PETUGAS: "/petugas/dashboard",
};

/** Durasi sesi mock (ms). Simulasi "sesi kadaluarsa". */
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 8; // 8 jam

/** Nama key localStorage sesi auth. */
export const AUTH_STORAGE_KEY = "kpr-auth";
export const AUTH_COOKIE_NAME = "kpr_access_token";
