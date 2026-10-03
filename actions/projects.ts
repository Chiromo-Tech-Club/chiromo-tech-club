"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/drizzle/client";
import { ensureClubTools } from "@/lib/drizzle/ensure-club-tools";
import { projects } from "@/lib/drizzle/schema";
import { getCurrentMember, hasCompletedClubRegistration } from "@/lib/supabase/get-current-member";
import { slugify } from "@/lib/utils/slugify";
import { COMMUNITIES } from "@/data/communities";
import { ROUTES } from "@/constants/routes";
import type { ActionResult } from "@/actions/membership";

const communitySlugs = COMMUNITIES.map((c) => c.slug) as [string, ...string[]];

const submitSchema = z.object({
  title: z.string().trim().min(2).max(120),
  pitch: z.string().trim().min(8).max(180),
  explanation: z.string().trim().min(40).max(4000),
  tags: z.string().trim().max(200).optional(),
  communitySlug: z.enum(communitySlugs),
  websiteUrl: z.union([z.literal(""), z.string().trim().url()]),
  repoUrl: z.union([z.literal(""), z.string().trim().url()]),
});

export async function submitMemberProject(input: z.infer<typeof submitSchema>): Promise<ActionResult> {
  const member = await getCurrentMember();
  if (!member || !hasCompletedClubRegistration(member)) {
    return { success: false, error: "Finish your membership registration before sharing a project." };
  }

  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const tags = (parsed.data.tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 6);

  await ensureClubTools();
  const db = getDb();

  let slug = slugify(parsed.data.title) || "project";
  const [taken] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, slug)).limit(1);
  if (taken) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  try {
    await db.insert(projects).values({
      slug,
      title: parsed.data.title,
      pitch: parsed.data.pitch,
      description: parsed.data.explanation,
      tags,
      communitySlug: parsed.data.communitySlug,
      websiteUrl: parsed.data.websiteUrl || null,
      repoUrl: parsed.data.repoUrl || null,
      authorId: member.id,
    });
    revalidatePath(ROUTES.projects);
    revalidatePath(ROUTES.project(slug));
    revalidatePath(ROUTES.admin);
    revalidatePath(ROUTES.dashboard);
    return { success: true };
  } catch (err) {
    console.error("submitMemberProject failed:", err);
    return { success: false, error: "Could not publish this project." };
  }
}
