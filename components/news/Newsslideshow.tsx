"use client";

import { useEffect, useRef, useState } from "react";
import type { NewsArticle } from "@/lib/news";
import { FadeImage } from "./FadeImage";

const AUTO_ADVANCE_MS = 5500;
const SOURCE_LABEL: Record<NewsArticle["source"], string> = {
  "dev.to": "DEV",
  medium: "Medium",
};

export function NewsSlideshow({ articles }: { articles: NewsArticle[] }) {
  const slides = articles.slice(0, 8);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }, [index]);

  if (slides.length === 0) return null;

  const go = (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-hidden rounded-card [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((a, i) => (
          <div key={a.id} className="w-full shrink-0 snap-center">
            <div className="relative flex flex-col overflow-hidden rounded-card bg-navy text-white sm:h-[280px] sm:flex-row">
              <div className="relative h-52 w-full shrink-0 overflow-hidden sm:h-full sm:w-[45%]">
                <FadeImage src={a.coverImage} priority={i === 0} fallbackClassName="bg-navy-dark text-white/60" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/10 to-transparent sm:bg-gradient-to-r sm:from-navy/10 sm:via-transparent sm:to-transparent" />
              </div>
              <div className="flex flex-1 flex-col justify-center gap-3 p-7">
                <span className="w-fit rounded-pill bg-surface/10 px-2.5 py-1 font-mono text-label-2xs uppercase tracking-wide text-sky">
                  {SOURCE_LABEL[a.source]} · Just In
                </span>
                <h3 className="line-clamp-2 text-title-h6 leading-snug text-white">{a.title}</h3>
                <p className="line-clamp-2 text-paragraph-sm text-white/75">{a.description}</p>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/cta mt-1 inline-flex w-fit items-center gap-1.5 rounded-pill bg-surface px-4 py-2 text-label-sm font-semibold text-navy transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Read on {SOURCE_LABEL[a.source]}
                  <svg viewBox="0 0 16 16" fill="none" strokeWidth="1.6" className="h-3.5 w-3.5 stroke-current transition-transform duration-300 group-hover/cta:translate-x-1">
                    <path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            aria-label="Previous story"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-navy shadow-custom-sm transition-transform hover:scale-105 sm:flex"
          >
            ‹
          </button>
          <button
            aria-label="Next story"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-navy shadow-custom-sm transition-transform hover:scale-105 sm:flex"
          >
            ›
          </button>
          <div className="mt-4 flex items-center justify-center gap-2">
            {slides.map((a, i) => (
              <button
                key={a.id}
                aria-label={`Go to story ${i + 1}`}
                onClick={() => go(i)}
                className={`h-1.5 rounded-pill transition-all duration-300 ${
                  i === index ? "w-6 bg-sky" : "w-1.5 bg-line-strong hover:bg-sky/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}