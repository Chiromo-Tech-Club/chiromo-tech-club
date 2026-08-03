"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from ".././../lib/motion/register-gsap";
import { useReducedMotion } from ".././../hooks/use-reduced-motion";
import { cn } from ".././../lib/utils/cn";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export function TiltCard({ children, className, maxTilt = 6 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    function onMove(e: MouseEvent) {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, {
        rotateY: px * maxTilt,
        rotateX: -py * maxTilt,
        duration: 0.4,
        ease: "power2.out",
        transformPerspective: 600,
      });
    }
    function onLeave() {
      gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power2.out" });
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced, maxTilt]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
