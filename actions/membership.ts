"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "../lib/drizzle/client";
import { members, memberCommunities } from "../lib/drizzle/schema";
import { auth } from "../lib/clerk/client";
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

  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "You must be signed in to join." };
  }

  const db = getDb();
  const { fullName, email, communitySlugs, bio, githubHandle } = parsed.data;

  try {
    const [member] = await db
      .insert(members)
      .values({
        clerkUserId: userId,
        fullName,
        email,
        bio: bio || null,
        githubHandle: githubHandle || null,
      })
      .onConflictDoUpdate({
        target: members.clerkUserId,
        set: { fullName, email, bio: bio || null, githubHandle: githubHandle || null, updatedAt: new Date() },
      })
      .returning();

    await db
      .insert(memberCommunities)
      .values(communitySlugs.map((slug) => ({ memberId: member.id, communitySlug: slug })))
      .onConflictDoNothing();

    await sendNewsletterConfirmation(email).catch((err) => console.error("Newsletter confirmation failed:", err));

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
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "You must be signed in." };
  }

  const db = getDb();
  try {
    await db
      .update(members)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(members.clerkUserId, userId));

    revalidatePath(ROUTES.dashboard);
    return { success: true };
  } catch (err) {
    console.error("updateMemberProfile failed:", err);
    return { success: false, error: "Could not update your profile." };
  }
}