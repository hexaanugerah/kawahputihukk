import {
  DEMO_ACCOUNT_LIST,
  MOCK_ACCOUNTS,
  ROLE_HOME,
  type AppRole,
  type MockAccount,
} from "@/config/auth.config";
import { MOCK_LATENCY_MS } from "@/config/app.config";
import { useAuthStore, type SessionUser } from "@/store/auth.store";
import { getDB, mutateDB } from "@/lib/mock/db";
import type { LocalAccount } from "@/types/domain";

// ============================================================================
// AUTH SERVICE — autentikasi mock.
// Meniru bentuk API asli (async, delay, error) supaya penggantian ke backend
// nyata nanti hanya mengubah isi fungsi ini, bukan komponen.
//
// Kredensial TIDAK di-hardcode di sini — semuanya baca dari config/auth.config.
// ============================================================================

export class AuthError extends Error {}

function delay(ms = MOCK_LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toSessionUser(acc: MockAccount): SessionUser {
  return {
    id: acc.id,
    name: acc.name,
    email: acc.email,
    phone: acc.phone,
    role: acc.role,
    gate: acc.gate,
    shift: acc.shift,
  };
}

/** Daftar email akun demo bawaan (untuk pembeda akun lokal vs config). */
const BUILTIN_EMAILS = new Set(DEMO_ACCOUNT_LIST.map((a) => a.email));

export interface LoginResult {
  user: SessionUser;
  redirectTo: string;
}

export const mockAuthService = {
  /** Login dengan email/password. Melempar AuthError jika gagal. */
  async login(email: string, password: string, remember: boolean): Promise<LoginResult> {
    await delay();

    const normalized = email.trim().toLowerCase();

    // 1) Cek akun lokal hasil register (tersimpan di mock DB).
    const local = getDB().accounts.find((a) => a.email.toLowerCase() === normalized);
    if (local) {
      if (local.password !== password) throw new AuthError("Email atau password salah.");
      const user: SessionUser = { id: local.id, name: local.name, email: local.email, phone: local.phone, role: "PENGUNJUNG" };
      useAuthStore.getState().login(user, remember);
      return { user, redirectTo: ROLE_HOME.PENGUNJUNG };
    }

    // 2) Cek akun demo dari config.
    const acc = DEMO_ACCOUNT_LIST.find((a) => a.email.toLowerCase() === normalized);
    if (!acc) throw new AuthError("Email tidak terdaftar.");
    if (acc.password !== password) throw new AuthError("Password salah.");

    const user = toSessionUser(acc);
    useAuthStore.getState().login(user, remember);

    // Simpan lastLogin pada staf terkait (biar panel admin hidup).
    if (acc.role === "PETUGAS") {
      mutateDB((db) => ({
        ...db,
        staff: db.staff.map((s) => (s.email === acc.email ? { ...s, lastLogin: new Date().toISOString() } : s)),
      }));
    }

    return { user, redirectTo: ROLE_HOME[acc.role] };
  },

  /** Registrasi pengunjung baru — akun tersimpan di mock DB (localStorage). */
  async register(payload: { name: string; email: string; phone: string; password: string }): Promise<LoginResult> {
    await delay();

    const normalized = payload.email.trim().toLowerCase();
    if (BUILTIN_EMAILS.has(normalized) || getDB().accounts.some((a) => a.email.toLowerCase() === normalized)) {
      throw new AuthError("Email sudah terdaftar. Gunakan email lain.");
    }

    const account: LocalAccount = {
      id: `usr-local-${Date.now()}`,
      name: payload.name.trim(),
      email: normalized,
      password: payload.password,
      phone: payload.phone,
      role: "PENGUNJUNG",
      createdAt: new Date().toISOString(),
    };

    mutateDB((db) => ({ ...db, accounts: [...db.accounts, account] }));

    const user: SessionUser = { id: account.id, name: account.name, email: account.email, phone: account.phone, role: "PENGUNJUNG" };
    useAuthStore.getState().login(user, false);
    return { user, redirectTo: ROLE_HOME.PENGUNJUNG };
  },

  /** Update profil pengunjung (mode mock — hanya local state). */
  async updateProfile(patch: { name?: string; email?: string; phone?: string }): Promise<SessionUser> {
    await delay(200);
    const current = useAuthStore.getState().user;
    if (!current) throw new AuthError("Belum login.");

    useAuthStore.getState().updateUser(patch);

    // Sinkronkan juga akun lokal bila profilnya milik akun register.
    mutateDB((db) => ({
      ...db,
      accounts: db.accounts.map((a) => (a.id === current.id ? { ...a, ...patch, password: a.password } : a)),
    }));

    return { ...current, ...patch };
  },

  logout() {
    useAuthStore.getState().logout();
  },

  /** Cek kedaluwarsa sesi — dipanggil oleh AuthProvider saat mount. */
  checkSession() {
    useAuthStore.getState().checkExpiry();
  },
};

/** Helper untuk komponen: role home path. */
export function homeForRole(role: AppRole): string {
  return ROLE_HOME[role];
}

export { MOCK_ACCOUNTS };
