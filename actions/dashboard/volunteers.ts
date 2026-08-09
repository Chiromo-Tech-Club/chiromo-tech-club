"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { volunteerLogs } from "@/lib/drizzle/schema";
import { requireRole } from "@/lib/clerk/client";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  memberId: z.string().uuid(),
  activity: z.string().min(2).max(200),
  hours: z.number().int().positive().max(1000),
  loggedDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

export async function logVolunteerHours(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const check = await requireRole("exec");
  if (!check.ok) return { success: false, error: "Executive access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  try {
    await getDb().insert(volunteerLogs).values({
      memberId: parsed.data.memberId,
      activity: parsed.data.activity,
      hours: parsed.data.hours,
      loggedDate: parsed.data.loggedDate ? new Date(parsed.data.loggedDate) : new Date(),
      notes: parsed.data.notes || null,
    });
    revalidatePath("/dashboard/membership_officer/volunteers");
    return { success: true };
  } catch (err) {
    console.error("logVolunteerHours failed:", err);
    return { success: false, error: "Could not save this log entry." };
  }
}
