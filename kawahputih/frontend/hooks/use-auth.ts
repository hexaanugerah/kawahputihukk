"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, type SessionUser } from "@/store/auth.store";
import { mockAuthService, AuthError } from "@/services/auth.service";
import type { AppRole } from "@/config/auth.config";

// ============================================================================
// AUTH HOOKS — jembatan komponen ↔ auth service.
// Komponen tidak memanggil service langsung; mereka pakai hook ini.
// ============================================================================

export function useUser(): SessionUser | null {
  return useAuthStore((s) => s.user);
}

export function useIsAuthenticated(): boolean {
  return useAuthStore((s) => s.user !== null);
}

export function useHasRole(): (...roles: AppRole[]) => boolean {
  const role = useAuthStore((s) => s.user?.role ?? null);
  return useCallback((...roles: AppRole[]) => role !== null && roles.includes(role), [role]);
}

interface LoginCredentials {
  email: string;
  password: string;
  remember: boolean;
}

export function useLogin(options?: { redirectTo?: string }) {
  const router = useRouter();
  return useCallback(
    async (creds: LoginCredentials): Promise<{ ok: true; redirectTo: string } | { ok: false; error: string }> => {
      try {
        const result = await mockAuthService.login(creds.email, creds.password, creds.remember);
        router.push(options?.redirectTo ?? result.redirectTo);
        return { ok: true, redirectTo: result.redirectTo };
      } catch (err) {
        const message = err instanceof AuthError ? err.message : "Terjadi kesalahan saat login.";
        return { ok: false, error: message };
      }
    },
    [router, options?.redirectTo]
  );
}

export function useRegister() {
  const router = useRouter();
  return useCallback(
    async (payload: { name: string; email: string; phone: string; password: string }) => {
      try {
        const result = await mockAuthService.register(payload);
        router.push(result.redirectTo);
        return { ok: true as const };
      } catch (err) {
        const message = err instanceof AuthError ? err.message : "Registrasi gagal.";
        return { ok: false as const, error: message };
      }
    },
    [router]
  );
}

export function useLogout() {
  const router = useRouter();
  return useCallback(() => {
    mockAuthService.logout();
    router.push("/login");
  }, [router]);
}

// Re-export untuk kompatibilitas dengan kode lama yang mengimpor useAuthStore.
export { useAuthStore };
export type { SessionUser };
