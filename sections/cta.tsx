"use client";

import { useRef } from "react";
import Link from "next/link";
import { ROUTES } from "../constants/routes";
import { Button } from "../components/alignui/button";
import { RevealOnScroll } from "../components/animations/RevealOnScroll";
import { gsap } from "../lib/motion/register-gsap";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export function CTA() {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  function burst() {
    if (reduced) return;
    const btn = btnRef.current;
    const host = particlesRef.current;
    if (!btn || !host) return;

    const btnRect = btn.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    const originX = btnRect.left - hostRect.left + btnRect.width / 2;
    const originY = btnRect.top - hostRect.top + btnRect.height / 2;

    for (let i = 0; i < 14; i++) {
      const p = document.createElement("div");
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 90;
      p.className = "absolute h-[3px] w-[3px] rounded-full bg-accent shadow-[0_0_6px_rgba(139,124,246,0.45)]";
      p.style.left = `${originX}px`;
      p.style.top = `${originY}px`;
      host.appendChild(p);
      gsap.to(p, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        duration: 0.9 + Math.random() * 0.4,
        ease: "power2.out",
        onComplete: () => p.remove(),
      });
    }
  }

  return (
    <section id="cta" className="relative py-[200px] text-center">
      <div ref={particlesRef} className="pointer-events-none absolute inset-0" aria-hidden />
      <RevealOnScroll className="mx-auto max-w-[1280px] px-8">
        <div className="mb-5 flex items-center justify-center gap-2.5 font-mono text-xs uppercase tracking-[0.18em] text-accent">
          <span className="h-px w-4 bg-accent" />
          Ch. 08 — Join the Club
        </div>
        <h2 className="font-display text-[clamp(40px,7vw,84px)] font-medium tracking-[-0.03em]">
          Build with <em className="not-italic text-accent">us.</em>
        </h2>
        <p className="mt-5 text-[17px] text-text-2">No application gate. Just curiosity, a laptop, and a willingness to ship.</p>
        <Button asChild variant="primary" className="mt-9">
          <Link ref={btnRef} href={ROUTES.join} onMouseEnter={burst}>
            Build With Us →
          </Link>
        </Button>
      </RevealOnScroll>
    </section>
  );
}
