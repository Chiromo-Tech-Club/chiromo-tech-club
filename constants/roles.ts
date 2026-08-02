/**
 * Role constants — single source of truth for role-based access.
 * `types/roles.ts` derives its union type from this array so the two
 * can never drift out of sync.
 */
export const ROLES = ["admin", "exec", "member", "visitor"] as const;

export const ROLE_LABELS: Record<(typeof ROLES)[number], string> = {
  admin: "Admin",
  exec: "Executive",
  member: "Member",
  visitor: "Visitor",
};

/** Default role assigned to a newly-created account. */
export const DEFAULT_ROLE: (typeof ROLES)[number] = "visitor";
