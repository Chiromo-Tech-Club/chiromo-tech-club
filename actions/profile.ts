"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull, ne } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { ensureMembersColumns } from "@/lib/drizzle/ensure-members-columns";
import { members } from "@/lib/drizzle/schema";
import { getAuthUserId } from "@/lib/supabase/auth-helpers";
import { profileUpdateSchema } from "@/lib/validations/profile";
import { uploadMemberAvatar } from "@/services/upload";
import { ROUTES } from "@/constants/routes";

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Updates the signed-in member's profile (name, username, bio, avatar, etc).
 * Accepts FormData so the avatar file can be uploaded in the same request.
 */
export async function updateMyProfile(formData: FormData): Promise<ActionResult<{ avatarUrl?: string | null }>> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: "You must be signed in to update your profile." };
  }

  const raw = {
    fullName: String(formData.get("fullName") ?? ""),
    username: String(formData.get("username") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    githubHandle: String(formData.get("githubHandle") ?? ""),
    phoneNumber: String(formData.get("phoneNumber") ?? ""),
    studentId: String(formData.get("studentId") ?? ""),
    course: String(formData.get("course") ?? ""),
    yearOfStudy: String(formData.get("yearOfStudy") ?? ""),
    campus: String(formData.get("campus") ?? ""),
  };

  const parsed = profileUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid profile details." };
  }

  const data = parsed.data;
  const username = data.username?.trim() ? data.username.trim().toLowerCase() : null;

  const db = getDb();
  try {
    await ensureMembersColumns();
  } catch (err) {
    console.warn("ensureMembersColumns failed:", err);
  }

  if (username) {
    try {
      const [taken] = await db
        .select({ id: members.id })
        .from(members)
        .where(and(eq(members.username, username), ne(members.id, userId), isNull(members.deletedAt)))
        .limit(1);
      if (taken) {
        return { success: false, error: "That username is already taken. Try another." };
      }
    } catch (err) {
      // Column may not exist yet before migration — continue without uniqueness check
      console.warn("Username uniqueness check skipped:", err);
    }
  }

  let avatarUrl: string | null | undefined;

  const avatarFile = formData.get("avatar");
  if (avatarFile instanceof File && avatarFile.size > 0) {
    try {
      const uploaded = await uploadMemberAvatar(userId, avatarFile);
      avatarUrl = uploaded.publicUrl;
    } catch (err) {
      console.error("Avatar upload failed:", err);
      return {
        success: false,
        error:
          "Could not upload your photo. Ensure the Supabase 'avatars' bucket exists and is public, then try again.",
      };
    }
  }

  // username column may be missing until migration — try with it, fallback without
  try {
    await db
      .update(members)
      .set({
        fullName: data.fullName,
        username,
        bio: (data.bio?.trim() || null) as string | null,
        githubHandle: (data.githubHandle?.trim() || null) as string | null,
        phoneNumber: (data.phoneNumber?.trim() || null) as string | null,
        studentId: (data.studentId?.trim() || null) as string | null,
        course: (data.course?.trim() || null) as string | null,
        yearOfStudy: (data.yearOfStudy?.trim() || null) as string | null,
        campus: (data.campus?.trim() || null) as string | null,
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        updatedAt: new Date(),
      })
      .where(eq(members.id, userId));
  } catch (err) {
    console.warn("Profile update with username failed, retrying without username:", err);
    try {
      await db
        .update(members)
        .set({
          fullName: data.fullName,
          bio: data.bio?.trim() || null,
          githubHandle: data.githubHandle?.trim() || null,
          phoneNumber: data.phoneNumber?.trim() || null,
          studentId: data.studentId?.trim() || null,
          course: data.course?.trim() || null,
          yearOfStudy: data.yearOfStudy?.trim() || null,
          campus: data.campus?.trim() || null,
          ...(avatarUrl !== undefined ? { avatarUrl } : {}),
          updatedAt: new Date(),
        })
        .where(eq(members.id, userId));
    } catch (fallbackErr) {
      console.error("updateMyProfile failed:", fallbackErr);
      return { success: false, error: "Could not save your profile. Please try again." };
    }
  }

  revalidatePath(ROUTES.dashboard);
  revalidatePath(ROUTES.dashboardProfile);
  return { success: true, data: { avatarUrl: avatarUrl ?? null } };
}

/** Suggest a free username from a display name. */
export async function suggestUsername(fullName: string): Promise<string> {
  const base =
    fullName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 18) || "member";

  const db = getDb();
  try {
    for (let i = 0; i < 20; i++) {
      const candidate = i === 0 ? base : `${base}${i + 1}`;
      const [row] = await db
        .select({ id: members.id })
        .from(members)
        .where(eq(members.username, candidate))
        .limit(1);
      if (!row) return candidate;
    }
  } catch {
    // ignore
  }
  return `${base}${Math.floor(Math.random() * 900 + 100)}`;
}
