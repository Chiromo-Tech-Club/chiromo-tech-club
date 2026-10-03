import { eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { ensureClubTools } from "@/lib/drizzle/ensure-club-tools";
import { members, projects } from "@/lib/drizzle/schema";
import { requireRole } from "@/lib/supabase/auth-helpers";
import { ProjectsTable } from "@/features/admin/ProjectsTable";

export const metadata = { title: "Admin — Projects" };

export default async function AdminProjectsPage() {
  const check = await requireRole("admin");
  if (!check.ok) {
    return <main className="px-8 pt-40 text-text-2">You don&apos;t have access to this page.</main>;
  }

  await ensureClubTools();
  const db = getDb();
  const rows = await db
    .select({
      id: projects.id,
      title: projects.title,
      pitch: projects.pitch,
      communitySlug: projects.communitySlug,
      stars: projects.stars,
      deletedAt: projects.deletedAt,
      authorName: members.fullName,
    })
    .from(projects)
    .leftJoin(members, eq(projects.authorId, members.id))
    .where(isNull(projects.deletedAt));

  const tableRows = rows.map((row) => ({
    ...row,
    authorName: row.authorName ?? null,
    deletedAt: row.deletedAt ? row.deletedAt.toISOString() : null,
  }));

  return (
    <main className="mx-auto max-w-[1280px] px-8 pb-24 pt-40">
      <h1 className="font-display text-3xl">Projects</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
        This is the club project directory. A member publishes a listing with a one-line pitch and a longer
        explanation of what they built. It shows on the public projects page. Use this screen to review those
        listings and archive one that should come down.
      </p>
      <div className="mt-8">
        <ProjectsTable projects={tableRows} />
      </div>
    </main>
  );
}