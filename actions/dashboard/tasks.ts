"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { tasks } from "@/lib/drizzle/schema";
import { requireRole } from "@/lib/clerk/client";
import { getCurrentMember } from "@/lib/clerk/get-current-user";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().max(1000).optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export async function createTask(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const check = await requireRole("exec");
  if (!check.ok) return { success: false, error: "Executive access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await getDb()
      .insert(tasks)
      .values({
        title: parsed.data.title,
        description: parsed.data.description || null,
        assigneeId: parsed.data.assigneeId || null,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        createdById: member.id,
      });
    revalidatePath("/dashboard/tasks");
    return { success: true };
  } catch (err) {
    console.error("createTask failed:", err);
    return { success: false, error: "Could not save this task." };
  }
}

const statusSchema = z.object({ id: z.string().uuid(), status: z.enum(["todo", "in_progress", "done"]) });

export async function updateTaskStatus(input: z.infer<typeof statusSchema>): Promise<ActionResult> {
  const check = await requireRole("exec");
  if (!check.ok) return { success: false, error: "Executive access required." };

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  try {
    await getDb().update(tasks).set({ status: parsed.data.status, updatedAt: new Date() }).where(eq(tasks.id, parsed.data.id));
    revalidatePath("/dashboard/tasks");
    return { success: true };
  } catch (err) {
    console.error("updateTaskStatus failed:", err);
    return { success: false, error: "Could not update this task." };
  }
}
