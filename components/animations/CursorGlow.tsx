"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from ".././../hooks/use-reduced-motion";

/** Mount once, near the root layout. Renders nothing meaningful when reduced motion is on. */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    let gx = 0,
      gy = 0,
      tx = 0,
      ty = 0;
    let raf = 0;

    function onMove(e: MouseEvent) {
      tx = e.clientX;
      ty = e.clientY;
      if (el) el.style.opacity = "0.7";
    }
    function onLeave() {
      if (el) el.style.opacity = "0";
    }
    function loop() {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      if (el) el.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[2] h-[420px] w-[420px] rounded-full opacity-0 mix-blend-screen blur-[10px] transition-opacity duration-300"
      style={{ background: "radial-gradient(circle, rgba(139,124,246,0.45) 0%, transparent 70%)" }}
    />
  );
}
