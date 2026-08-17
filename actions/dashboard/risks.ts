"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { risks } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/supabase/auth-helpers";
import { getCurrentMember } from "@/lib/supabase/get-current-member";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().min(2).max(1000),
  severity: z.enum(["low", "medium", "high"]),
  mitigation: z.string().max(1000).optional(),
});

export async function createRisk(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("vice_chairperson");
  if (!allowed) return { success: false, error: "Vice Chairperson access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await getDb().insert(risks).values({
      title: parsed.data.title,
      description: parsed.data.description,
      severity: parsed.data.severity,
      mitigation: parsed.data.mitigation || null,
      addedById: member.id,
    });
    revalidatePath("/dashboard/vice_chairperson/risk-tracker");
    return { success: true };
  } catch (err) {
    console.error("createRisk failed:", err);
    return { success: false, error: "Could not save this risk." };
  }
}

const statusSchema = z.object({ id: z.string().uuid(), status: z.enum(["open", "mitigated", "closed"]) });

export async function updateRiskStatus(input: z.infer<typeof statusSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("vice_chairperson");
  if (!allowed) return { success: false, error: "Vice Chairperson access required." };

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  try {
    await getDb().update(risks).set({ status: parsed.data.status, updatedAt: new Date() }).where(eq(risks.id, parsed.data.id));
    revalidatePath("/dashboard/vice_chairperson/risk-tracker");
    return { success: true };
  } catch (err) {
    console.error("updateRiskStatus failed:", err);
    return { success: false, error: "Could not update this risk." };
  }
}
