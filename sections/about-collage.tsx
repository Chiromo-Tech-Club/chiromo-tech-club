"use client";

import Image from "next/image";
import { SITE_CONFIG } from "../config/site";
import { RevealOnScroll } from "../components/animations/RevealOnScroll";

interface CollageItem {
  src: string;
  alt: string;
  className: string;
  badge?: string;
  badgePosition?: string;
  rotate?: string;
}

const COLLAGE: CollageItem[] = [
  { 
    src: "/images/1000199333.jpg", 
    alt: "AI Research & Development",
    className: "left-[5%] top-[6%] h-16 w-16 md:h-24 md:w-24",
    badge: "🤖 AI & ML",
    badgePosition: "-bottom-2 -right-2",
    rotate: "-rotate-6"
  },
  { 
    src: "/images/1000199334.jpg", 
    alt: "Hardware and Robotics Workshop",
    className: "left-[-1%] top-[45%] h-24 w-24 md:h-32 md:w-32",
    badge: "⚡ 4IR Tech",
    badgePosition: "-top-2 -left-2",
    rotate: "rotate-3"
  },
  { 
    src: "/images/1000199336.jpg", 
    alt: "Student Developer Hackathon",
    className: "left-[14%] bottom-[2%] h-28 w-28 md:h-40 md:w-40",
    badge: "💻 Code & Ship",
    badgePosition: "-bottom-3 left-2",
    rotate: "-rotate-3"
  },
  { 
    src: "/images/1000199339.jpg", 
    alt: "Collaborative Learning & Mentorship",
    className: "right-[8%] top-[2%] h-32 w-32 md:h-44 md:w-44",
    badge: "🚀 Innovate",
    badgePosition: "-top-2 right-2",
    rotate: "rotate-6"
  },
  { 
    src: "/images/1000199340.jpg", 
    alt: "Building Future Tech Solutions",
    className: "right-[1%] bottom-[8%] h-20 w-20 md:h-28 md:w-28",
    badge: "🌐 Cloud & Infra",
    badgePosition: "-bottom-2 -right-2",
    rotate: "-rotate-6"
  },
];

export function AboutCollage() {
  return (
    <section id="who" className="relative overflow-hidden px-6 py-24 md:px-12 md:py-32">
      <div className="relative mx-auto min-h-[460px] max-w-[1280px]">
        
        {/* Floating Collage Bubbles with Tech Badges */}
        {COLLAGE.map((item, idx) => (
          <div
            key={item.src}
            className={`absolute z-10 transition-all duration-500 hover:z-20 hover:scale-110 ${item.className} ${item.rotate}`}
          >
            {/* Image Container */}
            <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-cream shadow-lg ring-1 ring-line">
              <Image 
                src={item.src} 
                alt={item.alt} 
                fill 
                className="object-cover transition-transform duration-500 hover:scale-105" 
              />
            </div>

            {/* Micro Tech Pill Badge */}
            {item.badge && (
              <span className={`absolute ${item.badgePosition} z-30 whitespace-nowrap rounded-full border border-line bg-white/95 px-2.5 py-1 text-[10px] font-bold text-ink shadow-md backdrop-blur-sm md:text-xs`}>
                {item.badge}
              </span>
            )}
          </div>
        ))}

        {/* Center Content Box */}
        <RevealOnScroll className="relative z-[2] mx-auto max-w-[620px] py-16 text-center">
          
          {/* Top Pill Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-cream-2/80 px-4 py-1.5 text-xs font-semibold text-ink-2 shadow-sm backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-sky animate-pulse" />
            Chiromo Campus • 4IR & Innovation Hub
          </div>

          {/* Main Headline */}
          <h2 className="font-display text-[clamp(32px,4.5vw,52px)] font-extrabold leading-[1.1] tracking-tight text-ink">
            Where Chiromo&apos;s brightest minds{" "}
            <span className="relative inline-block text-sky">
              build the future.
            </span>
          </h2>

          {/* Descriptive Body Copy */}
          <p className="mx-auto mt-6 max-w-[480px] text-base leading-relaxed text-ink-2">
            <strong className="font-semibold text-ink">{SITE_CONFIG.name}</strong> is a vibrant community of innovators, thinkers, and builders. We empower students with practical skills in emerging technologies, artificial intelligence, software engineering, and the 4IR.
          </p>

        </RevealOnScroll>
      </div>
    </section>
  );
}