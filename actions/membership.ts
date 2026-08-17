"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "../lib/drizzle/client";
import { members, memberCommunities } from "../lib/drizzle/schema";
// ─────────────────────────────────────────────────────────────────────────
// CLERK (commented out — kept for reference / rollback)
// ─────────────────────────────────────────────────────────────────────────
// import { auth } from "../lib/clerk/client";
// ─────────────────────────────────────────────────────────────────────────
import { getAuthUserId } from "../lib/supabase/auth-helpers";
import { memberDraftSchema, type MemberDraftInput } from "../lib/validations/membership";
import { sendNewsletterConfirmation } from "../services/email";
import { ROUTES } from "../constants/routes";

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/** Server Action bound to the "join the club" form. */
export async function joinClub(input: MemberDraftInput): Promise<ActionResult> {
  const parsed = memberDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: "You must be signed in to join." };
  }

  const db = getDb();
  const { fullName, email, communitySlugs, bio, githubHandle } = parsed.data;

  try {
    // `members.id` IS the Supabase auth user id now (not an auto-generated
    // uuid) — getCurrentMember()/getCurrentRole() look up by
    // eq(members.id, authUserId), so this has to be set explicitly on
    // insert or every later lookup for this user silently finds nothing.
    const [member] = await db
      .insert(members)
      .values({
        id: userId,
        fullName,
        email,
        bio: bio || null,
        githubHandle: githubHandle || null,
      })
      .onConflictDoUpdate({
        target: members.id,
        set: { fullName, email, bio: bio || null, githubHandle: githubHandle || null, updatedAt: new Date() },
      })
      .returning();

    await db
      .insert(memberCommunities)
      .values(communitySlugs.map((slug) => ({ memberId: member.id, communitySlug: slug })))
      .onConflictDoNothing();

    await sendNewsletterConfirmation(email, fullName).catch((err) => console.error("Newsletter confirmation failed:", err));

    revalidatePath(ROUTES.dashboard);
    return { success: true };
  } catch (err) {
    console.error("joinClub failed:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/** Server Action bound to the profile-edit form in the member dashboard. */
export async function updateMemberProfile(
  memberId: string,
  updates: Partial<Pick<MemberDraftInput, "fullName" | "bio" | "githubHandle">>,
): Promise<ActionResult> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: "You must be signed in." };
  }

  const db = getDb();
  try {
    await db
      .update(members)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(members.id, userId));

    revalidatePath(ROUTES.dashboard);
    return { success: true };
  } catch (err) {
    console.error("updateMemberProfile failed:", err);
    return { success: false, error: "Could not update your profile." };
  }
}