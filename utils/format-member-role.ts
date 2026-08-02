import { ROLE_LABELS } from "@/constants/roles";
import type { Role } from "@/types/roles";

/** "admin" -> "Admin" — the human-facing label shown in dashboards and member lists. */
export function formatMemberRole(role: Role): string {
  return ROLE_LABELS[role];
}
