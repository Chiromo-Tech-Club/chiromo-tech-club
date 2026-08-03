"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ROUTES } from "..//constants/routes";
import { HERO_PROGRAMS } from "..//data/programs";
import { Button } from "..//components/alignui/button";
import { MagneticButton } from "..//components/animations/MagneticButton";
import { useReducedMotion } from "..//hooks/use-reduced-motion";
import { cn } from "..//lib/utils/cn";
import { runHeroBandEntrance, setHeroBandFinalState, type HeroBandRefs } from "../animations/hero-bound-sequence";

export function HeroBand() {
  const reduced = useReducedMotion();

  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineWordRefs = useRef<HTMLSpanElement[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);
  const doodleWrapperRef = useRef<HTMLDivElement>(null);
  const doodlePathRefs = useRef<SVGPathElement[]>([]);
  const ringGroupRef = useRef<HTMLDivElement>(null);
  const underlinePathRef = useRef<SVGPathElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const fullStopRef = useRef<HTMLSpanElement>(null);
  const dLetterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (
      !badgeRef.current ||
      !ctaRef.current ||
      !ringGroupRef.current ||
      !doodleWrapperRef.current ||
      !underlinePathRef.current ||
      !fullStopRef.current ||
      !dLetterRef.current
    ) {
      return;
    }

    const refs: HeroBandRefs = {
      badgeEl: badgeRef.current,
      headlineWords: headlineWordRefs.current.filter(Boolean),
      ctaEl: ctaRef.current,
      doodleWrapperEl: doodleWrapperRef.current,
      doodlePaths: doodlePathRefs.current.filter(Boolean),
      ringGroup: ringGroupRef.current,
      underlinePath: underlinePathRef.current,
      cardEls: cardRefs.current.filter(Boolean),
      fullStopEl: fullStopRef.current,
      dLetterEl: dLetterRef.current,
    };

    if (reduced) {
      setHeroBandFinalState(refs);
      return;
    }

    return runHeroBandEntrance(refs);
  }, [reduced]);

  return (
    <header className="relative overflow-hidden bg-white px-6 pb-20 pt-12 md:px-12 md:pt-20">
      {/* Decorative floating doodle (top left) */}
      <div ref={doodleWrapperRef} className="absolute left-[5%] top-[12%] hidden lg:block opacity-70">
        <svg className="w-16 text-pink" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path
            ref={(el) => {
              if (el) doodlePathRefs.current[0] = el;
            }}
            d="M20,10 Q30,50 80,70"
          />
          <path
            ref={(el) => {
              if (el) doodlePathRefs.current[1] = el;
            }}
            d="M60,85 L80,70 L75,45"
          />
        </svg>
      </div>

      {/* Decorative concentric rings */}
      <div ref={ringGroupRef} className="absolute left-[8%] top-[55%] hidden lg:block text-pink/30">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="30" cy="30" r="10" />
          <circle cx="30" cy="30" r="18" />
          <circle cx="30" cy="30" r="26" />
        </svg>
      </div>

      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div
              ref={badgeRef}
              className="mb-6 inline-flex items-center rounded-full border border-line bg-cream/60 px-4 py-1.5 text-xs font-semibold text-ink-2 shadow-sm"
            >
              #1 tech community at UoN
            </div>

            <h1 className="font-display text-[clamp(42px,6.5vw,78px)] font-extrabold leading-[1.05] tracking-tight text-ink">
              <span
                ref={(el) => {
                  if (el) headlineWordRefs.current[0] = el;
                }}
                className="inline-block"
              >
                Great
              </span>{" "}
              <span
                ref={(el) => {
                  if (el) headlineWordRefs.current[1] = el;
                }}
                className="inline-block -rotate-2 font-serif font-bold text-pink"
              >
                buil
                <span ref={dLetterRef} className="inline-block">
                  d
                </span>
                ers
              </span>{" "}
              <br />
              <span
                ref={(el) => {
                  if (el) headlineWordRefs.current[2] = el;
                }}
                className="inline-block"
              >
                start
              </span>{" "}
              <span
                ref={(el) => {
                  if (el) headlineWordRefs.current[3] = el;
                }}
                className="relative inline-block rotate-2 font-serif font-bold text-pink"
              >
                here
                <span ref={fullStopRef} className="inline-block">
                  .
                </span>
                <svg className="absolute -bottom-2 left-0 w-full overflow-visible text-pink" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path ref={underlinePathRef} d="M0 15 Q 50 25 100 10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <div ref={ctaRef} className="mt-10">
              <MagneticButton>
                <Button
                  asChild
                  variant="primary"
                  className="group rounded-full bg-pink px-8 py-4 text-base font-bold text-white transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_-10px_var(--color-pink)]"
                >
                  <Link href={ROUTES.join} className="flex items-center gap-3">
                    <span>Join the Club</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-pink transition-transform duration-300 group-hover:rotate-45">
                      <ArrowUpRight size={18} strokeWidth={3} />
                    </span>
                  </Link>
                </Button>
              </MagneticButton>
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-6 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          {HERO_PROGRAMS.map((p, index) => (
            <div
              key={p.slug}
              ref={(el) => {
                if (el) cardRefs.current[index] = el;
              }}
              className={cn(
                "flex flex-col justify-between rounded-[28px] p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
                p.highlighted ? "bg-pink text-white shadow-[0_16px_40px_-10px_var(--color-pink)]" : "bg-[#F5F2EB] text-ink",
              )}
            >
              <div className="mb-8">
                <h3 className={cn("font-display text-xl font-bold leading-snug tracking-tight", p.highlighted ? "text-white" : "text-ink")}>
                  {p.title}
                </h3>
                <p className={cn("mt-3 text-sm leading-relaxed", p.highlighted ? "text-white/90" : "text-ink/70")}>{p.description}</p>
              </div>

              <Link
                href={ROUTES.community(p.slug)}
                className={cn(
                  "block w-full rounded-full py-3.5 text-center text-sm font-bold shadow-sm transition-all active:scale-[0.98]",
                  p.highlighted ? "bg-white text-pink hover:bg-white/90" : "bg-white text-ink hover:bg-cream",
                )}
              >
                Learn More
              </Link>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}