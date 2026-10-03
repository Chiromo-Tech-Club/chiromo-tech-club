import Link from "next/link";
import { Navbar } from "@/components/navigation/Navbar";
import { COMMUNITIES } from "@/data/communities";
import { listPublicProjects } from "@/lib/projects/queries";
import { ROUTES } from "@/constants/routes";

export const metadata = {
  title: "Projects",
  description: "Projects built by Chiromo Tech Club members.",
};

export default async function ProjectsPage() {
  let rows: Awaited<ReturnType<typeof listPublicProjects>> = [];
  try {
    rows = await listPublicProjects();
  } catch (err) {
    console.error("listPublicProjects failed:", err);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-sky">Projects</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">What members are building</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">
              Each listing is a name, a one-line description, and a fuller explanation of the work — the same
              shape as a startup directory.
            </p>
          </div>
          <Link
            href={ROUTES.dashboardMyProject}
            className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white"
          >
            Share a project
          </Link>
        </div>

        {rows.length === 0 ? (
          <p className="mt-10 text-sm text-muted">No projects published yet.</p>
        ) : (
          <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {rows.map((project) => {
              const community = COMMUNITIES.find((item) => item.slug === project.communitySlug);
              return (
                <li key={project.slug}>
                  <Link
                    href={ROUTES.project(project.slug)}
                    className="block h-full rounded-3xl border border-line bg-surface p-5 transition hover:border-sky/40"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {community?.name ?? project.communitySlug}
                    </p>
                    <h2 className="mt-2 font-display text-xl font-bold text-ink">{project.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-2">{project.pitch || project.description}</p>
                    {project.authorName ? <p className="mt-3 text-xs text-muted">{project.authorName}</p> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
