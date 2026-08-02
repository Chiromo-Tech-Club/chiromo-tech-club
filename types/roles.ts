import { ROLES } from "../constants/roles";

/** Union type derived from ROLES so the constant and the type can't drift. */
export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** Simple role-hierarchy check: does `role` meet or exceed `required`? */
const ROLE_RANK: Record<Role, number> = {
  visitor: 0,
  member: 1,
  exec: 2,
  admin: 3,
};

export function roleAtLeast(role: Role, required: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[required];
}
