"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { RevealOnScroll } from "../components/animations/RevealOnScroll";

interface VisionVoice {
  id: string;
  quote: string;
  author: string;
  role: string;
  trackBadge: string;
  image: string;
}

const PIONEER_VOICES: VisionVoice[] = [
  {
    id: "lead",
    quote: "Reading slides isn't enough. We started this club so Chiromo students can ship production-ready code, train real AI models, and build things that matter before graduation.",
    author: "Core Team",
    role: "Founding Lead",
    trackBadge: "Club Vision",
    image: "/images/1000201224.jpg",
  },
  {
    id: "ai",
    quote: "Our goal is simple: demystify Artificial Intelligence. You'll go from just using AI tools to fine-tuning models and building AI-native applications from scratch.",
    author: "AI & Research Lead",
    role: "Chiromo Tech Club",
    trackBadge: "AI Track",
    image: "/images/1000199413.jpg",
  },
  {
    id: "hardware",
    quote: "The Fourth Industrial Revolution is happening now. We're bridging the gap between software and hardware using microcontrollers, sensors, and robotics.",
    author: "Hardware & 4IR Lead",
    role: "Chiromo Tech Club",
    trackBadge: "Robotics & 4IR",
    image: "/images/1000199433.jpg",
  },
  {
    id: "dev",
    quote: "No endless tutorials. Every sprint ends with a live project deployed to the web. Learn Git, cloud infra, and modern frameworks alongside people who push you.",
    author: "Software Eng. Lead",
    role: "Chiromo Tech Club",
    trackBadge: "Dev Sprint",
    image: "/images/1000199419.jpg",
  },
];

export function TestimonialBand() {
  const [index, setIndex] = useState(0);
  const active = PIONEER_VOICES[index];

  function prev() {
    setIndex((i) => (i - 1 + PIONEER_VOICES.length) % PIONEER_VOICES.length);
  }

  function next() {
    setIndex((i) => (i + 1) % PIONEER_VOICES.length);
  }

  return (
    <section className="px-6 py-10 md:px-12">
      <RevealOnScroll className="mx-auto max-w-[1280px] overflow-hidden rounded-[var(--radius-card)] bg-pink px-8 py-12 md:px-16 md:py-16 shadow-xl">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1.3fr_0.9fr]">
          
          {/* Quote & Vision Section */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
              <Quote size={14} className="text-white/80" />
              <span>Pioneer Vision • Why We Build</span>
            </div>

            <blockquote className="min-h-[140px] font-display text-[clamp(20px,2.8vw,30px)] font-bold leading-[1.3] text-white">
              &ldquo;{active.quote}&rdquo;
            </blockquote>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-0.5 w-6 bg-white/40" />
              <p className="text-sm font-medium text-white/90">
                <strong className="font-bold text-white">{active.author}</strong> — {active.role}
              </p>
            </div>

            {/* Navigation & Counter */}
            <div className="mt-10 flex items-center justify-between border-t border-white/20 pt-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={prev}
                  aria-label="Previous vision"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition-all hover:bg-white hover:text-pink active:scale-95"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  onClick={next}
                  aria-label="Next vision"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition-all hover:bg-white hover:text-pink active:scale-95"
                >
                  <ArrowRight size={18} />
                </button>
              </div>

              {/* Progress Indicator */}
              <div className="font-display text-xs font-bold tracking-widest text-white/80">
                0{index + 1} / 0{PIONEER_VOICES.length}
              </div>
            </div>
          </div>

          {/* Visual Card Side */}
          <div className="overflow-hidden rounded-[var(--radius-card-sm)] bg-surface shadow-2xl transition-all duration-300">
            <div className="relative aspect-[6/5] w-full">
              <Image 
                src={active.image} 
                alt={active.author} 
                fill 
                className="object-cover transition-transform duration-700 hover:scale-105" 
              />
              <span className="absolute left-4 top-4 rounded-full bg-pink/90 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md shadow-md">
                {active.trackBadge}
              </span>
            </div>
            <div className="p-6">
              <h3 className="font-display text-lg font-bold text-ink">{active.author}</h3>
              <p className="mt-1 text-xs font-medium text-ink-2">{active.role}</p>
            </div>
          </div>

        </div>
      </RevealOnScroll>
    </section>
  );
}