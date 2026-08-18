"use client";

import Image from "next/image";
import { Bot, Zap, Code2, Rocket, Cloud, Sparkles } from "lucide-react";
import { SITE_CONFIG } from "../config/site";
import { RevealOnScroll } from "../components/animations/RevealOnScroll";

interface CollageItem {
  src: string;
  alt: string;
  className: string;
  badge?: string;
  icon: React.ElementType;
  badgePosition: string;
  rotate: string;
}

const COLLAGE: CollageItem[] = [
  { 
    src: "/images/1000199333.jpg", 
    alt: "AI Research & Development",
    // Mobile: scaled down to 48px, pushed outwards. Desktop: 112px
    className: "top-[2%] left-[2%] h-12 w-12 sm:h-20 sm:w-20 md:top-[6%] md:left-[5%] md:h-28 md:w-28",
    badge: "AI & ML",
    icon: Bot,
    badgePosition: "-bottom-2 -right-2",
    rotate: "-rotate-6"
  },
  { 
    src: "/images/1000199334.jpg", 
    alt: "Hardware and Robotics Workshop",
    className: "top-[42%] -left-[1%] h-14 w-14 sm:h-24 sm:w-24 md:top-[45%] md:left-[-1%] md:h-32 md:w-32",
    badge: "4IR Tech",
    icon: Zap,
    badgePosition: "-top-2 -left-2",
    rotate: "rotate-3"
  },
  { 
    src: "/images/1000199336.jpg", 
    alt: "Student Developer Hackathon",
    className: "bottom-[2%] left-[3%] h-16 w-16 sm:h-28 sm:w-28 md:bottom-[2%] md:left-[12%] md:h-36 md:w-36",
    badge: "Code & Ship",
    icon: Code2,
    badgePosition: "-bottom-2 left-1",
    rotate: "-rotate-3"
  },
  { 
    src: "/images/1000199339.jpg", 
    alt: "Collaborative Learning & Mentorship",
    className: "top-[2%] right-[2%] h-16 w-16 sm:h-28 sm:w-28 md:top-[2%] md:right-[6%] md:h-40 md:w-40",
    badge: "Innovate",
    icon: Rocket,
    badgePosition: "-top-2 right-1",
    rotate: "rotate-6"
  },
  { 
    src: "/images/1000199340.jpg", 
    alt: "Building Future Tech Solutions",
    className: "bottom-[2%] right-[2%] h-14 w-14 sm:h-22 sm:w-22 md:bottom-[6%] md:right-[1%] md:h-28 md:w-28",
    badge: "Cloud & Infra",
    icon: Cloud,
    badgePosition: "-bottom-2 -right-2",
    rotate: "-rotate-6"
  },
];

export function AboutCollage() {
  return (
    <section id="who" className="relative overflow-hidden px-4 py-20 sm:px-8 md:px-12 md:py-32">
      <div className="relative mx-auto min-h-[440px] max-w-[1280px] sm:min-h-[480px]">
        
        {/* Floating Collage Bubbles with Lucide Tech Badges */}
        {COLLAGE.map((item) => {
          const BadgeIcon = item.icon;
          return (
            <div
              key={item.src}
              className={`absolute z-10 transition-all duration-500 hover:z-30 hover:scale-110 ${item.className} ${item.rotate}`}
            >
              {/* Image Bubble Container */}
              <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white bg-surface shadow-md ring-1 ring-line/50 transition-shadow hover:shadow-xl sm:border-4">
                <Image 
                  src={item.src} 
                  alt={item.alt} 
                  fill 
                  className="object-cover transition-transform duration-500 hover:scale-105" 
                  sizes="(max-width: 768px) 80px, 180px"
                />
              </div>

              {/* Clean Micro Tech Pill Badge with Real Icon */}
              {item.badge && (
                <div className={`absolute ${item.badgePosition} z-30 hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-line/60 bg-surface/95 px-2.5 py-1 text-[10px] font-bold text-ink shadow-md backdrop-blur-md sm:flex md:text-xs`}>
                  <BadgeIcon size={13} className="text-green" />
                  <span>{item.badge}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Center Content Box - Elevated z-index (z-20) to stay fully clear of images on mobile */}
        <RevealOnScroll className="relative z-20 mx-auto max-w-[640px] rounded-3xl px-4 py-10 text-center sm:py-16">
          
          {/* Top Pill Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line/60 bg-surface/90 px-4 py-1.5 text-xs font-semibold text-ink shadow-sm backdrop-blur-md">
            <Sparkles size={14} className="text-green" />
            <span>Chiromo Campus • 4IR & Innovation Hub</span>
          </div>

          {/* Main Headline */}
          <h2 className="font-display text-[clamp(28px,4.2vw,50px)] font-extrabold leading-[1.12] tracking-tight text-ink">
            Where Chiromo&apos;s brightest minds{" "}
            <span className="relative inline-block text-green">
              build the future.
            </span>
          </h2>

          {/* Descriptive Body Copy */}
          <p className="mx-auto mt-5 max-w-[500px] text-sm leading-relaxed text-ink-2 sm:text-base">
            <strong className="font-semibold text-ink">{SITE_CONFIG.name}</strong> is a vibrant community of innovators, thinkers, and builders. We empower students with practical skills in emerging technologies, artificial intelligence, software engineering, and the 4IR.
          </p>

        </RevealOnScroll>
      </div>
    </section>
  );
}