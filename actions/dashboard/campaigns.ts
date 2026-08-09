"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { campaigns } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/clerk/client";
import { getCurrentMember } from "@/lib/clerk/get-current-user";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  title: z.string().min(2).max(160),
  channel: z.string().min(2).max(80),
  startDate: z.string().datetime().optional().nullable(),
  notes: z.string().max(1000).optional(),
});

export async function createCampaign(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await getDb().insert(campaigns).values({
      title: parsed.data.title,
      channel: parsed.data.channel,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      notes: parsed.data.notes || null,
      addedById: member.id,
    });
    revalidatePath("/dashboard/corporate_affairs/marketing-campaigns");
    return { success: true };
  } catch (err) {
    console.error("createCampaign failed:", err);
    return { success: false, error: "Could not save this campaign." };
  }
}

const statusSchema = z.object({ id: z.string().uuid(), status: z.enum(["planned", "active", "completed"]) });

export async function updateCampaignStatus(input: z.infer<typeof statusSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  try {
    await getDb().update(campaigns).set({ status: parsed.data.status, updatedAt: new Date() }).where(eq(campaigns.id, parsed.data.id));
    revalidatePath("/dashboard/corporate_affairs/marketing-campaigns");
    return { success: true };
  } catch (err) {
    console.error("updateCampaignStatus failed:", err);
    return { success: false, error: "Could not update this campaign." };
  }
}
