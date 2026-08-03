import { isNull } from "drizzle-orm";
import { getDb } from ".././../../lib/drizzle/client";
import { projects } from ".././../../lib/drizzle/schema";
import { requireRole } from ".././../../lib/clerk/client";
import { ProjectsTable } from ".././../../features/admin/ProjectsTable";

export const metadata = { title: "Admin — Projects" };

export default async function AdminProjectsPage() {
  const check = await requireRole("admin");
  if (!check.ok) {
    return <main className="px-8 pt-40 text-text-2">You don&apos;t have access to this page.</main>;
  }

  const db = getDb();
  const rows = await db
    .select({
      id: projects.id,
      title: projects.title,
      communitySlug: projects.communitySlug,
      stars: projects.stars,
      deletedAt: projects.deletedAt,
    })
    .from(projects)
    .where(isNull(projects.deletedAt));

  return (
    <main className="mx-auto max-w-[1280px] px-8 pb-24 pt-40">
      <h1 className="font-display text-3xl">Projects</h1>
      <div className="mt-8">
        <ProjectsTable projects={rows} />
      </div>
    </main>
  );
}