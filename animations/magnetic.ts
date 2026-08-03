import { gsap } from "../lib/motion/register-gsap";
import { EASE } from "../animations/easings";

/**
 * Attaches the magnetic pull effect to an element and returns a cleanup
 * function. This is the raw behavior; hooks/use-magnetic.ts and
 * components/animations/MagneticButton.tsx are the two consumption
 * points (a hook for existing elements, a wrapper component for new ones).
 */
export function attachMagnetic(el: HTMLElement, strength = 0.3): () => void {
  function onMove(e: MouseEvent) {
    const r = el.getBoundingClientRect();
    const relX = e.clientX - r.left - r.width / 2;
    const relY = e.clientY - r.top - r.height / 2;
    gsap.to(el, { x: relX * strength, y: relY * (strength + 0.05), duration: 0.3, ease: EASE.standard });
  }
  function onLeave() {
    gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: EASE.elastic });
  }

  el.addEventListener("mousemove", onMove);
  el.addEventListener("mouseleave", onLeave);
  return () => {
    el.removeEventListener("mousemove", onMove);
    el.removeEventListener("mouseleave", onLeave);
  };
}
