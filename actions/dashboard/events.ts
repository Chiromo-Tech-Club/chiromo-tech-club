"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { events } from "@/lib/drizzle/schema";
import { canAccessExecSection } from "@/lib/supabase/auth-helpers";
import { slugify } from "@/lib/utils/slugify";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(3).max(2000),
  startsAt: z.string().datetime(),
  location: z.string().min(2).max(200),
  capacity: z.number().int().positive().optional().nullable(),
});

export async function createEvent(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const allowed = await canAccessExecSection("corporate_affairs");
  if (!allowed) return { success: false, error: "Corporate Affairs access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  try {
    await getDb()
      .insert(events)
      .values({
        slug: `${slugify(parsed.data.title)}-${Date.now().toString(36)}`,
        title: parsed.data.title,
        description: parsed.data.description,
        startsAt: new Date(parsed.data.startsAt),
        location: parsed.data.location,
        capacity: parsed.data.capacity || null,
      });
    revalidatePath("/dashboard/corporate_affairs/event-manager");
    revalidatePath("/events");
    return { success: true };
  } catch (err) {
    console.error("createEvent failed:", err);
    return { success: false, error: "Could not save this event." };
  }
}
