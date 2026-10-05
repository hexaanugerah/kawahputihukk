// The backend's AuthResponse doesn't include a `roles` field on the user
// object (see types/auth.ts's comment) — but the access token's JWT payload
// does (jwtutil.Claims.Roles on the backend). Decoding it client-side here
// is safe because we're only reading a claim for DISPLAY/UX purposes (which
// nav links to show); the backend independently re-verifies the token's
// signature and role on every actual API call, so a tampered/fake token
// decoded here would just show the wrong menu, never grant real access.
export function decodeRolesFromToken(token: string): string[] {
  try {
    const payload = token.split(".")[1];
    if (!payload) return [];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return Array.isArray(decoded.roles) ? decoded.roles : [];
  } catch {
    return [];
  }
}
