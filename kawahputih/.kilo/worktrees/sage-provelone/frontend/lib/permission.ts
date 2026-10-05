// Client-side role checks are UX-only (hide/show a button) — the backend
// is the actual enforcement point via RequireRole middleware. Never trust
// this function's result for anything security-sensitive; it exists so the
// UI doesn't show an "Edit" button the API would reject anyway.
export function hasRole(userRoles: string[], ...allowed: string[]): boolean {
  return userRoles.some((r) => allowed.includes(r));
}

export function isAdmin(userRoles: string[]): boolean {
  return hasRole(userRoles, "admin", "super_admin");
}
