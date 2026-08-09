"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { mentorships } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/clerk/client";
import { getCurrentMember } from "@/lib/clerk/get-current-user";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  mentorName: z.string().min(2).max(160),
  menteeId: z.string().uuid(),
  topic: z.string().min(2).max(200),
  notes: z.string().max(1000).optional(),
});

export async function createMentorship(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("training_coordinator");
  if (!allowed) return { success: false, error: "Training Coordinator access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await getDb().insert(mentorships).values({
      mentorName: parsed.data.mentorName,
      menteeId: parsed.data.menteeId,
      topic: parsed.data.topic,
      notes: parsed.data.notes || null,
      addedById: member.id,
    });
    revalidatePath("/dashboard/training_coordinator/mentorship");
    return { success: true };
  } catch (err) {
    console.error("createMentorship failed:", err);
    return { success: false, error: "Could not save this mentorship." };
  }
}

const statusSchema = z.object({ id: z.string().uuid(), status: z.enum(["active", "completed"]) });

export async function updateMentorshipStatus(input: z.infer<typeof statusSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("training_coordinator");
  if (!allowed) return { success: false, error: "Training Coordinator access required." };

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  try {
    await getDb().update(mentorships).set({ status: parsed.data.status, updatedAt: new Date() }).where(eq(mentorships.id, parsed.data.id));
    revalidatePath("/dashboard/training_coordinator/mentorship");
    return { success: true };
  } catch (err) {
    console.error("updateMentorshipStatus failed:", err);
    return { success: false, error: "Could not update this mentorship." };
  }
}
