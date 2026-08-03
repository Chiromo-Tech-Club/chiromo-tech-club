import { auth, currentUser } from "@clerk/nextjs/server";
import { isRole, roleAtLeast, type Role } from ".././../types/roles";
import { DEFAULT_ROLE } from ".././../constants/roles";

/**
 * Thin wrapper around Clerk's server helpers so the rest of the app never
 * imports "@clerk/nextjs/server" directly — swapping auth providers later
 * only touches this file.
 */
export { auth, currentUser };

/**
 * Reads the caller's role from Clerk's `publicMetadata.role`, set by the
 * admin portal when a member is promoted. Falls back to DEFAULT_ROLE if
 * unset or malformed, so a missing metadata field fails closed, not open.
 */
export async function getCurrentRole(): Promise<Role> {
  const user = await currentUser();
  const rawRole = user?.publicMetadata?.role;
  return isRole(rawRole) ? rawRole : DEFAULT_ROLE;
}

export async function requireRole(required: Role): Promise<{ ok: true } | { ok: false; role: Role }> {
  const role = await getCurrentRole();
  return roleAtLeast(role, required) ? { ok: true } : { ok: false, role };
}
