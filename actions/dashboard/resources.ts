"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { resources } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/supabase/auth-helpers";
import { getCurrentMember } from "@/lib/supabase/get-current-member";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  title: z.string().min(2).max(200),
  url: z.string().url(),
  topic: z.string().min(2).max(60),
  description: z.string().max(600).optional(),
});

export async function addResource(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("training_coordinator");
  if (!allowed) return { success: false, error: "Training Coordinator access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await getDb()
      .insert(resources)
      .values({
        title: parsed.data.title,
        url: parsed.data.url,
        topic: parsed.data.topic,
        description: parsed.data.description || null,
        addedById: member.id,
      });
    revalidatePath("/dashboard/training_coordinator/resource-library");
    return { success: true };
  } catch (err) {
    console.error("addResource failed:", err);
    return { success: false, error: "Could not save this resource." };
  }
}

const idSchema = z.object({ id: z.string().uuid() });

export async function removeResource(input: z.infer<typeof idSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("training_coordinator");
  if (!allowed) return { success: false, error: "Training Coordinator access required." };

  const parsed = idSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  try {
    await getDb().update(resources).set({ deletedAt: new Date() }).where(eq(resources.id, parsed.data.id));
    revalidatePath("/dashboard/training_coordinator/resource-library");
    return { success: true };
  } catch (err) {
    console.error("removeResource failed:", err);
    return { success: false, error: "Could not remove this resource." };
  }
}
