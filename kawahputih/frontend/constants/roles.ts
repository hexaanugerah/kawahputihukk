// Mirrors the backend's database/migrations/002_role.up.sql seed exactly —
// these string literals must match what the API actually returns in a
// user's `roles` array.
export const ROLES = {
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  OWNER: "owner",
  FINANCE_ADMIN: "finance_admin",
  STAFF_TICKETING: "staff_ticketing",
  STAFF_CONTENT: "staff_content",
  VISITOR: "visitor",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];
