"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { execMessages } from "@/lib/drizzle/schema";
import { requireRole } from "@/lib/clerk/client";
import { getCurrentMember } from "@/lib/clerk/get-current-user";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({ body: z.string().min(1).max(2000) });

export async function postMessage(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const check = await requireRole("exec");
  if (!check.ok) return { success: false, error: "Executive access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Message can't be empty." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await getDb().insert(execMessages).values({ body: parsed.data.body, authorId: member.id });
    revalidatePath("/dashboard/chat");
    return { success: true };
  } catch (err) {
    console.error("postMessage failed:", err);
    return { success: false, error: "Could not send this message." };
  }
}
