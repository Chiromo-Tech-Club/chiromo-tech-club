"use client";

import { useEffect, useState } from "react";
import { TESTIMONIALS } from "../content/testimonials";
import { cn } from "../lib/utils/cn";

export function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % TESTIMONIALS.length), 5500);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="testimonials" className="py-40">
      <div className="mx-auto max-w-[1280px] px-8">
        <div className="relative mx-auto min-h-[220px] max-w-[820px] text-center">
          {TESTIMONIALS.map((t, i) => (
            <blockquote
              key={t.author}
              className={cn(
                "font-display text-[clamp(24px,3.6vw,38px)] font-normal leading-[1.35] tracking-[-0.01em] transition-all duration-500",
                i === active
                  ? "relative opacity-100"
                  : "absolute inset-0 translate-y-3.5 opacity-0",
              )}
            >
              &ldquo;{t.quote}&rdquo;
              <cite className="mt-6 block font-body text-sm font-medium not-italic text-text-2">
                — {t.author}, {t.role}
              </cite>
            </blockquote>
          ))}
        </div>
        <div className="mt-11 flex justify-center gap-2">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.author}
              aria-label={`Show testimonial from ${t.author}`}
              onClick={() => setActive(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active ? "w-5 bg-accent" : "w-1.5 bg-line-strong",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
