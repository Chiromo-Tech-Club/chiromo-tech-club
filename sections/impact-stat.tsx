import Image from "next/image";
import { RevealOnScroll } from "../components/animations/RevealOnScroll";
import { SITE_CONFIG } from "../config/site";

export function ImpactStat() {
  return (
    <section id="impact" className="px-6 py-10 md:px-12">
      <RevealOnScroll
        className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[var(--radius-card)] px-8 py-12 md:px-16 md:py-16 text-white shadow-xl"
        style={{
          background:
            "radial-gradient(130% 140% at 85% 15%, #2563EB 0%, #1B2A4A 45%, #0B1324 100%)",
        }}
      >
        {/* Soft Background Glow Accent */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        {/* Header Bar */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            Pioneer Cohort • Launch Phase
          </div>

          {/* Club Brand Badge with Your Logo */}
          <div className="hidden items-center gap-2.5 text-sm font-bold text-white/90 sm:flex">
            <div className="relative h-6 w-6 overflow-hidden rounded-full bg-white/10 p-1">
              <Image 
                src="/images/image.svg" 
                alt={`${SITE_CONFIG.name} Logo`} 
                width={50} 
                height={100}
                className="h-full w-full object-contain"
              />
            </div>
            <span>{SITE_CONFIG.name.toLowerCase()}.</span>
          </div>
        </div>

        {/* Content & Launch Metrics */}
        <div className="relative z-10 mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <h2 className="font-display text-[clamp(28px,4vw,44px)] font-extrabold leading-[1.15] text-white">
              Start from Day 1. <br />
              <span className="text-white/80">Shape Chiromo&apos;s tech future.</span>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">
              You don&apos;t have to wait to build big things. Join as a founding member to hack on AI models, cloud infrastructure, and 4IR hardware alongside a driven team.
            </p>
          </div>

          {/* Pioneer Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/15 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <div>
              <div className="font-display text-[clamp(28px,3.5vw,44px)] font-extrabold text-white">
                4
              </div>
              <div className="mt-1 text-xs font-medium text-white/70 md:text-sm">
                Tech Tracks
              </div>
            </div>

            <div>
              <div className="font-display text-[clamp(28px,3.5vw,44px)] font-extrabold text-white">
                100%
              </div>
              <div className="mt-1 text-xs font-medium text-white/70 md:text-sm">
                Hands-On
              </div>
            </div>

            <div>
              <div className="font-display text-[clamp(28px,3.5vw,44px)] font-extrabold text-white">
                #01
              </div>
              <div className="mt-1 text-xs font-medium text-white/70 md:text-sm">
                Pioneer Wave
              </div>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}