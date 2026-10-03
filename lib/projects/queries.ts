import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { ensureClubTools } from "@/lib/drizzle/ensure-club-tools";
import { members, projects } from "@/lib/drizzle/schema";

export interface PublicProject {
  slug: string;
  title: string;
  pitch: string | null;
  description: string;
  tags: string[];
  websiteUrl: string | null;
  repoUrl: string | null;
  communitySlug: string;
  authorName: string | null;
}

export async function listPublicProjects(): Promise<PublicProject[]> {
  await ensureClubTools();
  return getDb()
    .select({
      slug: projects.slug,
      title: projects.title,
      pitch: projects.pitch,
      description: projects.description,
      tags: projects.tags,
      websiteUrl: projects.websiteUrl,
      repoUrl: projects.repoUrl,
      communitySlug: projects.communitySlug,
      authorName: members.fullName,
    })
    .from(projects)
    .leftJoin(members, eq(projects.authorId, members.id))
    .where(isNull(projects.deletedAt))
    .orderBy(desc(projects.createdAt));
}

export async function getPublicProject(slug: string): Promise<PublicProject | null> {
  await ensureClubTools();
  const [row] = await getDb()
    .select({
      slug: projects.slug,
      title: projects.title,
      pitch: projects.pitch,
      description: projects.description,
      tags: projects.tags,
      websiteUrl: projects.websiteUrl,
      repoUrl: projects.repoUrl,
      communitySlug: projects.communitySlug,
      authorName: members.fullName,
    })
    .from(projects)
    .leftJoin(members, eq(projects.authorId, members.id))
    .where(and(eq(projects.slug, slug), isNull(projects.deletedAt)))
    .limit(1);
  return row ?? null;
}
