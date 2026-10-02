import { eq, isNull, and, sql } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { members, memberCommunities, memberEmails } from "@/lib/drizzle/schema";
import { ensureMembersColumns } from "@/lib/drizzle/ensure-members-columns";
import { getAuthUserId } from "@/lib/supabase/auth-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentMember = typeof members.$inferSelect & {
  communitySlugs: string[];
};

/** Pool/network failures must not be treated as "this person never registered". */
function isDatabaseUnavailable(err: unknown): boolean {
  const chunks: string[] = [];
  let current: unknown = err;
  for (let i = 0; i < 4 && current; i += 1) {
    if (current instanceof Error) chunks.push(current.message);
    if (typeof current === "object" && current && "code" in current) {
      chunks.push(String((current as { code?: unknown }).code));
    }
    current =
      typeof current === "object" && current && "cause" in current
        ? (current as { cause?: unknown }).cause
        : undefined;
  }
  return /EMAXCONNSESSION|max clients|too many clients|ECONNREFUSED|ETIMEDOUT|timeout|53300|57P03|XX000/i.test(
    chunks.join(" "),
  );
}

/**
 * Fetches the full `members` row for the logged-in user, WITH
 * communitySlugs attached.
 *
 * @param createIfMissing — when true (default), inserts a bare profile row
 *   for brand-new auth users. Pass false on /register so we don't invent a
 *   row and then treat them as "already registered".
 */
export async function getCurrentMember(opts?: {
  createIfMissing?: boolean;
}): Promise<CurrentMember | null> {
  const createIfMissing = opts?.createIfMissing !== false;
  const userId = await getAuthUserId();
  if (!userId) return null;

  try {
    await ensureMembersColumns();
  } catch (err) {
    console.warn("ensureMembersColumns failed:", err);
  }

  const db = getDb();

  async function withCommunitySlugs(
    member: typeof members.$inferSelect,
  ): Promise<CurrentMember> {
    try {
      const rows = await db
        .select({ communitySlug: memberCommunities.communitySlug })
        .from(memberCommunities)
        .where(eq(memberCommunities.memberId, member.id));
      return { ...member, communitySlugs: rows.map((r) => r.communitySlug) };
    } catch {
      return { ...member, communitySlugs: [] };
    }
  }

  async function fetchMemberRow(targetId: string) {
    try {
      const [row] = await db
        .select()
        .from(members)
        .where(and(eq(members.id, targetId), isNull(members.deletedAt)))
        .limit(1);
      return row ?? null;
    } catch (err) {
      if (isDatabaseUnavailable(err)) throw err;
      console.warn("Full members select failed, using extended core fallback:", err);
      try {
        // Prefer columns that prove registration was submitted
        const [coreRow] = await db
          .select({
            id: members.id,
            fullName: members.fullName,
            email: members.email,
            role: members.role,
            execTitle: members.execTitle,
            avatarUrl: members.avatarUrl,
            bio: members.bio,
            githubHandle: members.githubHandle,
            studentId: members.studentId,
            campus: members.campus,
            isChiromo: members.isChiromo,
            course: members.course,
            yearOfStudy: members.yearOfStudy,
            phoneNumber: members.phoneNumber,
            authProvider: members.authProvider,
            membershipStatus: members.membershipStatus,
            membershipFeeStatus: members.membershipFeeStatus,
            feeAmountPaid: members.feeAmountPaid,
            mpesaReference: members.mpesaReference,
            cardTheme: members.cardTheme,
            createdAt: members.createdAt,
            updatedAt: members.updatedAt,
            deletedAt: members.deletedAt,
          })
          .from(members)
          .where(and(eq(members.id, targetId), isNull(members.deletedAt)))
          .limit(1);

        if (!coreRow) return null;

        const elevated =
          coreRow.role === "member" || coreRow.role === "exec" || coreRow.role === "admin";

        return {
          ...coreRow,
          username: null,
          institutionName: null,
          department: null,
          membershipStatus:
            coreRow.membershipStatus ??
            (elevated ? "approved" : coreRow.studentId ? "pending" : "pending"),
          membershipFeeStatus: coreRow.membershipFeeStatus ?? "unpaid",
          feeAmountPaid: coreRow.feeAmountPaid ?? 0,
          reviewedById: null,
          reviewedAt: null,
          reviewNotes: null,
          cardTheme: coreRow.cardTheme ?? "navy_gold",
        } as typeof members.$inferSelect;
      } catch (fallbackErr) {
        if (isDatabaseUnavailable(fallbackErr)) throw fallbackErr;
        console.error("Core members fallback also failed:", fallbackErr);
        // Last resort — absolute minimum columns
        try {
          const [minRow] = await db
            .select({
              id: members.id,
              fullName: members.fullName,
              email: members.email,
              role: members.role,
              execTitle: members.execTitle,
              avatarUrl: members.avatarUrl,
              createdAt: members.createdAt,
              updatedAt: members.updatedAt,
              deletedAt: members.deletedAt,
            })
            .from(members)
            .where(and(eq(members.id, targetId), isNull(members.deletedAt)))
            .limit(1);
          if (!minRow) return null;
          const elevated =
            minRow.role === "member" || minRow.role === "exec" || minRow.role === "admin";
          return {
            ...minRow,
            bio: null,
            githubHandle: null,
            username: null,
            studentId: null,
            campus: "Chiromo Campus",
            isChiromo: true,
            institutionName: null,
            department: null,
            course: null,
            yearOfStudy: null,
            phoneNumber: null,
            authProvider: "email_password",
            membershipStatus: elevated ? "approved" : "pending",
            membershipFeeStatus: "unpaid",
            feeAmountPaid: 0,
            mpesaReference: null,
            reviewedById: null,
            reviewedAt: null,
            reviewNotes: null,
            cardTheme: "navy_gold",
          } as typeof members.$inferSelect;
        } catch {
          return null;
        }
      }
    }
  }

  async function resolveProfile(row: typeof members.$inferSelect) {
    let current = row;
    if (current.mergedIntoId) {
      const primary = await fetchMemberRow(current.mergedIntoId);
      if (primary) current = primary;
    }
    return withCommunitySlugs(current);
  }

  const existing = await fetchMemberRow(userId);
  if (existing) return resolveProfile(existing);

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const email = user.email?.trim().toLowerCase();
  if (email) {
    try {
      const [byEmail] = await db
        .select()
        .from(members)
        .where(and(sql`lower(${members.email}) = ${email}`, isNull(members.deletedAt)))
        .limit(1);
      if (byEmail) return resolveProfile(byEmail);

      const [linked] = await db
        .select({ memberId: memberEmails.memberId })
        .from(memberEmails)
        .where(sql`lower(${memberEmails.email}) = ${email}`)
        .limit(1);
      if (linked) {
        const linkedMember = await fetchMemberRow(linked.memberId);
        if (linkedMember) return resolveProfile(linkedMember);
      }
    } catch (err) {
      if (isDatabaseUnavailable(err)) throw err;
      console.warn("Member lookup by email failed:", err);
    }
  }

  if (!createIfMissing) {
    return null;
  }

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "New Member";
  const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null;

  try {
    const [created] = await db
      .insert(members)
      .values({
        id: userId,
        fullName,
        email: user.email ?? "",
        avatarUrl,
      })
      .onConflictDoNothing()
      .returning();

    if (created) return withCommunitySlugs(created);
  } catch (insertErr) {
    console.warn("Insert into members encountered an issue:", insertErr);
  }

  const fromTrigger = await fetchMemberRow(userId);
  return fromTrigger ? withCommunitySlugs(fromTrigger) : null;
}

/** True when this profile is already in `members` as a real club application / member. */
export function isExistingClubMember(member: {
  role?: string | null;
  membershipStatus?: string | null;
  studentId?: string | null;
  mpesaReference?: string | null;
  phoneNumber?: string | null;
  communitySlugs?: string[] | null;
}): boolean {
  return hasCompletedClubRegistration(member);
}

/**
 * True when the membership registration wizard was finished
 * (not just a bare Google/auth profile with name + email).
 */
export function hasCompletedClubRegistration(member: {
  role?: string | null;
  membershipStatus?: string | null;
  membershipFeeStatus?: string | null;
  studentId?: string | null;
  course?: string | null;
  mpesaReference?: string | null;
  phoneNumber?: string | null;
  mpesaPhoneNumber?: string | null;
  communitySlugs?: string[] | null;
} | null | undefined): boolean {
  if (!member) return false;
  if (member.role === "member" || member.role === "exec" || member.role === "admin") return true;
  if (member.membershipStatus === "approved" || member.membershipStatus === "rejected") return true;
  if (member.membershipFeeStatus === "deposit_paid" || member.membershipFeeStatus === "fully_paid") return true;
  if (member.mpesaReference?.trim()) return true;
  // A submitted application always stored an academic profile. A bare login row does not.
  if (member.studentId?.trim() || member.course?.trim()) return true;
  const hasContact = Boolean(member.phoneNumber?.trim() || member.mpesaPhoneNumber?.trim());
  const hasTracks = (member.communitySlugs?.length ?? 0) > 0;
  return hasContact && hasTracks;
}

/**
 * Events tab + RSVP: only fully registered AND leadership-approved members
 * (exec/admin always allowed).
 */
export function canAccessMemberEvents(member: {
  role?: string | null;
  membershipStatus?: string | null;
  studentId?: string | null;
  mpesaReference?: string | null;
  phoneNumber?: string | null;
  communitySlugs?: string[] | null;
} | null | undefined): boolean {
  if (!member) return false;
  if (member.role === "exec" || member.role === "admin") return true;
  if (member.membershipStatus === "approved") return true;
  // Role promoted to member implies approval even if status column lags
  if (member.role === "member" && hasCompletedClubRegistration(member)) return true;
  return false;
}
