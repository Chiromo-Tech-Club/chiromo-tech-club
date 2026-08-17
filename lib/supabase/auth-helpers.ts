// ─────────────────────────────────────────────────────────────────────────
// CLERK (commented out — kept for reference / rollback)
// ─────────────────────────────────────────────────────────────────────────
// import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
// export { auth, currentUser };
//
// export async function getCurrentRole(): Promise<Role> {
//   const user = await currentUser();
//   const rawRole = user?.publicMetadata?.role;
//   return isRole(rawRole) ? rawRole : DEFAULT_ROLE;
// }
//
// export async function getCurrentExecTitle(): Promise<ExecTitle | null> {
//   const user = await currentUser();
//   const raw = user?.publicMetadata?.execTitle;
//   return isExecTitle(raw) ? raw : null;
// }
//
// export async function setUserRole(clerkUserId: string, role: Role, execTitle: ExecTitle | null): Promise<void> {
//   const client = await clerkClient();
//   await client.users.updateUserMetadata(clerkUserId, {
//     publicMetadata: { role, execTitle: role === "exec" ? execTitle : null },
//   });
// }
// ─────────────────────────────────────────────────────────────────────────

import { eq, isNull, and } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { members } from "@/lib/drizzle/schema";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isRole, roleAtLeast, type Role } from "@/types/roles";
import { isExecTitle, type ExecTitle } from "@/types/exec-title";
import { DEFAULT_ROLE } from "@/constants/roles";

/**
 * Thin wrapper so the rest of the app never imports "@/lib/supabase/server"
 * or Drizzle directly just to answer "who is this and what's their role" —
 * same intent as the old Clerk wrapper, new backend underneath.
 */

/** Gets the logged-in Supabase auth user's id, or null if not signed in. */
export async function getAuthUserId(): Promise<string | null> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Reads the caller's role straight from the `members` table (row where
 * id === auth.uid()) instead of Clerk's publicMetadata.role. Falls back to
 * DEFAULT_ROLE if unset, not signed in, or the row is soft-deleted — so a
 * missing/bad row fails closed, same guarantee the old version gave.
 */
export async function getCurrentRole(): Promise<Role> {
  const userId = await getAuthUserId();
  if (!userId) return DEFAULT_ROLE;

  const db = getDb();
  const [member] = await db
    .select({ role: members.role })
    .from(members)
    .where(and(eq(members.id, userId), isNull(members.deletedAt)))
    .limit(1);

  return isRole(member?.role) ? member.role : DEFAULT_ROLE;
}

/** Only meaningful when getCurrentRole() === "exec" — which named seat they hold. */
export async function getCurrentExecTitle(): Promise<ExecTitle | null> {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const db = getDb();
  const [member] = await db
    .select({ execTitle: members.execTitle })
    .from(members)
    .where(and(eq(members.id, userId), isNull(members.deletedAt)))
    .limit(1);

  return isExecTitle(member?.execTitle) ? member.execTitle : null;
}

export async function requireRole(required: Role): Promise<{ ok: true } | { ok: false; role: Role }> {
  const role = await getCurrentRole();
  return roleAtLeast(role, required) ? { ok: true } : { ok: false, role };
}

/**
 * Gate for a role-specific dashboard section (e.g. /dashboard/treasurer/*).
 * Admins can view every section (for oversight/building); an exec can only
 * view sections under their own title; everyone else is denied.
 * Unchanged logic — only getCurrentRole/getCurrentExecTitle's source changed.
 */
export async function canAccessExecSection(sectionTitle: ExecTitle): Promise<boolean> {
  const role = await getCurrentRole();
  if (role === "admin") return true;
  if (role !== "exec") return false;
  const execTitle = await getCurrentExecTitle();
  return execTitle === sectionTitle;
}

/**
 * Sets a member's role (and exec title, if applicable) directly on their
 * `members` row. This used to write to Clerk's publicMetadata AND require
 * callers to separately mirror the same values into `members` — now
 * `members` is the only place this lives, so there's nothing left to drift.
 */
export async function setUserRole(memberId: string, role: Role, execTitle: ExecTitle | null): Promise<void> {
  const db = getDb();
  await db
    .update(members)
    .set({ role, execTitle: role === "exec" ? execTitle : null, updatedAt: new Date() })
    .where(eq(members.id, memberId));
}