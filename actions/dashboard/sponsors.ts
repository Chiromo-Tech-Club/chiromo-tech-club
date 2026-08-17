"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { sponsors } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/supabase/auth-helpers";
import { getCurrentMember } from "@/lib/supabase/get-current-member";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  name: z.string().min(2).max(160),
  contactName: z.string().max(160).optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  notes: z.string().max(2000).optional(),
});

export async function createSponsor(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await getDb()
      .insert(sponsors)
      .values({
        name: parsed.data.name,
        contactName: parsed.data.contactName || null,
        contactEmail: parsed.data.contactEmail || null,
        notes: parsed.data.notes || null,
        addedById: member.id,
      });
    revalidatePath("/dashboard/corporate_affairs/sponsor-database");
    return { success: true };
  } catch (err) {
    console.error("createSponsor failed:", err);
    return { success: false, error: "Could not save this sponsor." };
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
    revalidatePath("/dashboard/corporate_affairs/sponsor-database");
    return { success: true };
  } catch (err) {
    console.error("updateSponsorStatus failed:", err);
    return { success: false, error: "Could not update this sponsor." };
  }
}
