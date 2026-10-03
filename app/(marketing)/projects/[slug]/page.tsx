import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navigation/Navbar";
import { COMMUNITIES } from "@/data/communities";
import { getPublicProject } from "@/lib/projects/queries";
import { ROUTES } from "@/constants/routes";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublicProject(slug);
  return { title: project ? `${project.title} — Projects` : "Project" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublicProject(slug);
  if (!project) notFound();

  const community = COMMUNITIES.find((item) => item.slug === project.communitySlug);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <Link href={ROUTES.projects} className="text-sm font-semibold text-sky hover:underline">
          All projects
        </Link>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-wide text-muted">
          {community?.name ?? project.communitySlug}
          {project.authorName ? ` · ${project.authorName}` : ""}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">{project.title}</h1>
        {project.pitch ? <p className="mt-3 text-lg text-ink-2">{project.pitch}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-line px-2.5 py-1 text-[11px] text-ink-2">
              {tag}
            </span>
          ))}
        </div>
        <h2 className="mt-8 font-display text-lg font-semibold text-ink">What it does</h2>
        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-2">{project.description}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
          {project.websiteUrl ? (
            <a href={project.websiteUrl} className="text-sky hover:underline" target="_blank" rel="noreferrer">
              Website
            </a>
          ) : null}
          {project.repoUrl ? (
            <a href={project.repoUrl} className="text-sky hover:underline" target="_blank" rel="noreferrer">
              Repository
            </a>
          ) : null}
        </div>
      </main>
    </>
  );
}
