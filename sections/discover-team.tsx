"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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

export function DiscoverTeam() {
  const reduced = useReducedMotion();

  return (
    <section id="team" className="overflow-hidden py-24">
      <div className="mx-auto max-w-[1280px] px-8">
        <RevealOnScroll className="mx-auto max-w-[560px] text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 text-xs font-medium text-ink-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-green [animation:pulse-live_1.8s_ease-in-out_infinite]" />
              <span className="relative h-2 w-2 rounded-full bg-green" />
            </span>
            Meet the humans behind the code
          </div>
          <h2 className="font-display text-[clamp(26px,3.6vw,36px)] font-extrabold leading-[1.2] tracking-[-0.01em] text-ink">
            Discover the team behind the builds
          </h2>
          <p className="mt-3 text-sm text-ink-2">
            Real people, real fun facts — hover a card to reveal their details.
          </p>
        </RevealOnScroll>
      </div>

      {/* 
        Marquee Container:
        - mx-[30px] ensures it starts 30px from left edge and ends 30px from right edge
        - overflow-hidden clips cards as soon as they reach those 30px boundaries
      */}
      <RevealOnScroll className="group/marquee relative mt-14 mx-[30px] overflow-hidden rounded-3xl py-4">
        {/* Subtle Edge Gradients starting at 30px bounds */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-[#F5F3ED] via-[#F5F3ED]/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-[#F5F3ED] via-[#F5F3ED]/80 to-transparent" />

        <div
          className={cn(
            "flex w-max gap-5 py-8 px-4",
            !reduced &&
              "[animation:marquee-loop_42s_linear_infinite] group-hover/marquee:[animation-play-state:paused]"
          )}
        >
          {MARQUEE_MEMBERS.map((m, i) => (
            <TiltCard
              key={`${m.slug}-${i}`}
              maxTilt={6}
              className="group/card relative flex-none cursor-pointer"
            >
              <div
                className={cn(
                  /* Card outer wrapper: hover:scale-115 broadens card size and elevates it over neighbors */
                  "relative flex flex-col items-center w-[180px] sm:w-[200px] transition-all duration-500 ease-out hover:scale-115 hover:z-30",
                  !reduced && "[animation:card-bob_7s_ease-in-out_infinite]"
                )}
                style={
                  !reduced
                    ? { animationDelay: `${(i % TEAM_MEMBERS.length) * 0.35}s` }
                    : undefined
                }
              >
                {/* Main Card Shell */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[24px] bg-white shadow-md transition-shadow duration-500 group-hover/card:shadow-2xl">
                  {/* Card Image */}
                  <Image
                    src={m.image}
                    alt={`${m.name}, ${m.role}`}
                    fill
                    className="object-cover object-top grayscale contrast-105 transition-all duration-500 ease-out group-hover/card:grayscale-0 group-hover/card:scale-105"
                    sizes="220px"
                  />

                  {/* Dark gradient overlay for text readability on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />

                  {/* Top Pill Tag (Pink Badge) */}
                  <div className="absolute top-2.5 left-2.5 z-10 opacity-0 transition-all duration-300 -translate-y-2 group-hover/card:opacity-100 group-hover/card:translate-y-0">
                    <span className="inline-flex items-center gap-1 rounded-full bg-pink-500 px-2.5 py-0.5 text-[9px] font-extrabold text-white shadow-sm">
                      <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                      {m.nickname ? `"${m.nickname}"` : "Team"}
                    </span>
                  </div>

                  {/* Header Info (Name & Role inside image top) */}
                  <div className="absolute top-9 left-2.5 right-2.5 z-10 opacity-0 transition-all duration-300 -translate-y-1 group-hover/card:opacity-100 group-hover/card:translate-y-0">
                    <h3 className="text-xs font-bold text-white truncate drop-shadow-md">
                      {m.name}
                    </h3>
                    <p className="text-[10px] font-medium text-white/80 truncate">
                      {m.role}
                    </p>
                  </div>

                  {/* Bottom Embedded Card (Fun Fact Box) */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 opacity-0 transition-all duration-300 translate-y-2 group-hover/card:opacity-100 group-hover/card:translate-y-0">
                    <div className="rounded-[16px] bg-white/95 backdrop-blur-md p-2.5 shadow-lg border border-white/60">
                      <div className="text-[8px] font-extrabold uppercase tracking-wider text-green mb-0.5">
                        Fun Fact
                      </div>
                      <p className="text-[9.5px] leading-tight text-ink font-medium line-clamp-3">
                        {m.funFact || m.quote || m.bio || "Passionate about building cool products with code."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating "View Profile" Button below card */}
                <div className="mt-2.5 opacity-0 transition-all duration-300 translate-y-1 group-hover/card:opacity-100 group-hover/card:translate-y-0">
                  <Link
                    href={ROUTES.join}
                    className="inline-flex items-center gap-1 rounded-full bg-green px-3 py-1 text-[10px] font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                  >
                    View Profile
                    <ArrowUpRight size={12} />
                  </Link>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </RevealOnScroll>

      <div className="mt-10 flex justify-center px-8">
        <MagneticButton>
          <Button asChild variant="primary">
            <Link href={ROUTES.join}>
              Meet the Team
              <ArrowUpRight size={16} />
            </Link>
          </Button>
        </MagneticButton>
      </div>
    </section>
  );
}