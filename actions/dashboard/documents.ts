"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { documents } from "@/lib/drizzle/schema";
import { requireRole } from "@/lib/clerk/client";
import { getCurrentMember } from "@/lib/clerk/get-current-user";
import type { ActionResult } from "@/actions/membership";

const createSchema = z.object({
  title: z.string().min(2).max(200),
  url: z.string().url(),
  category: z.string().min(2).max(60).optional(),
});

export async function addDocument(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const check = await requireRole("exec");
  if (!check.ok) return { success: false, error: "Executive access required." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    await getDb()
      .insert(documents)
      .values({
        title: parsed.data.title,
        url: parsed.data.url,
        category: parsed.data.category || "General",
        uploadedById: member.id,
      });
    revalidatePath("/dashboard/documents");
    return { success: true };
  } catch (err) {
    console.error("addDocument failed:", err);
    return { success: false, error: "Could not save this document." };
  }
}
