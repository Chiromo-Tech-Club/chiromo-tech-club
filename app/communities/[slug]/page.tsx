import Link from "next/link";
import { notFound } from "next/navigation";
import { COMMUNITIES } from "@/data/communities";
import { PROJECTS } from "@/data/projects";
import { getCommunityBySlug } from "@/utils/get-community-slug";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/alignui/button";
import { TiltCard } from "@/components/animations/TiltCard";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { getTechNews } from "@/lib/news";
import { NewsSlideshow } from "@/components/news/Newsslideshow";
import { NewsPaginatedGrid } from "@/components/news/Newspaginatedgrid";

interface CommunityPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Maps each community's slug to the Dev.to / Medium tags its news feed
 * should pull from. Dev.to tags are lowercase, single words, no hyphens —
 * edit these to match your actual 8 community slugs and topics.
 */
const COMMUNITY_NEWS_TAGS: Record<string, string[]> = {
  "web-development": ["webdev", "javascript"],
  "ui-ux-design": ["design", "ux"],
  "data-science": ["datascience", "machinelearning"],
  "mobile-development": ["mobile", "android"],
  cybersecurity: ["security", "cybersecurity"],
  "product-management": ["product", "career"],
  "business-strategy": ["business", "startup"],
  "cloud-devops": ["devops", "cloud"],
};

function tagsForCommunity(slug: string): string[] {
  return COMMUNITY_NEWS_TAGS[slug] ?? [slug.replace(/-/g, "")];
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
  const news = await getTechNews(tagsForCommunity(slug), { limit: 18 });
  const featuredNews = news.slice(0, 6);
  const moreNews = news.slice(6);

  return (
    <main className="relative mx-auto max-w-[1280px] overflow-hidden px-8 pb-24 pt-40 font-body">
      {/* Warm up the news-image CDNs early so covers in the slideshow/grid arrive faster */}
      <link rel="preconnect" href="https://res.cloudinary.com" />
      <link rel="preconnect" href="https://miro.medium.com" />
      <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      <link rel="dns-prefetch" href="https://miro.medium.com" />

      {/* Ambient background — matches the communities index page */}
      <div className="pointer-events-none absolute inset-0 -z-10 text-ink">
        <div
          className="absolute -top-24 right-[-10%] h-[520px] w-[520px] rounded-full opacity-[0.16] blur-[110px]"
          style={{ background: "radial-gradient(circle, var(--color-sky), transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "linear-gradient(to bottom, black, transparent 80%)",
          }}
        />
      </div>

      <RevealOnScroll className="relative max-w-[640px]">
        <Link
          href={ROUTES.communities}
          className="mb-6 inline-flex items-center gap-2 text-label-xs font-semibold text-ink-2 transition-colors hover:text-ink"
        >
          ← All communities
        </Link>
        <div className="mb-5 flex items-center gap-2.5 font-mono text-subheading-xs uppercase text-sky">
          <span className="h-px w-4 bg-sky" />
          Community {community.number}
        </div>
        <h1 className="font-display text-title-h2 font-medium leading-[1.05] tracking-[-0.02em] text-ink md:text-title-h1">
          {community.name}
        </h1>
        <p className="mt-4.5 max-w-[520px] text-paragraph-lg text-ink-2">{community.description}</p>
        <Button
          asChild
          variant="primary"
          className="mt-8 rounded-pill bg-navy text-white hover:bg-sky"
        >
          <Link href={ROUTES.join}>Join this community</Link>
        </Button>
      </RevealOnScroll>

      <section className="relative mt-20">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-title-h6 text-ink">Projects from this community</h2>
          <span className="font-mono text-label-xs text-muted">
            {String(relatedProjects.length).padStart(2, "0")} total
          </span>
        </div>

        {relatedProjects.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-cream-2 px-6 py-10 text-center">
            <p className="text-paragraph-sm text-muted">No projects published yet — check back soon.</p>
          </div>
        ) : (
          <RevealOnScroll className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProjects.map((p) => (
              <TiltCard
                key={p.slug}
                maxTilt={3}
                className="rounded-card-sm border border-line bg-surface p-6 transition-colors duration-300 hover:border-sky/40 hover:bg-cream-2"
              >
                <div className="mb-2.5 flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-pill border border-sky/25 px-2 py-0.5 font-mono text-label-2xs text-sky"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-label-lg text-ink">{p.title}</h3>
                <p className="mt-1.5 text-paragraph-sm text-ink-2">{p.description}</p>
              </TiltCard>
            ))}
          </RevealOnScroll>
        )}
      </section>

      <section className="relative mt-20">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-title-h6 text-ink">News for {community.name}</h2>
          <span className="font-mono text-label-xs text-muted">DEV · Medium</span>
        </div>

        {featuredNews.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-cream-2 px-6 py-10 text-center">
            <p className="text-paragraph-sm text-muted">No stories tagged for this community yet — check back soon.</p>
          </div>
        ) : (
          <RevealOnScroll>
            <NewsSlideshow articles={featuredNews} />
            <div className="mt-8">
              <NewsPaginatedGrid articles={moreNews} perPage={6} />
            </div>
          </RevealOnScroll>
        )}
      </section>
    </main>
  );
}