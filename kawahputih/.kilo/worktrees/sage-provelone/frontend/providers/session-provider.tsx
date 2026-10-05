"use client";

// This project does NOT use NextAuth/next-auth's SessionProvider — the
// backend issues its own JWT access/refresh token pair (see auth domain),
// and the frontend tracks the session via store/auth.store.ts (Zustand,
// persisted to localStorage), not a server-side session cookie. This
// component exists only to satisfy Part 2.3's providers/ structure and as
// the documented place a real session rehydration step would go if this
// project ever adds server-side session validation (e.g. an RSC that reads
// the auth cookie and calls the backend to validate it before rendering).
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
