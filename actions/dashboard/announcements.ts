"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { announcements } from "@/lib/drizzle/schema";
import { requireRole } from "@/lib/clerk/client";
import { getCurrentMember } from "@/lib/clerk/get-current-user";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  title: z.string().min(3).max(160),
  body: z.string().min(3).max(4000),
});

export async function postAnnouncement(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  // Shared across every exec seat — any exec/admin can post, not scoped to one title.
  const check = await requireRole("exec");
  if (!check.ok) return { success: false, error: "Executive access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await getDb().insert(announcements).values({ title: parsed.data.title, body: parsed.data.body, authorId: member.id });
    revalidatePath("/dashboard/announcements");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("postAnnouncement failed:", err);
    return { success: false, error: "Could not post this announcement." };
  }
}
