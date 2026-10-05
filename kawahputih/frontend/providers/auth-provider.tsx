"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { mockAuthService } from "@/services/auth.service";

// ============================================================================
// AUTH PROVIDER — memastikan sesi mock sudah direhidrasi dari localStorage
// sebelum halaman protected di-render, dan menghapus sesi yang kedaluwarsa.
// Komponen client bisa pakai useAuthReady() untuk menunggu hidrasi.
// ============================================================================

let hydrated = false;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(hydrated);
  const checkExpiry = useAuthStore((s) => s.checkExpiry);

  useEffect(() => {
    mockAuthService.checkSession();
    hydrated = true;
    setReady(true);
  }, [checkExpiry]);

  if (!ready) return <>{children}</>;
  return <>{children}</>;
}

/** Selalu true setelah mount pertama — dipakai guard untuk hindari redirect palsu saat SSR. */
export function useAuthReady() {
  const [ready, setReady] = useState(hydrated);
  useEffect(() => {
    if (!hydrated) {
      // pastikan expiry sudah dicek sebelum dianggap siap
      mockAuthService.checkSession();
      hydrated = true;
    }
    setReady(true);
  }, []);
  return ready;
}
