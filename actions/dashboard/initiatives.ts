"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { initiatives } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/clerk/client";
import { getCurrentMember } from "@/lib/clerk/get-current-user";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(3).max(2000),
  dueDate: z.string().datetime().optional().nullable(),
});

export async function createInitiative(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("vice_chairperson");
  if (!allowed) return { success: false, error: "Vice Chairperson access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await getDb().insert(initiatives).values({
      title: parsed.data.title,
      description: parsed.data.description,
      ownerId: member.id,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    });
    revalidatePath("/dashboard/vice_chairperson/initiative-dashboard");
    return { success: true };
  } catch (err) {
    console.error("createInitiative failed:", err);
    return { success: false, error: "Could not save this initiative." };
  }
}

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["planned", "in_progress", "done"]),
});

export async function updateInitiativeStatus(input: z.infer<typeof statusSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("vice_chairperson");
  if (!allowed) return { success: false, error: "Vice Chairperson access required." };

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  try {
    await getDb()
      .update(initiatives)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(initiatives.id, parsed.data.id));
    revalidatePath("/dashboard/vice_chairperson/initiative-dashboard");
    return { success: true };
  } catch (err) {
    console.error("updateInitiativeStatus failed:", err);
    return { success: false, error: "Could not update this initiative." };
  }
}
