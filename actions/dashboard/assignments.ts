"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { trainingAssignments } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/supabase/auth-helpers";
import { getCurrentMember } from "@/lib/supabase/get-current-member";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  title: z.string().min(2).max(200),
  topic: z.string().min(2).max(80),
  description: z.string().max(1000).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export async function createAssignment(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("training_coordinator");
  if (!allowed) return { success: false, error: "Training Coordinator access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await getDb().insert(trainingAssignments).values({
      title: parsed.data.title,
      topic: parsed.data.topic,
      description: parsed.data.description || null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      createdById: member.id,
    });
    revalidatePath("/dashboard/training_coordinator/assignments");
    return { success: true };
  } catch (err) {
    console.error("createAssignment failed:", err);
    return { success: false, error: "Could not save this assignment." };
  }
}
