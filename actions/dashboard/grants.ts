"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { grantApplications } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/clerk/client";
import { getCurrentMember } from "@/lib/clerk/get-current-user";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  funderName: z.string().min(2).max(160),
  amount: z.number().positive().max(100_000_000).optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  notes: z.string().max(2000).optional(),
});

export async function createGrantApplication(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("treasurer");
  if (!allowed) return { success: false, error: "Treasurer access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await getDb()
      .insert(grantApplications)
      .values({
        funderName: parsed.data.funderName,
        amountCents: parsed.data.amount ? Math.round(parsed.data.amount * 100) : null,
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
        notes: parsed.data.notes || null,
        recordedById: member.id,
      });
    revalidatePath("/dashboard/treasurer/grant-applications");
    return { success: true };
  } catch (err) {
    console.error("createGrantApplication failed:", err);
    return { success: false, error: "Could not save this grant application." };
  }
}

const statusSchema = z.object({ id: z.string().uuid(), status: z.enum(["draft", "submitted", "awarded", "rejected"]) });

export async function updateGrantStatus(input: z.infer<typeof statusSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("treasurer");
  if (!allowed) return { success: false, error: "Treasurer access required." };

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  try {
    await getDb()
      .update(grantApplications)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(grantApplications.id, parsed.data.id));
    revalidatePath("/dashboard/treasurer/grant-applications");
    return { success: true };
  } catch (err) {
    console.error("updateGrantStatus failed:", err);
    return { success: false, error: "Could not update this application." };
  }
}
