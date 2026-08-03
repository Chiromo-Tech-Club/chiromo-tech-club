"use client";

import { useEffect, useRef, useState } from "react";
import { runSplashSequence, type SplashRefs } from ".././../animations/splash-sequence";
import { useSplashStore } from ".././../store/splash-store";
import { useReducedMotion } from ".././../hooks/use-reduced-motion";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const hasPlayed = useSplashStore((s) => s.hasPlayed);
  const markPlayed = useSplashStore((s) => s.markPlayed);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(!hasPlayed);

  const rootRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<HTMLSpanElement>(null);
  const outerRef = useRef<SVGCircleElement>(null);
  const innerRef = useRef<SVGCircleElement>(null);
  const lettersRef = useRef<SVGTextElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const dot1 = useRef<HTMLDivElement>(null);
  const dot2 = useRef<HTMLDivElement>(null);
  const dot3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasPlayed) {
      onDone();
      return;
    }
    document.body.classList.add("overflow-hidden", "h-screen");

    function finish() {
      markPlayed();
      document.body.classList.remove("overflow-hidden", "h-screen");
      setVisible(false);
      onDone();
    }

    if (reduced) {
      finish();
      return;
    }

    const refs: SplashRefs = {
      termEl: termRef.current!,
      outerCircle: outerRef.current!,
      innerCircle: innerRef.current!,
      letters: lettersRef.current!,
      orbitDots: [dot1.current!, dot2.current!, dot3.current!],
      glowRing: glowRef.current!,
      markEl: markRef.current!,
      rootEl: rootRef.current!,
    };
    const cleanup = runSplashSequence(refs, finish);
    return () => {
      cleanup();
      document.body.classList.remove("overflow-hidden", "h-screen");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div ref={rootRef} className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-bg">
      <div ref={markRef} className="relative h-[120px] w-[120px]">
        <div ref={glowRef} className="absolute -inset-10 rounded-full opacity-0" />
        <svg viewBox="0 0 120 120" className="h-full w-full overflow-visible">
          <circle ref={outerRef} cx="60" cy="60" r="52" fill="none" stroke="var(--color-text)" strokeWidth="1.4" strokeLinecap="round" />
          <circle ref={innerRef} cx="60" cy="60" r="34" fill="none" stroke="var(--color-text)" strokeWidth="1.4" strokeLinecap="round" />
          <text
            ref={lettersRef}
            x="60"
            y="67"
            textAnchor="middle"
            fontFamily="Space Grotesk"
            fontSize="22"
            fontWeight={600}
            fill="var(--color-text)"
            opacity={0}
          >
            CTC
          </text>
        </svg>
        <div ref={dot1} className="absolute left-1/2 top-1/2 h-[5px] w-[5px] rounded-full bg-accent opacity-0 shadow-[0_0_10px_rgba(139,124,246,0.45)]" />
        <div ref={dot2} className="absolute left-1/2 top-1/2 h-[5px] w-[5px] rounded-full bg-accent opacity-0 shadow-[0_0_10px_rgba(139,124,246,0.45)]" />
        <div ref={dot3} className="absolute left-1/2 top-1/2 h-[5px] w-[5px] rounded-full bg-accent opacity-0 shadow-[0_0_10px_rgba(139,124,246,0.45)]" />
      </div>
      <div className="mt-9 h-5 font-mono text-[13px] text-text-3">
        <span ref={termRef} />
        <span className="ml-1 inline-block h-[13px] w-[7px] animate-pulse bg-accent align-[-2px]" />
      </div>
    </div>
  );
}
