"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { invoices } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/supabase/auth-helpers";
import { getCurrentMember } from "@/lib/supabase/get-current-member";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  clientName: z.string().min(2).max(160),
  description: z.string().min(2).max(400),
  amount: z.number().positive().max(100_000_000),
  dueDate: z.string().datetime().optional().nullable(),
});

export async function createInvoice(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("treasurer");
  if (!allowed) return { success: false, error: "Treasurer access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await getDb()
      .insert(invoices)
      .values({
        clientName: parsed.data.clientName,
        description: parsed.data.description,
        amountCents: Math.round(parsed.data.amount * 100),
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        recordedById: member.id,
      });
    revalidatePath("/dashboard/treasurer/invoices");
    return { success: true };
  } catch (err) {
    console.error("createInvoice failed:", err);
    return { success: false, error: "Could not save this invoice." };
  }
}

const statusSchema = z.object({ id: z.string().uuid(), status: z.enum(["unpaid", "paid", "overdue"]) });

export async function updateInvoiceStatus(input: z.infer<typeof statusSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("treasurer");
  if (!allowed) return { success: false, error: "Treasurer access required." };

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  try {
    await getDb().update(invoices).set({ status: parsed.data.status, updatedAt: new Date() }).where(eq(invoices.id, parsed.data.id));
    revalidatePath("/dashboard/treasurer/invoices");
    return { success: true };
  } catch (err) {
    console.error("updateInvoiceStatus failed:", err);
    return { success: false, error: "Could not update this invoice." };
  }
}
