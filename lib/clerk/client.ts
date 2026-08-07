import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { isRole, roleAtLeast, type Role } from "@/types/roles";
import { isExecTitle, type ExecTitle } from "@/types/exec-title";
import { DEFAULT_ROLE } from "@/constants/roles";

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

/** Only meaningful when getCurrentRole() === "exec" — which named seat they hold. */
export async function getCurrentExecTitle(): Promise<ExecTitle | null> {
  const user = await currentUser();
  const raw = user?.publicMetadata?.execTitle;
  return isExecTitle(raw) ? raw : null;
}

export async function requireRole(required: Role): Promise<{ ok: true } | { ok: false; role: Role }> {
  const role = await getCurrentRole();
  return roleAtLeast(role, required) ? { ok: true } : { ok: false, role };
}

/**
 * Gate for a role-specific dashboard section (e.g. /dashboard/treasurer/*).
 * Admins can view every section (for oversight/building); an exec can only
 * view sections under their own title; everyone else is denied.
 */
export async function canAccessExecSection(sectionTitle: ExecTitle): Promise<boolean> {
  const role = await getCurrentRole();
  if (role === "admin") return true;
  if (role !== "exec") return false;
  const execTitle = await getCurrentExecTitle();
  return execTitle === sectionTitle;
}

/**
 * Sets a user's role (and exec title, if applicable) in Clerk's
 * publicMetadata — the source of truth `getCurrentRole()` reads from.
 * This is the Clerk-side half of promoting a member; callers are
 * responsible for also updating the mirrored `members.role` /
 * `members.execTitle` columns in the database so the two never drift.
 */
export async function setUserRole(clerkUserId: string, role: Role, execTitle: ExecTitle | null): Promise<void> {
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: {
      role,
      execTitle: role === "exec" ? execTitle : null,
    },
  });
}
