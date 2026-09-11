"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { ensureFinanceColumns } from "@/lib/drizzle/ensure-finance-columns";
import { transactions } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/supabase/auth-helpers";
import { getCurrentMember } from "@/lib/supabase/get-current-member";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(2).max(80),
  partyName: z.string().max(160).optional().or(z.literal("")),
  description: z.string().min(2).max(400),
  /** Entered in whole currency units (e.g. KES) by the form; stored as cents. */
  amount: z.number().positive().max(100_000_000),
  occurredAt: z.string().datetime().optional(),
});

const updateSchema = createSchema.extend({
  id: z.string().uuid(),
});

function revalidateFinancePaths() {
  revalidatePath("/dashboard/treasurer/budget-planner");
  revalidatePath("/dashboard/treasurer/income-tracker");
  revalidatePath("/dashboard/treasurer/expense-tracker");
  revalidatePath("/dashboard/treasurer/financial-reports");
}

export async function createTransaction(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("treasurer");
  if (!allowed) return { success: false, error: "Treasurer access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await ensureFinanceColumns();
    await getDb()
      .insert(transactions)
      .values({
        type: parsed.data.type,
        category: parsed.data.category,
        partyName: parsed.data.partyName || null,
        description: parsed.data.description,
        amountCents: Math.round(parsed.data.amount * 100),
        occurredAt: parsed.data.occurredAt ? new Date(parsed.data.occurredAt) : new Date(),
        recordedById: member.id,
      });
    revalidateFinancePaths();
    return { success: true };
  } catch (err) {
    console.error("createTransaction failed:", err);
    return { success: false, error: "Could not save this transaction." };
  }
}

export async function updateTransaction(input: z.infer<typeof updateSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("treasurer");
  if (!allowed) return { success: false, error: "Treasurer access required." };

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  try {
    await ensureFinanceColumns();
    const patch: {
      type: "income" | "expense";
      category: string;
      partyName: string | null;
      description: string;
      amountCents: number;
      updatedAt: Date;
      occurredAt?: Date;
    } = {
      type: parsed.data.type,
      category: parsed.data.category,
      partyName: parsed.data.partyName || null,
      description: parsed.data.description,
      amountCents: Math.round(parsed.data.amount * 100),
      updatedAt: new Date(),
    };
    if (parsed.data.occurredAt) {
      patch.occurredAt = new Date(parsed.data.occurredAt);
    }

    await getDb().update(transactions).set(patch).where(eq(transactions.id, parsed.data.id));
    revalidateFinancePaths();
    return { success: true };
  } catch (err) {
    console.error("updateTransaction failed:", err);
    return { success: false, error: "Could not update this transaction." };
  }
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const allowed = await canAccessExecSection("treasurer");
  if (!allowed) return { success: false, error: "Treasurer access required." };

  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: "Invalid transaction." };
  }

  try {
    await getDb()
      .update(transactions)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(transactions.id, id));
    revalidateFinancePaths();
    return { success: true };
  } catch (err) {
    console.error("deleteTransaction failed:", err);
    return { success: false, error: "Could not delete this transaction." };
  }
}
