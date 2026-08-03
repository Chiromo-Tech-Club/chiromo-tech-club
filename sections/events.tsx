"use client";

import { useRef, useState } from "react";
import { EVENTS_SEED } from "../data/events-seed";
import { formatEventDate } from "../lib/utils/format-date";
import { RevealOnScroll } from "../components/animations/RevealOnScroll";

export function Events() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  function onScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const pct = (el.scrollLeft / (el.scrollWidth - el.clientWidth)) * 100;
    setProgress(Number.isFinite(pct) ? pct : 0);
  }

  return (
    <section id="events" className="py-40">
      <div className="mx-auto max-w-[1280px] px-8">
        <RevealOnScroll className="mb-[72px] max-w-[640px]">
          <div className="mb-5 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.18em] text-accent">
            <span className="h-px w-4 bg-accent" />
            Ch. 05 — Events
          </div>
          <h2 className="font-display text-[clamp(32px,4.4vw,52px)] font-medium leading-[1.02] tracking-[-0.02em]">
            What&apos;s next on the calendar.
          </h2>
        </RevealOnScroll>

        <RevealOnScroll>
          <div
            ref={scrollerRef}
            onScroll={onScroll}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 pt-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {EVENTS_SEED.map((e) => (
              <div key={e.slug} className="w-[320px] flex-none snap-start rounded-[18px] border border-line bg-bg-1 p-7">
                <div className="mb-4 h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(139,124,246,0.45)]" />
                <div className="font-mono text-xs tracking-wide text-accent">{formatEventDate(e.startsAt)}</div>
                <h3 className="mt-3.5 text-[22px] font-medium">{e.title}</h3>
                <p className="mt-2.5 text-sm leading-[1.6] text-text-2">{e.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-2 h-px bg-line">
            <div className="h-px bg-accent transition-[width] duration-100" style={{ width: `${progress}%` }} />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
