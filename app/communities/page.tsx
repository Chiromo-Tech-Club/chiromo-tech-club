import Link from "next/link";
import { COMMUNITIES } from "@/data/communities";
import { ROUTES } from "@/constants/routes";
import { TiltCard } from "@/components/animations/TiltCard";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { ArrowLeftIcon } from "lucide-react";
import { getTechNews } from "@/lib/news";
import { NewsSlideshow } from "@/components/news/Newsslideshow";
import { NewsPaginatedGrid } from "@/components/news/Newspaginatedgrid";

export const metadata = { title: "Communities" };

/** Broad cross-community tag set for the site-wide feed. Each community's
 *  own page narrows this down further — see COMMUNITY_NEWS_TAGS there. */
const SITE_NEWS_TAGS = ["webdev", "programming", "design", "ai", "career", "startup"];

/* ------------------------------------------------------------------ */
/*  Feed-side content — no data model for these yet. Wire to real     */
/*  sources (forum posts, events table, follows) when they exist.     */
/* ------------------------------------------------------------------ */

/** Semantic status-tone chips — reused for tags AND avatar fills so the whole
 *  page draws from the same finite palette instead of ad-hoc hex values. */
const TONES = [
  "information",
  "feature",
  "success",
  "highlighted",
  "stable",
  "warning",
  "away",
] as const;
type Tone = (typeof TONES)[number];

const DISCUSSIONS: {
  author: string;
  tone: Tone;
  emoji: string;
  title: string;
  replies: number;
  tags: { label: string; tone: Tone }[];
}[] = [
  {
    author: "BrainyOlivia",
    tone: "warning",
    emoji: "🧑‍🎓",
    title: "What's the best way to stay consistent with learning?",
    replies: 120,
    tags: [
      { label: "LearningHabits", tone: "warning" },
      { label: "Motivation", tone: "information" },
      { label: "TimeManagement", tone: "feature" },
    ],
  },
  {
    author: "Katie02",
    tone: "success",
    emoji: "👩",
    title: "How I landed a freelance gig after completing the Business Strategy course",
    replies: 43,
    tags: [
      { label: "CareerJourney", tone: "success" },
      { label: "Freelancing", tone: "warning" },
      { label: "BusinessCourse", tone: "information" },
    ],
  },
];

/** Real upcoming Kenyan tech events for the sidebar showcase carousel */
const KENYA_TECH_EVENTS = [
  {
    slug: "ciso6-cyber-security-summit-2026",
    title: "CISO6 Cyber Security Summit",
    date: "Aug 21, 2026",
    time: "9:00 AM (EAT)",
    blurb: "Gathering top cybersecurity leaders and network defenders in Nairobi to address critical digital defense systems.",
  },
  {
    slug: "ai-forum-kenya-2026",
    title: "The AI Forum Kenya",
    date: "Sep 07, 2026",
    time: "9:00 AM (EAT)",
    blurb: "An exclusive platform where business and tech leaders converge to discuss AI's structural role in Kenya's economy.",
  },
  {
    slug: "openinfra-day-kenya-2026",
    title: "OpenInfra Day Kenya",
    date: "Sep 04, 2026",
    time: "9:00 AM (EAT)",
    blurb: "Connecting open-source cloud infrastructure architects, developers, and innovators building open stacks in Nairobi.",
  },
];

const HASHTAGS: { label: string; tone: Tone }[] = [
  { label: "LearningStreak", tone: "feature" },
  { label: "BuiltWithCode", tone: "success" },
  { label: "DesignInspo", tone: "highlighted" },
  { label: "AskTheCommunity", tone: "warning" },
  { label: "ChallengeAccepted", tone: "stable" },
  { label: "CareerSwitch", tone: "feature" },
  { label: "StudySetup", tone: "away" },
  { label: "MyFirstCourse", tone: "information" },
  { label: "WomenInTech", tone: "warning" },
  { label: "DailyWin", tone: "success" },
  { label: "1D1Course", tone: "information" },
];

const PEOPLE: { name: string; role: string; tone: Tone; emoji: string }[] = [
  { name: "Uchiha_Obito", role: "UX Enthusiast", tone: "warning", emoji: "🧑" },
  { name: "Karina01", role: "Designer", tone: "highlighted", emoji: "👩‍🎨" },
  { name: "Designerzzz", role: "Full-Stack Designer", tone: "warning", emoji: "👩" },
  { name: "StuartSmart", role: "Mobile App Developer", tone: "feature", emoji: "🧑‍💻" },
  { name: "OliviaRod01", role: "Web Designer", tone: "success", emoji: "👩‍🦰" },
];

const TAG_TONES: Record<Tone, string> = {
  warning: "bg-warning-lighter text-warning-dark",
  information: "bg-information-lighter text-information-dark",
  feature: "bg-feature-lighter text-feature-dark",
  success: "bg-success-lighter text-success-dark",
  highlighted: "bg-highlighted-lighter text-highlighted-dark",
  stable: "bg-stable-lighter text-stable-dark",
  away: "bg-away-lighter text-away-dark",
};

const AVATAR_TONES: Record<Tone, string> = {
  warning: "bg-warning-light",
  information: "bg-information-light",
  feature: "bg-feature-light",
  success: "bg-success-light",
  highlighted: "bg-highlighted-light",
  stable: "bg-stable-light",
  away: "bg-away-light",
};

/* ------------------------------------------------------------------ */
/*  Small building blocks                                             */
/* ------------------------------------------------------------------ */

function Tag({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span className={`rounded-pill px-3 py-1 text-label-xs ${TAG_TONES[tone]}`}>
      {label}
    </span>
  );
}

function Avatar({ tone, emoji }: { tone: Tone; emoji: string }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${AVATAR_TONES[tone]} text-[16px]`}
    >
      {emoji}
    </span>
  );
}

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group/link inline-flex items-center gap-1.5 text-label-sm text-sky">
      {children}
      <svg
        viewBox="0 0 16 16"
        fill="none"
        strokeWidth="1.6"
        className="h-3.5 w-3.5 stroke-current transition-transform duration-300 group-hover/link:translate-x-1"
      >
        <path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" />
      </svg>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default async function CommunitiesPage() {
  const news = await getTechNews(SITE_NEWS_TAGS, { limit: 26 });
  const featuredNews = news.slice(0, 8);
  const moreNews = news.slice(8);

  return (
    <main className="relative mx-auto max-w-[1280px] overflow-hidden px-4 sm:px-8 pb-24 pt-40 font-body">
      {/* Warm up the news-image CDNs early so covers in the slideshow/grid arrive faster */}
      <link rel="preconnect" href="https://res.cloudinary.com" />
      <link rel="preconnect" href="https://miro.medium.com" />
      <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      <link rel="dns-prefetch" href="https://miro.medium.com" />

      {/* Scoped keyframes — no client JS needed */}
      <style>{`
        @keyframes drift { 0% { transform: translate(0,0) } 50% { transform: translate(2%, -3%) } 100% { transform: translate(0,0) } }
        @keyframes pulse-ring { 0% { transform: scale(0.9); opacity: .9 } 70% { transform: scale(1.9); opacity: 0 } 100% { opacity: 0 } }
        @keyframes marquee-l { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes marquee-r { from { transform: translateX(-50%) } to { transform: translateX(0) } }
        .cc-orb { animation: drift 14s ease-in-out infinite; }
        .cc-pulse::before { content: ""; position: absolute; inset: 0; border-radius: 9999px; background: currentColor; animation: pulse-ring 1.8s cubic-bezier(0,0,0.2,1) infinite; }
        .cc-marquee-track { animation: marquee-l 32s linear infinite; }
        .cc-marquee-track-r { animation: marquee-r 38s linear infinite; }
        .cc-marquee-row:hover .cc-marquee-track,
        .cc-marquee-row:hover .cc-marquee-track-r { animation-play-state: paused; }
      `}</style>

      {/* Ambient background — faint drifting glow + graph paper texture, both keyed to the sky token */}
      <div className="pointer-events-none absolute inset-0 -z-10 text-ink">
        <div
          className="cc-orb absolute -top-24 right-[-10%] h-[520px] w-[520px] rounded-full opacity-[0.16] blur-[110px]"
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

      {/* ---------------- Hero ---------------- */}
      <RevealOnScroll className="relative max-w-[640px]">
        <div className="mb-5 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-label-xs font-semibold text-ink-2 transition-colors hover:text-ink"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line transition-transform group-hover:-translate-x-0.5">
              <ArrowLeftIcon className="h-3.5 w-3.5" />
            </span>
            Back to Home
          </Link>
        </div>

        <div className="mb-5 flex items-center gap-2.5 font-mono text-subheading-xs uppercase text-sky">
          <span className="h-px w-4 bg-sky" />
          Communities
          <span className="relative ml-1 flex h-1.5 w-1.5">
            <span className="cc-pulse absolute h-1.5 w-1.5 rounded-full text-sky" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-sky" />
          </span>
        </div>

        <h1 className="font-display text-title-h2 font-medium leading-[1.05] tracking-[-0.02em] text-ink md:text-title-h1">
          Eight disciplines.
          <br />
          <span className="text-ink-2">One club, wired together.</span>
        </h1>
        <p className="mt-4.5 max-w-[520px] text-paragraph-lg text-ink-2">
          Pick a lane or work across all of them — every community runs its own projects, workshops, and mentors.
        </p>

        <div className="mt-6 flex items-center gap-2 font-mono text-label-sm text-muted">
          <span className="text-ink">{String(COMMUNITIES.length).padStart(2, "0")}</span>
          communities · one shared network
        </div>
      </RevealOnScroll>

      <div className="relative mt-[72px] grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        
        {/* ---------------- Main column ---------------- */}
        <div className="flex min-w-0 flex-col gap-14">
          
          {/* Peer groups — the eight real communities, wired as one network */}
          <RevealOnScroll>
            <h2 className="mb-5 text-title-h6 text-ink">Peer Groups</h2>
            <div className="relative flex flex-col gap-4">
              {/* the "one club" spine — a single trace connecting every node */}
              <div className="pointer-events-none absolute bottom-[55px] left-[57px] top-[55px] hidden w-px bg-gradient-to-b from-line via-sky/30 to-line sm:block" />
              {COMMUNITIES.map((c) => (
                <Link key={c.slug} href={ROUTES.community(c.slug)} className="relative block">
                  <TiltCard
                    maxTilt={2}
                    className="group relative flex flex-col items-start gap-5 overflow-hidden rounded-card border border-line bg-white p-4 transition-colors duration-300 hover:border-sky/40 hover:bg-cream-2 sm:flex-row sm:items-center"
                  >
                    {/* oversized ghost numeral */}
                    <span className="pointer-events-none absolute -right-2 bottom-[-18px] select-none font-mono text-[92px] font-medium leading-none tracking-tighter text-ink opacity-[0.04] transition-opacity duration-300 group-hover:opacity-[0.08]">
                      {c.number}
                    </span>

                    <div className="relative z-[1] flex h-[110px] w-full shrink-0 items-center justify-center rounded-card-sm bg-cream-2 sm:w-[114px]">
                      {/* node dot on the spine */}
                      <span className="absolute -left-[26px] hidden h-2.5 w-2.5 rounded-full border-2 border-white bg-line-strong transition-colors duration-300 group-hover:bg-sky sm:block" />
                      <span className="absolute left-3 top-3 font-mono text-label-2xs text-muted">{c.number}</span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="1.4"
                        className="h-9 w-9 stroke-ink-2 transition-all duration-300 group-hover:-translate-y-1 group-hover:stroke-sky"
                        dangerouslySetInnerHTML={{ __html: c.iconPaths }}
                      />
                    </div>
                    
                    {/* Text content with min-w-0 to prevent flexbox blowout */}
                    <div className="relative z-[1] flex min-w-0 flex-1 flex-col gap-1.5">
                      <h3 className="truncate text-label-lg text-ink">{c.name}</h3>
                      <p className="max-w-[520px] text-paragraph-sm text-ink-2">{c.description}</p>
                    </div>

                    <span className="relative z-[1] flex w-full shrink-0 items-center justify-center gap-1.5 rounded-pill bg-navy px-5 py-2.5 text-label-sm text-white transition-colors group-hover:bg-sky sm:w-auto">
                      Join Group
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        strokeWidth="1.6"
                        className="h-3.5 w-3.5 stroke-current transition-transform duration-300 group-hover:translate-x-0.5"
                      >
                        <path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" />
                      </svg>
                    </span>
                  </TiltCard>
                </Link>
              ))}
            </div>
          </RevealOnScroll>

          {/* Trending discussions */}
          <RevealOnScroll>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-title-h6 text-ink">Trending Discussions</h2>
              <ArrowLink href={ROUTES.blog}>See More</ArrowLink>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {DISCUSSIONS.map((d) => (
                <article
                  key={d.title}
                  className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky/30 hover:shadow-custom-md"
                >
                  <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-sky transition-transform duration-300 group-hover:scale-x-100" />
                  <div className="mb-3.5 flex items-center gap-2.5">
                    <Avatar tone={d.tone} emoji={d.emoji} />
                    <span className="text-label-sm text-ink">{d.author}</span>
                  </div>
                  <h3 className="text-label-lg leading-snug text-ink">{d.title}</h3>
                  <p className="mt-2.5 flex items-center gap-1.5 font-mono text-label-xs text-muted">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" className="h-4 w-4 stroke-current">
                      <path d="M21 11.5a8.38 8.38 0 01-8.5 8.5 8.5 8.5 0 01-4-1L3 20l1.3-3.9a8.38 8.38 0 01-1-4A8.38 8.38 0 0111.8 3a8.5 8.5 0 019.2 8.5z" />
                    </svg>
                    {d.replies} replies
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {d.tags.map((t) => (
                      <Tag key={t.label} label={t.label} tone={t.tone} />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </RevealOnScroll>

          {/* Tech news — live from Dev.to + Medium across every discipline */}
          <RevealOnScroll>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-title-h6 text-ink">Tech News, Live From the Web</h2>
              <span className="font-mono text-label-xs text-muted">DEV · Medium</span>
            </div>
            <NewsSlideshow articles={featuredNews} />
            <div className="mt-8">
              <NewsPaginatedGrid articles={moreNews} perPage={6} />
            </div>
          </RevealOnScroll>
        </div>

        {/* ---------------- Sidebar ---------------- */}
        <aside className="flex flex-col gap-8">
          
          {/* Live Kenya Tech Events Showcase (Carousel-style container) */}
          <RevealOnScroll className="relative overflow-hidden rounded-card bg-navy p-7 text-white">
            <div
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{ background: "radial-gradient(circle at 85% 0%, var(--color-sky-dark), transparent 60%)" }}
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            
            <div className="relative z-[1] mb-5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-subheading-2xs uppercase text-white/80">
                <span className="relative flex h-1.5 w-1.5 text-sky">
                  <span className="cc-pulse absolute h-1.5 w-1.5 rounded-full text-sky" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-sky" />
                </span>
                Trending Events in Kenya
              </div>
              <span className="rounded-pill bg-white/10 px-2.5 py-0.5 font-mono text-label-2xs text-white/70">
                Live
              </span>
            </div>

            {/* Scrollable event cards stack or mini-carousel feed */}
            <div className="relative z-[1] flex flex-col gap-5">
              {KENYA_TECH_EVENTS.map((event, idx) => (
                <div 
                  key={event.slug} 
                  className={`flex flex-col gap-2 rounded-card-sm border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 ${
                    idx === 0 ? "border-sky/50 bg-white/10" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-label-2xs text-sky font-medium">
                      {event.date}
                    </span>
                    <span className="font-mono text-label-2xs text-white/60">
                      {event.time}
                    </span>
                  </div>
                  
                  <h4 className="text-label-md text-white font-medium leading-snug">
                    {event.title}
                  </h4>
                  
                  <p className="text-paragraph-xs text-white/80 line-clamp-2">
                    {event.blurb}
                  </p>
                  
                  <div className="mt-1 flex items-center justify-end">
                    <Link
                      href={ROUTES.event(event.slug)}
                      className="group/cta inline-flex items-center gap-1 text-label-xs font-semibold text-sky hover:underline"
                    >
                      RSVP / Details
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        strokeWidth="1.6"
                        className="h-3 w-3 stroke-current transition-transform duration-300 group-hover/cta:translate-x-0.5"
                      >
                        <path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </RevealOnScroll>

          {/* Trending hashtags — a quiet marquee, pauses on hover */}
          <RevealOnScroll>
            <h3 className="mb-4 text-label-lg text-ink">Trending Hashtags</h3>
            <div className="cc-marquee-row -mx-2 flex flex-col gap-2.5 overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <div className="cc-marquee-track flex w-max shrink-0 gap-2 px-2">
                {[...HASHTAGS, ...HASHTAGS].map((h, i) => (
                  <Tag key={`${h.label}-${i}`} label={h.label} tone={h.tone} />
                ))}
              </div>
              <div className="cc-marquee-track-r flex w-max shrink-0 gap-2 px-2">
                {[...HASHTAGS].reverse().concat([...HASHTAGS].reverse()).map((h, i) => (
                  <Tag key={`${h.label}-r-${i}`} label={h.label} tone={h.tone} />
                ))}
              </div>
            </div>
          </RevealOnScroll>

          {/* People to follow */}
          <RevealOnScroll>
            <h3 className="mb-4 text-label-lg text-ink">People to Follow</h3>
            <div className="flex flex-col gap-1">
              {PEOPLE.map((p) => (
                <div
                  key={p.name}
                  className="group flex items-center justify-between rounded-card-sm border border-line bg-white px-4 py-3 transition-colors duration-300 hover:border-sky/30 hover:bg-cream-2"
                >
                  <div className="flex items-center gap-3">
                    <Avatar tone={p.tone} emoji={p.emoji} />
                    <div>
                      <p className="text-label-sm text-ink">{p.name}</p>
                      <p className="text-label-2xs text-muted">{p.role}</p>
                    </div>
                  </div>
                  <button className="text-label-xs font-medium text-sky opacity-80 transition-opacity hover:underline group-hover:opacity-100">
                    + Follow
                  </button>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </aside>
      </div>
    </main>
  );
}