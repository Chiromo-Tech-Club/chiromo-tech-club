"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { guestSpeakers } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/supabase/auth-helpers";
import { getCurrentMember } from "@/lib/supabase/get-current-member";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  name: z.string().min(2).max(160),
  topic: z.string().min(2).max(200),
  contactEmail: z.string().email().optional().or(z.literal("")),
  notes: z.string().max(1000).optional(),
});

export async function addGuestSpeaker(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await getDb().insert(guestSpeakers).values({
      name: parsed.data.name,
      topic: parsed.data.topic,
      contactEmail: parsed.data.contactEmail || null,
      notes: parsed.data.notes || null,
      addedById: member.id,
    });
    revalidatePath("/dashboard/corporate_affairs/guest-speakers");
    return { success: true };
  } catch (err) {
    console.error("addGuestSpeaker failed:", err);
    return { success: false, error: "Could not save this speaker." };
  }
}

const statusSchema = z.object({ id: z.string().uuid(), status: z.enum(["invited", "confirmed", "declined"]) });

export async function updateSpeakerStatus(input: z.infer<typeof statusSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  try {
    await getDb().update(guestSpeakers).set({ status: parsed.data.status, updatedAt: new Date() }).where(eq(guestSpeakers.id, parsed.data.id));
    revalidatePath("/dashboard/corporate_affairs/guest-speakers");
    return { success: true };
  } catch (err) {
    console.error("updateSpeakerStatus failed:", err);
    return { success: false, error: "Could not update this speaker." };
  }
}
