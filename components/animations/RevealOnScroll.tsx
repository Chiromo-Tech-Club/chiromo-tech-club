"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { revealOnScroll, type RevealOptions } from ".././../animations/reveal";
import { useReducedMotion } from ".././../hooks/use-reduced-motion";
import { cn } from ".././../lib/utils/cn";

interface RevealOnScrollProps extends RevealOptions {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function RevealOnScroll({ children, className, style, ...options }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!ref.current || reduced) return;
    revealOnScroll(ref.current, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <div ref={ref} className={cn(reduced && "opacity-100", className)} style={style}>
      {children}
    </div>
  );
}
