"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { transactions } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/clerk/client";
import { getCurrentMember } from "@/lib/clerk/get-current-user";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(2).max(80),
  description: z.string().min(2).max(400),
  /** Entered in whole currency units (e.g. KES) by the form; stored as cents. */
  amount: z.number().positive().max(100_000_000),
  occurredAt: z.string().datetime().optional(),
});

export async function createTransaction(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("treasurer");
  if (!allowed) return { success: false, error: "Treasurer access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await getDb()
      .insert(transactions)
      .values({
        type: parsed.data.type,
        category: parsed.data.category,
        description: parsed.data.description,
        amountCents: Math.round(parsed.data.amount * 100),
        occurredAt: parsed.data.occurredAt ? new Date(parsed.data.occurredAt) : new Date(),
        recordedById: member.id,
      });
    revalidatePath("/dashboard/treasurer/budget-planner");
    return { success: true };
  } catch (err) {
    console.error("createTransaction failed:", err);
    return { success: false, error: "Could not save this transaction." };
  }
}
