import Link from "next/link";
import { COMMUNITIES } from "@/data/communities";
import { ROUTES } from "@/constants/routes";
import { TiltCard } from "@/components/animations/TiltCard";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { ArrowLeftIcon } from "lucide-react";

export const metadata = { title: "Communities" };

/* ------------------------------------------------------------------ */
/*  Feed-side content — no data model for these yet. Wire to real     */
/*  sources (forum posts, events table, follows) when they exist.     */
/* ------------------------------------------------------------------ */

const DISCUSSIONS = [
  {
    author: "BrainyOlivia",
    avatarBg: "bg-[#CFE0FF]",
    emoji: "🧑‍🎓",
    title: "What's the best way to stay consistent with learning?",
    replies: 120,
    tags: [
      { label: "LearningHabits", tone: "peach" },
      { label: "Motivation", tone: "blue" },
      { label: "TimeManagement", tone: "violet" },
    ],
  },
  {
    author: "Katie02",
    avatarBg: "bg-[#FFE1C7]",
    emoji: "👩",
    title: "How I landed a freelance gig after completing the Business Strategy course",
    replies: 43,
    tags: [
      { label: "CareerJourney", tone: "mint" },
      { label: "Freelancing", tone: "peach" },
      { label: "BusinessCourse", tone: "blue" },
    ],
  },
] as const;

const LIVE_EVENT = {
  slug: "designing-for-impact",
  title: 'Live Session This Friday: "Designing for Impact"',
  date: "May 24",
  time: "6 PM (GMT)",
  blurb: "Join our expert-led live workshop on creating meaningful user experiences.",
};

const HASHTAGS = [
  { label: "LearningStreak", tone: "violet" },
  { label: "BuiltWithCode", tone: "mint" },
  { label: "DesignInspo", tone: "pink" },
  { label: "AskTheCommunity", tone: "peach" },
  { label: "ChallengeAccepted", tone: "teal" },
  { label: "CareerSwitch", tone: "violet" },
  { label: "StudySetup", tone: "gold" },
  { label: "MyFirstCourse", tone: "blue" },
  { label: "WomenInTech", tone: "peach" },
  { label: "DailyWin", tone: "mint" },
  { label: "1D1Course", tone: "blue" },
] as const;

const PEOPLE = [
  { name: "Uchiha_Obito", role: "UX Enthusiast", avatarBg: "bg-[#FFD9B3]", emoji: "🧑" },
  { name: "Karina01", role: "Designer", avatarBg: "bg-[#FFD3E4]", emoji: "👩‍🎨" },
  { name: "Designerzzz", role: "Full-Stack Designer", avatarBg: "bg-[#FFE1C7]", emoji: "👩" },
  { name: "StuartSmart", role: "Mobile App Developer", avatarBg: "bg-[#DAD6FF]", emoji: "🧑‍💻" },
  { name: "OliviaRod01", role: "Web Designer", avatarBg: "bg-[#CFF3DC]", emoji: "👩‍🦰" },
] as const;

const TAG_TONES: Record<string, string> = {
  peach: "bg-[#FFE9D6] text-[#B5641A]",
  blue: "bg-[#DCEBFF] text-[#2657B0]",
  violet: "bg-[#E9E4FF] text-[#5B47C7]",
  mint: "bg-[#DEF5E6] text-[#237A4B]",
  pink: "bg-[#FFE1EF] text-[#C23A79]",
  teal: "bg-[#D9F3F1] text-[#1C7E77]",
  gold: "bg-[#FBF0CE] text-[#9A7B0C]",
};

/* ------------------------------------------------------------------ */
/*  Small building blocks                                             */
/* ------------------------------------------------------------------ */

function Tag({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-[12px] font-medium ${
        TAG_TONES[tone] ?? "bg-bg-1 text-text-2"
      }`}
    >
      {label}
    </span>
  );
}

function Avatar({ bg, emoji }: { bg: string; emoji: string }) {
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg} text-[16px]`}>
      {emoji}
    </span>
  );
}

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group/link inline-flex items-center gap-1.5 text-[14px] font-medium text-accent">
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
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CommunitiesPage() {
  return (
    <main className="relative mx-auto max-w-[1280px] overflow-hidden px-8 pb-24 pt-40">
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

      {/* Ambient background — faint drifting glow + graph paper texture */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="cc-orb absolute -top-24 right-[-10%] h-[520px] w-[520px] rounded-full opacity-[0.14] blur-[110px]"
          style={{ background: "radial-gradient(circle, var(--tw-color-accent, currentColor), transparent 70%)" }}
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
        <div className="flex items-center justify-between mb-5">

          <Link
            href="/"
            className="group flex items-center gap-2 text-xs font-semibold text-ink-2 transition-colors hover:text-ink"
            >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line transition-transform group-hover:-translate-x-0.5">
              <ArrowLeftIcon />
            </span>
            Back to Home
          </Link>
            </div>
        <div className="mb-5 flex items-center gap-2.5  text-xs uppercase tracking-[0.18em] text-accent">
         <h2> Communities</h2>
          <span className="relative ml-1 flex h-1.5 w-1.5">
          </span>
        </div>
        <h1 className="font-display text-[clamp(32px,4.4vw,52px)] font-medium leading-[1.02] tracking-[-0.02em]">
          Eight disciplines.
          <br />
          <span className="text-text-3">One club, wired together.</span>
        </h1>
        <p className="mt-4.5 max-w-[520px] text-[16px] leading-[1.6] text-text-2">
          Pick a lane or work across all of them — every community runs its own projects, workshops, and mentors.
        </p>
      </RevealOnScroll>

      <div className="relative mt-[72px] grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {/* ---------------- Main column ---------------- */}
        <div className="flex flex-col gap-14">
          {/* Peer groups — the eight real communities, wired as one network */}
          <RevealOnScroll>
            <h2 className="mb-5 text-[20px] font-semibold text-text">Peer Groups</h2>
            <div className="relative flex flex-col gap-4">
              {/* the "one club" spine — a single trace connecting every node */}
              <div className="pointer-events-none absolute bottom-[55px] left-[57px] top-[55px] hidden w-px bg-gradient-to-b from-line via-accent/30 to-line sm:block" />
              {COMMUNITIES.map((c) => (
                <Link key={c.slug} href={ROUTES.community(c.slug)} className="relative block">
                  <TiltCard
                    maxTilt={2}
                    className="group relative flex flex-col items-start gap-5 overflow-hidden rounded-[18px] border border-line bg-bg p-4 transition-colors duration-300 hover:border-accent/40 hover:bg-bg-1 sm:flex-row sm:items-center"
                  >
                    {/* oversized ghost numeral — structure that actually encodes sequence */}
                    <span className="pointer-events-none absolute -right-2 bottom-[-18px] select-none font-display text-[92px] font-medium leading-none text-text tracking-tighter opacity-[0.035] transition-opacity duration-300 group-hover:opacity-[0.07]">
                      {c.number}
                    </span>

                    <div className="relative z-[1] flex h-[110px] w-full shrink-0 items-center justify-center rounded-[14px] bg-bg-1 sm:w-[114px]">
                      {/* node dot on the spine */}
                      <span className="absolute -left-[26px] hidden h-2.5 w-2.5 rounded-full border-2 border-bg bg-line transition-colors duration-300 group-hover:bg-accent sm:block" />
                      <span className="absolute left-3 top-3 font-mono text-[11px] text-text-3">{c.number}</span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="1.4"
                        className="h-9 w-9 stroke-text-2 transition-all duration-300 group-hover:-translate-y-1 group-hover:stroke-accent"
                        dangerouslySetInnerHTML={{ __html: c.iconPaths }}
                      />
                    </div>
                    <div className="relative z-[1] flex flex-1 flex-col gap-1.5">
                      <h3 className="text-[17px] font-semibold text-text">{c.name}</h3>
                      <p className="max-w-[520px] text-[14px] leading-[1.5] text-text-3">{c.description}</p>
                    </div>
                    <span className="relative z-[1] flex w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-bg-1 px-5 py-2.5 text-[14px] font-medium text-text transition-colors group-hover:bg-accent group-hover:text-white sm:w-auto">
                      Join Group
                      <svg viewBox="0 0 16 16" fill="none" strokeWidth="1.6" className="h-3.5 w-3.5 stroke-current transition-transform duration-300 group-hover:translate-x-0.5">
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
              <h2 className="text-[20px] font-semibold text-text">Trending Discussions</h2>
              <ArrowLink href={ROUTES.blog}>See More</ArrowLink>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {DISCUSSIONS.map((d) => (
                <article
                  key={d.title}
                  className="group relative flex flex-col overflow-hidden rounded-[18px] border border-line bg-bg p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_16px_36px_rgba(20,20,30,0.08)]"
                >
                  <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
                  <div className="mb-3.5 flex items-center gap-2.5">
                    <Avatar bg={d.avatarBg} emoji={d.emoji} />
                    <span className="text-[14px] font-medium text-text">{d.author}</span>
                  </div>
                  <h3 className="text-[17px] font-semibold leading-snug text-text">{d.title}</h3>
                  <p className="mt-2.5 flex items-center gap-1.5 text-[13px] text-text-3">
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
        </div>

        {/* ---------------- Sidebar ---------------- */}
        <aside className="flex flex-col gap-8">
          {/* Live session banner */}
          <RevealOnScroll className="relative overflow-hidden rounded-[20px] bg-accent p-7 text-white">
            <div
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{ background: "radial-gradient(circle at 85% 0%, rgba(255,255,255,0.28), transparent 60%)" }}
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="relative z-[1] mb-3 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white/80">
              <span className="relative flex h-1.5 w-1.5">
                <span className="cc-pulse absolute h-1.5 w-1.5 rounded-full text-white" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              Live This Week
            </div>
            <h3 className="relative z-[1] text-[22px] font-semibold leading-[1.2]">{LIVE_EVENT.title}</h3>
            <div className="relative z-[1] mt-4 flex items-center gap-4 text-[13px] text-white/85">
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" className="h-4 w-4 stroke-current">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M3 10h18M8 3v4M16 3v4" />
                </svg>
                {LIVE_EVENT.date}
              </span>
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" className="h-4 w-4 stroke-current">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3.5 2" />
                </svg>
                {LIVE_EVENT.time}
              </span>
            </div>
            <p className="relative z-[1] mt-3.5 text-[14px] leading-[1.55] text-white/90">{LIVE_EVENT.blurb}</p>
            <Link
              href={ROUTES.event(LIVE_EVENT.slug)}
              className="group/cta relative z-[1] mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-accent transition-transform duration-300 hover:-translate-y-0.5"
            >
              Save Your Seat
              <svg viewBox="0 0 16 16" fill="none" strokeWidth="1.6" className="h-3.5 w-3.5 stroke-current transition-transform duration-300 group-hover/cta:translate-x-1">
                <path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" />
              </svg>
            </Link>
          </RevealOnScroll>

          {/* Trending hashtags — a quiet marquee, pauses on hover */}
          <RevealOnScroll>
            <h3 className="mb-4 text-[17px] font-semibold text-text">Trending Hashtags</h3>
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
            <h3 className="mb-4 text-[17px] font-semibold text-text">People to Follow</h3>
            <div className="flex flex-col gap-1">
              {PEOPLE.map((p) => (
                <div
                  key={p.name}
                  className="group flex items-center justify-between rounded-[14px] border border-line bg-bg px-4 py-3 transition-colors duration-300 hover:border-accent/30 hover:bg-bg-1"
                >
                  <div className="flex items-center gap-3">
                    <Avatar bg={p.avatarBg} emoji={p.emoji} />
                    <div>
                      <p className="text-[14px] font-medium text-text">{p.name}</p>
                      <p className="text-[12.5px] text-text-3">{p.role}</p>
                    </div>
                  </div>
                  <button className="text-[13px] font-medium text-accent opacity-80 transition-opacity hover:underline group-hover:opacity-100">
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