"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../lib/drizzle/client";
import { projects } from "../lib/drizzle/schema";
import { requireRole } from "../lib/clerk/client";
import { slugify } from "../lib/utils/slugify";
import { ROUTES } from "../constants/routes";
import type { ActionResult } from "../actions/membership";

const projectInputSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(1000),
  tags: z.array(z.string()).default([]),
  communitySlug: z.string(),
  repoUrl: z.string().url().optional(),
});

export async function createProject(input: z.infer<typeof projectInputSchema>): Promise<ActionResult> {
  const check = await requireRole("admin");
  if (!check.ok) return { success: false, error: "Admin access required." };

  const parsed = projectInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const db = getDb();
  try {
    await db.insert(projects).values({
      slug: slugify(parsed.data.title),
      title: parsed.data.title,
      description: parsed.data.description,
      tags: parsed.data.tags,
      communitySlug: parsed.data.communitySlug,
      repoUrl: parsed.data.repoUrl ?? null,
    });

    revalidatePath(ROUTES.projects);
    revalidatePath(ROUTES.adminProjects);
    return { success: true };
  } catch (err) {
    console.error("createProject failed:", err);
    return { success: false, error: "Could not create project." };
  }
}

/** Soft-delete only — see the schema's deletedAt convention. */
export async function archiveProject(projectId: string): Promise<ActionResult> {
  const check = await requireRole("admin");
  if (!check.ok) return { success: false, error: "Admin access required." };

  const db = getDb();
  try {
    await db.update(projects).set({ deletedAt: new Date() }).where(eq(projects.id, projectId));
    revalidatePath(ROUTES.projects);
    revalidatePath(ROUTES.adminProjects);
    return { success: true };
  } catch (err) {
    console.error("archiveProject failed:", err);
    return { success: false, error: "Could not archive project." };
  }
}