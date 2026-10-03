"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { ensureClubTools } from "@/lib/drizzle/ensure-club-tools";
import { announcements } from "@/lib/drizzle/schema";
import { requireRole } from "@/lib/supabase/auth-helpers";
import { getCurrentMember } from "@/lib/supabase/get-current-member";
import type { ActionResult } from "@/actions/membership";

const audienceSchema = z.enum(["members", "executives"]);

const createSchema = z.object({
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(3).max(4000),
  audience: audienceSchema,
});

const updateSchema = createSchema.extend({
  id: z.string().uuid(),
});

function revalidateAnnouncements() {
  revalidatePath("/dashboard/announcements");
  revalidatePath("/dashboard");
}

export async function postAnnouncement(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const check = await requireRole("exec");
  if (!check.ok) return { success: false, error: "Executive access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await ensureClubTools();
    await getDb().insert(announcements).values({
      title: parsed.data.title,
      body: parsed.data.body,
      audience: parsed.data.audience,
      authorId: member.id,
    });
    revalidateAnnouncements();
    return { success: true };
  } catch (err) {
    console.error("postAnnouncement failed:", err);
    return { success: false, error: "Could not post this announcement." };
  }
}

export async function updateAnnouncement(input: z.infer<typeof updateSchema>): Promise<ActionResult> {
  const check = await requireRole("exec");
  if (!check.ok) return { success: false, error: "Executive access required." };

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  try {
    await ensureClubTools();
    await getDb()
      .update(announcements)
      .set({
        title: parsed.data.title,
        body: parsed.data.body,
        audience: parsed.data.audience,
        updatedAt: new Date(),
      })
      .where(eq(announcements.id, parsed.data.id));
    revalidateAnnouncements();
    return { success: true };
  } catch (err) {
    console.error("updateAnnouncement failed:", err);
    return { success: false, error: "Could not update this announcement." };
  }
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  const check = await requireRole("exec");
  if (!check.ok) return { success: false, error: "Executive access required." };

  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return { success: false, error: "Invalid announcement." };

  try {
    await ensureClubTools();
    await getDb()
      .update(announcements)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(announcements.id, parsed.data));
    revalidateAnnouncements();
    return { success: true };
  } catch (err) {
    console.error("deleteAnnouncement failed:", err);
    return { success: false, error: "Could not delete this announcement." };
  }
}
