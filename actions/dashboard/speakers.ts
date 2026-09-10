"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { ensureGuestSpeakersSchema } from "@/lib/drizzle/ensure-guest-speakers";
import { guestSpeakers } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/supabase/auth-helpers";
import { getCurrentMember } from "@/lib/supabase/get-current-member";
import type { ActionResult } from "@/actions/membership";

const SPEAKER_STATUSES = ["invited", "confirmed", "declined", "rescheduled", "cancelled"] as const;

const optionalPhone = z
  .string()
  .trim()
  .regex(/^[0-9+\s()-]{0,18}$/, "Enter a valid phone number (e.g. 0712345678).")
  .optional()
  .or(z.literal(""));

const createSchema = z.object({
  name: z.string().min(2).max(160),
  topic: z.string().min(2).max(200),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: optionalPhone,
  notes: z.string().max(1000).optional(),
});

const updateSchema = createSchema.extend({
  id: z.string().uuid(),
});

function revalidateSpeakers() {
  revalidatePath("/dashboard/corporate_affairs/guest-speakers");
}

export async function addGuestSpeaker(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await ensureGuestSpeakersSchema();
    await getDb().insert(guestSpeakers).values({
      name: parsed.data.name,
      topic: parsed.data.topic,
      contactEmail: parsed.data.contactEmail || null,
      contactPhone: parsed.data.contactPhone || null,
      notes: parsed.data.notes || null,
      addedById: member.id,
    });
    revalidateSpeakers();
    return { success: true };
  } catch (err) {
    console.error("addGuestSpeaker failed:", err);
    return { success: false, error: "Could not save this speaker." };
  }
}

export async function updateGuestSpeaker(input: z.infer<typeof updateSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  try {
    await ensureGuestSpeakersSchema();
    await getDb()
      .update(guestSpeakers)
      .set({
        name: parsed.data.name,
        topic: parsed.data.topic,
        contactEmail: parsed.data.contactEmail || null,
        contactPhone: parsed.data.contactPhone || null,
        notes: parsed.data.notes || null,
        updatedAt: new Date(),
      })
      .where(eq(guestSpeakers.id, parsed.data.id));
    revalidateSpeakers();
    return { success: true };
  } catch (err) {
    console.error("updateGuestSpeaker failed:", err);
    return { success: false, error: "Could not update this speaker." };
  }
}

export async function deleteGuestSpeaker(id: string): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: "Invalid speaker." };
  }

  try {
    await ensureGuestSpeakersSchema();
    await getDb()
      .update(guestSpeakers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(guestSpeakers.id, id));
    revalidateSpeakers();
    return { success: true };
  } catch (err) {
    console.error("deleteGuestSpeaker failed:", err);
    return { success: false, error: "Could not delete this speaker." };
  }
}

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(SPEAKER_STATUSES),
});

export async function updateSpeakerStatus(input: z.infer<typeof statusSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  try {
    await ensureGuestSpeakersSchema();
    await getDb()
      .update(guestSpeakers)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(guestSpeakers.id, parsed.data.id));
    revalidateSpeakers();
    return { success: true };
  } catch (err) {
    console.error("updateSpeakerStatus failed:", err);
    return { success: false, error: "Could not update this speaker." };
  }
}
