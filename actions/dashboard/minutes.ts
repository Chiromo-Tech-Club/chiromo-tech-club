"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { meetingMinutes } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/clerk/client";
import { getCurrentMember } from "@/lib/clerk/get-current-user";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  title: z.string().min(3).max(160),
  meetingDate: z.string().datetime(),
  agenda: z.string().max(4000).optional().default(""),
  minutes: z.string().max(8000).optional().default(""),
  attendees: z.array(z.string().min(1).max(120)).max(100).optional().default([]),
});

export async function createMinutes(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("secretary_general");
  if (!allowed) return { success: false, error: "Secretary General access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await getDb().insert(meetingMinutes).values({
      title: parsed.data.title,
      meetingDate: new Date(parsed.data.meetingDate),
      agenda: parsed.data.agenda,
      minutes: parsed.data.minutes,
      attendees: parsed.data.attendees,
      recordedById: member.id,
    });
    revalidatePath("/dashboard/secretary_general/minute-editor");
    return { success: true };
  } catch (err) {
    console.error("createMinutes failed:", err);
    return { success: false, error: "Could not save these minutes." };
  }
}

const updateSchema = z.object({
  id: z.string().uuid(),
  agenda: z.string().max(4000),
  minutes: z.string().max(8000),
  attendees: z.array(z.string().min(1).max(120)).max(100),
});

/** Lets the Secretary General keep editing a record after the meeting — filling in minutes as discussion happens, not just at creation. */
export async function updateMinutes(input: z.infer<typeof updateSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("secretary_general");
  if (!allowed) return { success: false, error: "Secretary General access required." };

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input." };

  try {
    await getDb()
      .update(meetingMinutes)
      .set({
        agenda: parsed.data.agenda,
        minutes: parsed.data.minutes,
        attendees: parsed.data.attendees,
        updatedAt: new Date(),
      })
      .where(eq(meetingMinutes.id, parsed.data.id));
    revalidatePath("/dashboard/secretary_general/minute-editor");
    return { success: true };
  } catch (err) {
    console.error("updateMinutes failed:", err);
    return { success: false, error: "Could not update these minutes." };
  }
}
