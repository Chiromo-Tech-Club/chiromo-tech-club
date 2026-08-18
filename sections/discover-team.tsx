"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles, Quote, Users } from "lucide-react";
import { TEAM_MEMBERS } from "../data/team";
import { ROUTES } from "../constants/routes";
import { Button } from "../components/alignui/button";
import { MagneticButton } from "../components/animations/MagneticButton";
import { RevealOnScroll } from "../components/animations/RevealOnScroll";
import { TiltCard } from "../components/animations/TiltCard";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import { cn } from "../lib/utils/cn";

/** Doubled so the CSS marquee can loop seamlessly. */
const MARQUEE_MEMBERS = [...TEAM_MEMBERS, ...TEAM_MEMBERS];

const TICKER_WORDS = ["BUILDERS", "DESIGNERS", "ENGINEERS", "INNOVATORS", "SHIPPERS", "TINKERERS"];
const MARQUEE_TICKER = [...TICKER_WORDS, ...TICKER_WORDS];

/**
 * ID-panel color rotates per card. Note: no per-theme "accent" text color
 * anymore — green text read fine on white but nearly vanished on the ink
 * panel, so every accent element below now uses its own solid green chip
 * with white text instead, which stays legible regardless of panel color.
 */
const PANEL_THEMES = [
  { panel: "bg-navy-deep", name: "text-white", role: "text-white/60" },
  { panel: "bg-green", name: "text-white", role: "text-white/60" },
  { panel: "bg-surface border border-line", name: "text-ink", role: "text-muted" },
] as const;

export function DiscoverTeam() {
  const reduced = useReducedMotion();

  return (
    <section id="team" className="overflow-hidden py-24">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-8">
        <RevealOnScroll className="mx-auto max-w-[580px] text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line/60 bg-cream-2/80 px-4 py-1.5 text-xs font-semibold text-ink-2 shadow-sm backdrop-blur-md">
            <Users size={14} className="text-green" />
            <span>Meet the Core Team</span>
            <span className="relative ml-0.5 flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-green opacity-75" />
              <span className="relative h-2 w-2 rounded-full bg-green" />
            </span>
          </div>

          <h2 className="font-display text-[clamp(28px,3.8vw,42px)] font-extrabold leading-[1.15] tracking-tight text-ink">
            Discover the builders behind the code
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            The roster. Hover a card to see what makes each of them tick.
          </p>
        </RevealOnScroll>
      </div>

      {/* Scrolling brand ticker — navy-deep stays dark in both light and dark mode */}
      <div className="relative mt-10 overflow-hidden border-y border-line/60 bg-navy-deep py-2.5">
        <div
          className={cn(
            "flex w-max items-center gap-8 px-4",
            !reduced && "[animation:marquee-loop_28s_linear_infinite]"
          )}
        >
          {MARQUEE_TICKER.map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="flex items-center gap-8 font-display text-xs font-bold uppercase tracking-[0.25em] text-white/70"
            >
              {word}
              {/* was text-green — too close in luminance to the navy bg to read; white/40 always shows */}
              <span className="text-white/40">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Roster marquee */}
      <RevealOnScroll className="group/marquee relative mx-4 mt-10 overflow-hidden py-4 sm:mx-[30px]">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-cream via-cream/80 to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-cream via-cream/80 to-transparent sm:w-24" />

        <div
          className={cn(
            "flex w-max gap-6 px-4 py-6",
            !reduced &&
              "[animation:marquee-loop_50s_linear_infinite] group-hover/marquee:[animation-play-state:paused]"
          )}
        >
          {MARQUEE_MEMBERS.map((m, i) => {
            const theme = PANEL_THEMES[i % PANEL_THEMES.length];
            const index = String((i % TEAM_MEMBERS.length) + 1).padStart(2, "0");

            return (
              <TiltCard
                key={`${m.slug}-${i}`}
                maxTilt={3}
                className="group/card relative flex-none cursor-pointer"
              >
                <div className="relative flex w-[210px] flex-col transition-transform duration-500 ease-out hover:-translate-y-1.5 sm:w-[230px]">
                  {/* ---- Photo: clean, no text on it ---- */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[20px] border border-line/40 border-b-0 bg-surface">
                    <Image
                      src={m.image}
                      alt={`${m.name}, ${m.role}`}
                      fill
                      className="object-cover object-top grayscale contrast-105 transition-all duration-700 ease-out group-hover/card:scale-[1.06] group-hover/card:grayscale-0"
                      sizes="230px"
                    />

                    {/* Nickname pull-quote — always on a dark chip, so the icon is white, not green-on-dark */}
                    {m.nickname && (
                      <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-white/25 bg-navy-deep/70 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md">
                        <Quote size={10} className="text-white/70" />
                        {m.nickname}
                      </span>
                    )}

                    {/* Giant ghost index number — decorative, unaffected by the contrast issue since it's white/blend, not solid green */}
                    <span
                      className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[110px] font-black leading-none tracking-tighter text-white opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover/card:opacity-25"
                      aria-hidden="true"
                    >
                      {index}
                    </span>

                    {/* Hover wash + view-profile action */}
                    <div className="absolute inset-0 flex items-center justify-center bg-navy-deep/0 transition-colors duration-500 group-hover/card:bg-navy-deep/35">
                      <Link
                        href={ROUTES.join}
                        aria-label={`View ${m.name}'s profile`}
                        className="flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-surface text-ink opacity-0 shadow-lg transition-all duration-300 hover:bg-green hover:text-white group-hover/card:translate-y-0 group-hover/card:opacity-100"
                      >
                        <ArrowUpRight size={18} />
                      </Link>
                    </div>
                  </div>

                  {/* ---- ID panel: identity lives here, always visible ---- */}
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-b-[20px] px-4 pb-4 pt-3.5 transition-colors duration-500",
                      theme.panel
                    )}
                  >
                    {/* Default state: name + role + index badge */}
                    <div className="transition-all duration-300 group-hover/card:-translate-y-1 group-hover/card:opacity-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={cn("truncate font-display text-[15px] font-extrabold leading-tight", theme.name)}>
                          {m.name}
                        </h3>
                        {/* Solid green chip + white text — reads the same on every panel color */}
                        <span className="shrink-0 rounded-full bg-green px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-white">
                          N°{index}
                        </span>
                      </div>
                      <p className={cn("mt-0.5 truncate text-[11px] font-semibold uppercase tracking-wide", theme.role)}>
                        {m.role}
                      </p>
                    </div>

                    {/* Hover state: fun fact, crossfades in over the same panel */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-center px-4 opacity-0 transition-all duration-300 group-hover/card:pointer-events-auto group-hover/card:opacity-100">
                      <span className="mb-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-green px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                        <Sparkles size={10} />
                        Fun Fact
                      </span>
                      <p className={cn("line-clamp-3 text-[11px] font-medium leading-snug", theme.name)}>
                        {m.funFact || "Passionate about building scalable technology and mentoring fellow builders."}
                      </p>
                    </div>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </RevealOnScroll>

      <div className="mt-8 flex justify-center px-8">
        <MagneticButton>
          <Button asChild variant="primary">
            <Link href={ROUTES.join} className="gap-2">
              Join the Team
              <ArrowUpRight size={16} />
            </Link>
          </Button>
        </MagneticButton>
      </div>
    </section>
  );
}