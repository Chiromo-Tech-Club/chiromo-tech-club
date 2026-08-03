import Link from "next/link";
import { notFound } from "next/navigation";
import { COMMUNITIES } from ".././../../data/communities";
import { PROJECTS } from ".././../../data/projects";
import { getCommunityBySlug } from ".././../../utils/get-community-slug";
import { ROUTES } from ".././../../constants/routes";
import { Button } from ".././../../components/alignui/button";
import { TiltCard } from ".././../../components/animations/TiltCard";
import { RevealOnScroll } from ".././../../components/animations/RevealOnScroll";

interface CommunityPageProps {
  params: Promise<{ slug: string }>;
}

/** Pre-renders all 8 community pages at build time instead of on first request. */
export function generateStaticParams() {
  return COMMUNITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: CommunityPageProps) {
  const { slug } = await params;
  const community = getCommunityBySlug(slug);
  return { title: community ? community.name : "Community not found" };
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { slug } = await params;
  const community = getCommunityBySlug(slug);
  if (!community) notFound();

  const relatedProjects = PROJECTS.filter((p) => p.communitySlug === slug);

  return (
    <main className="mx-auto max-w-[1280px] px-8 pb-24 pt-40">
      <RevealOnScroll className="max-w-[640px]">
        <Link href={ROUTES.communities} className="mb-6 inline-block text-sm text-text-3 hover:text-text">
          ← All communities
        </Link>
        <div className="mb-5 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.18em] text-accent">
          <span className="h-px w-4 bg-accent" />
          Community {community.number}
        </div>
        <h1 className="font-display text-[clamp(32px,4.4vw,52px)] font-medium leading-[1.02] tracking-[-0.02em]">
          {community.name}
        </h1>
        <p className="mt-4.5 max-w-[520px] text-[16px] leading-[1.6] text-text-2">{community.description}</p>
        <Button asChild variant="primary" className="mt-8">
          <Link href={ROUTES.join}>Join this community</Link>
        </Button>
      </RevealOnScroll>

      <section className="mt-20">
        <h2 className="font-display text-xl">Projects from this community</h2>
        {relatedProjects.length === 0 ? (
          <p className="mt-4 text-sm text-text-3">No projects published yet — check back soon.</p>
        ) : (
          <RevealOnScroll className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProjects.map((p) => (
              <TiltCard key={p.slug} maxTilt={3} className="rounded-[16px] border border-line bg-bg-1 p-6">
                <div className="mb-2.5 flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-accent-2/25 px-2 py-0.5 font-mono text-[10px] text-accent-2">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-medium">{p.title}</h3>
                <p className="mt-1.5 text-sm text-text-2">{p.description}</p>
              </TiltCard>
            ))}
          </RevealOnScroll>
        )}
      </section>
    </main>
  );
}
