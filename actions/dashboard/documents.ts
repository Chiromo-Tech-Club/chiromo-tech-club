"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { documents } from "@/lib/drizzle/schema";
import { requireRole } from "@/lib/supabase/auth-helpers";
import { getCurrentMember } from "@/lib/supabase/get-current-member";
import { uploadClubDocument } from "@/services/upload";
import type { ActionResult } from "@/actions/membership";

const metaSchema = z.object({
  title: z.string().min(2).max(200),
  category: z.string().min(2).max(60).optional(),
});

/**
 * Upload a club document file (PDF/Office/image) to Supabase Storage and
 * save its public URL on the documents row.
 */
export async function addDocument(formData: FormData): Promise<ActionResult> {
  const check = await requireRole("exec");
  if (!check.ok) return { success: false, error: "Executive access required." };

  const parsed = metaSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    category: String(formData.get("category") ?? "") || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size <= 0) {
    return { success: false, error: "Choose a file to upload." };
  }

  const member = await getCurrentMember();
  if (!member) return { success: false, error: "Member profile not found." };

  try {
    const uploaded = await uploadClubDocument(member.id, file);
    if (!uploaded.publicUrl) {
      return { success: false, error: "Upload succeeded but no public URL was returned." };
    }

    await getDb()
      .insert(documents)
      .values({
        title: parsed.data.title,
        url: uploaded.publicUrl,
        category: parsed.data.category || "General",
        uploadedById: member.id,
      });

    revalidatePath("/dashboard/documents");
    return { success: true };
  } catch (err) {
    console.error("addDocument failed:", err);
    const message = err instanceof Error ? err.message : "Could not save this document.";
    if (/bucket|not found|row-level/i.test(message)) {
      return {
        success: false,
        error: "Could not upload. Create a public Supabase Storage bucket named \"documents\", then try again.",
      };
    }
    return { success: false, error: message };
  }
}
