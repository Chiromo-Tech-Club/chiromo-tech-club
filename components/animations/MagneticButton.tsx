"use client";

import { cloneElement, isValidElement, type ReactElement } from "react";
import { useMagnetic } from ".././../hooks/use-magnetic";

interface MagneticButtonProps {
  children: ReactElement<{ ref?: React.Ref<HTMLElement>; className?: string }>;
  strength?: number;
}

/** Wraps any single element (typically a Button or Link) with the magnetic hover pull. */
export function MagneticButton({ children, strength = 0.3 }: MagneticButtonProps) {
  const ref = useMagnetic<HTMLElement>(strength);

  if (!isValidElement(children)) return children;
  return cloneElement(children, { ref });
}
