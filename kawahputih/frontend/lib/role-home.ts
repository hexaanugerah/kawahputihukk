export function roleHome(roles: string[] = []) {
  if (roles.some((role) => ["admin", "super_admin"].includes(role))) return "/admin/dashboard";
  if (roles.includes("manager")) return "/manager/dashboard";
  if (roles.includes("staff_ticketing")) return "/petugas/dashboard";
  return "/dashboard";
}
