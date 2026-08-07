"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { decisions } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/clerk/client";
import { getCurrentMember } from "@/lib/clerk/get-current-user";
import type { ActionResult } from "@/actions/membership";

const proposeSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(3).max(2000),
});

export async function proposeDecision(input: z.infer<typeof proposeSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("chairperson");
  if (!allowed) return { success: false, error: "Chairperson access required." };

  const parsed = proposeSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await getDb().insert(decisions).values({
      title: parsed.data.title,
      description: parsed.data.description,
      proposedById: member.id,
    });
    revalidatePath("/dashboard/chairperson/recent-decisions");
    return { success: true };
  } catch (err) {
    console.error("proposeDecision failed:", err);
    return { success: false, error: "Could not save this decision." };
  }
}

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
});

export async function updateDecisionStatus(input: z.infer<typeof statusSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("chairperson");
  if (!allowed) return { success: false, error: "Chairperson access required." };

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  try {
    await getDb()
      .update(decisions)
      .set({ status: parsed.data.status, decidedAt: new Date(), updatedAt: new Date() })
      .where(eq(decisions.id, parsed.data.id));
    revalidatePath("/dashboard/chairperson/recent-decisions");
    return { success: true };
  } catch (err) {
    console.error("updateDecisionStatus failed:", err);
    return { success: false, error: "Could not update this decision." };
  }
}
