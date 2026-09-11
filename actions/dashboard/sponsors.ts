"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { ensureFinanceColumns } from "@/lib/drizzle/ensure-finance-columns";
import { sponsors } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/supabase/auth-helpers";
import { getCurrentMember } from "@/lib/supabase/get-current-member";
import type { ActionResult } from "@/actions/membership";

const optionalPhone = z
  .string()
  .trim()
  .regex(/^[0-9+\s()-]{0,18}$/, "Enter a valid phone number.")
  .optional()
  .or(z.literal(""));

const optionalEmail = z.string().email().optional().or(z.literal(""));

const createSchema = z.object({
  name: z.string().min(2).max(160),
  contactName: z.string().max(160).optional().or(z.literal("")),
  contactEmail: optionalEmail,
  contactPhone: optionalPhone,
  contactEmailSecondary: optionalEmail,
  contactPhoneSecondary: optionalPhone,
  contactEmailTertiary: optionalEmail,
  contactPhoneTertiary: optionalPhone,
  notes: z.string().max(2000).optional().or(z.literal("")),
});

const updateSchema = createSchema.extend({
  id: z.string().uuid(),
});

function revalidateSponsors() {
  revalidatePath("/dashboard/corporate_affairs/sponsor-database");
}

function contactFields(data: z.infer<typeof createSchema>) {
  return {
    name: data.name,
    contactName: data.contactName || null,
    contactEmail: data.contactEmail || null,
    contactPhone: data.contactPhone || null,
    contactEmailSecondary: data.contactEmailSecondary || null,
    contactPhoneSecondary: data.contactPhoneSecondary || null,
    contactEmailTertiary: data.contactEmailTertiary || null,
    contactPhoneTertiary: data.contactPhoneTertiary || null,
    notes: data.notes || null,
  };
}

export async function createSponsor(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await ensureFinanceColumns();
    await getDb()
      .insert(sponsors)
      .values({
        ...contactFields(parsed.data),
        addedById: member.id,
      });
    revalidateSponsors();
    return { success: true };
  } catch (err) {
    console.error("createSponsor failed:", err);
    return { success: false, error: "Could not save this sponsor." };
  }
}

export async function updateSponsor(input: z.infer<typeof updateSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  try {
    await ensureFinanceColumns();
    await getDb()
      .update(sponsors)
      .set({
        ...contactFields(parsed.data),
        updatedAt: new Date(),
      })
      .where(eq(sponsors.id, parsed.data.id));
    revalidateSponsors();
    return { success: true };
  } catch (err) {
    console.error("updateSponsor failed:", err);
    return { success: false, error: "Could not update this sponsor." };
  }
}

export async function deleteSponsor(id: string): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: "Invalid sponsor." };
  }

  try {
    await getDb()
      .update(sponsors)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(sponsors.id, id));
    revalidateSponsors();
    return { success: true };
  } catch (err) {
    console.error("deleteSponsor failed:", err);
    return { success: false, error: "Could not delete this sponsor." };
  }
}

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["prospect", "active", "past"]),
});

export async function updateSponsorStatus(input: z.infer<typeof statusSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  try {
    await getDb()
      .update(sponsors)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(sponsors.id, parsed.data.id));
    revalidateSponsors();
    return { success: true };
  } catch (err) {
    console.error("updateSponsorStatus failed:", err);
    return { success: false, error: "Could not update this sponsor." };
  }
}
