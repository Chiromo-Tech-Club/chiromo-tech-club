"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ROUTES } from "../constants/routes";
import { Button } from "../components/alignui/button";
import { MagneticButton } from "../components/animations/MagneticButton";
import { NeuralNetworkCanvas } from "../components/animations/NeuralNetworkCanvas";
import { SplashScreen } from "../components/animations/SplashScreen";
import { runHeroSequence, setHeroSequenceFinalState } from "../animations/hero-sequence";
import { useReducedMotion } from "../hooks/use-reduced-motion";

const FLOAT_OBJECTS = [
  { id: "fo1", label: "~/chiromo", className: "top-[22%] left-[10%]" },
  { id: "fo2", label: 'git commit -m "ship"', className: "top-[16%] right-[12%]" },
  { id: "fo3", label: "build in progress", className: "bottom-[20%] left-[8%]" },
  { id: "fo4", label: "research + AI", className: "bottom-[26%] right-[9%]" },
];

export function Hero() {
  const [splashDone, setSplashDone] = useState(false);
  const reduced = useReducedMotion();

  const sequenceRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const floatRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!splashDone) return;
    const refs = {
      sequenceEl: sequenceRef.current!,
      finalEl: finalRef.current!,
      subEl: subRef.current!,
      ctaEl: ctaRef.current!,
      floatEls: FLOAT_OBJECTS.map((f) => floatRefs.current[f.id]!).filter(Boolean),
      scrollCueEl: scrollCueRef.current!,
    };
    if (reduced) {
      setHeroSequenceFinalState(refs);
    } else {
      runHeroSequence(refs);
    }
  }, [splashDone, reduced]);

  return (
    <header id="hero" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-8 pb-20 pt-36 text-center">
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <NeuralNetworkCanvas />

      {FLOAT_OBJECTS.map((f) => (
        <div
          key={f.id}
          ref={(el) => {
            floatRefs.current[f.id] = el;
          }}
          className={`absolute z-[1] flex items-center gap-2 rounded-[14px] border border-line bg-white/[0.03] px-4 py-3.5 font-mono text-[11px] text-text-2 opacity-0 backdrop-blur-sm ${f.className}`}
        >
          {f.label}
        </div>
      ))}

      <div className="relative z-[2] max-w-[920px]">
        <div className="mb-5 flex items-center justify-center gap-2.5 font-mono text-xs uppercase tracking-[0.18em] text-accent">
          <span className="h-px w-4 bg-accent" />
          Chiromo Tech Club · University of Nairobi
        </div>

        <div
          ref={sequenceRef}
          className="min-h-[1.1em] font-display text-[clamp(48px,9vw,108px)] font-medium leading-none tracking-[-0.04em]"
        />
        <h1
          ref={finalRef}
          className="font-display text-[clamp(40px,7vw,84px)] font-medium leading-[1.0] tracking-[-0.03em] opacity-0"
        >
          The Future <em className="not-italic text-accent">Begins</em> Here.
        </h1>
        <p ref={subRef} className="mx-auto mt-6 max-w-[520px] text-[17px] text-text-2 opacity-0">
          A community of innovators, researchers, and builders shaping Africa&apos;s technology future — one line of
          code, one idea, one leader at a time.
        </p>
        <div ref={ctaRef} className="mt-10 flex justify-center gap-3.5 opacity-0">
          <MagneticButton>
            <Button asChild variant="primary">
              <Link href={ROUTES.join}>Join the Club</Link>
            </Button>
          </MagneticButton>
          <MagneticButton>
            <Button asChild variant="ghost">
              <Link href={ROUTES.communities}>Explore Communities</Link>
            </Button>
          </MagneticButton>
        </div>
      </div>

      <div
        ref={scrollCueRef}
        className="absolute bottom-9 left-1/2 z-[2] flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-text-3 opacity-0"
      >
        <span>Scroll</span>
        <span className="h-9 w-px bg-gradient-to-b from-text-3 to-transparent" />
      </div>
    </header>
  );
}
