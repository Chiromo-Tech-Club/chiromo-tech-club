"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger, registerGsap } from "../lib/motion/register-gsap";
import { RevealOnScroll } from "../components/animations/RevealOnScroll";
import { cn } from "../lib/utils/cn";

const WORDS = ["Innovators.", "Builders.", "Researchers.", "Creators.", "Engineers."];

export function WhoWeAre() {
  const stackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    registerGsap();
    const el = stackRef.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 60%",
      end: "bottom 40%",
      onUpdate: (self) => {
        const idx = Math.min(WORDS.length - 1, Math.floor(self.progress * WORDS.length));
        setActiveIndex(idx);
      },
    });
    return () => trigger.kill();
  }, []);

  return (
    <section id="who" className="py-40">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-9 px-8 md:grid-cols-[1.3fr_1fr] md:gap-16">
        <div ref={stackRef} className="font-display text-[clamp(34px,7vw,88px)] font-medium leading-[1.04] tracking-[-0.03em]">
          {WORDS.map((word, i) => (
            <span
              key={word}
              className={cn(
                "block transition-colors duration-500",
                i === activeIndex ? "text-text" : "text-text-3",
                i === WORDS.length - 1 && i === activeIndex && "text-accent",
              )}
            >
              {word}
            </span>
          ))}
        </div>

        <RevealOnScroll className="max-w-[420px] self-center">
          <div className="mb-5 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.18em] text-accent">
            <span className="h-px w-4 bg-accent" />
            Who We Are
          </div>
          <p className="text-[16px] leading-[1.7] text-text-2">
            Chiromo Tech Club is a student-led community at the University of Nairobi where curiosity turns into
            craft. We build in public, learn in the open, and mentor the next builder in line — across AI, cloud,
            security, robotics, design, and beyond.
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
