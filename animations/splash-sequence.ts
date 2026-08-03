import { gsap } from "../lib/motion/register-gsap";
import { EASE } from "../animations/easings";

const BOOT_LINES = [
  "Initializing…",
  "Loading innovation…",
  "Connecting developers…",
  "Connecting designers…",
  "Connecting researchers…",
  "Connecting builders…",
];

export interface SplashRefs {
  termEl: HTMLElement;
  outerCircle: SVGCircleElement;
  innerCircle: SVGCircleElement;
  letters: SVGElement;
  orbitDots: HTMLElement[];
  glowRing: HTMLElement;
  markEl: HTMLElement;
  rootEl: HTMLElement;
}

/**
 * Types out each boot line, then hands off to a GSAP timeline that draws
 * the logo (outer ring -> inner ring -> letters -> orbit -> glow) and
 * fades the whole splash out. Returns a cleanup function.
 */
export function runSplashSequence(refs: SplashRefs, onComplete: () => void): () => void {
  let cancelled = false;
  const orbitTweens: gsap.core.Tween[] = [];

  function typeLine(index: number) {
    if (cancelled) return;
    if (index >= BOOT_LINES.length) {
      drawLogo();
      return;
    }
    const text = BOOT_LINES[index];
    let charIndex = 0;
    refs.termEl.textContent = "";
    const interval = setInterval(() => {
      if (cancelled) return clearInterval(interval);
      refs.termEl.textContent = text.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex >= text.length) {
        clearInterval(interval);
        setTimeout(() => typeLine(index + 1), 180);
      }
    }, 18);
  }

  function drawLogo() {
    const outerLength = refs.outerCircle.getTotalLength();
    const innerLength = refs.innerCircle.getTotalLength();
    gsap.set(refs.outerCircle, { strokeDasharray: outerLength, strokeDashoffset: outerLength });
    gsap.set(refs.innerCircle, { strokeDasharray: innerLength, strokeDashoffset: innerLength });

    const tl = gsap.timeline({ onComplete: finish });
    tl.to(refs.outerCircle, { strokeDashoffset: 0, duration: 0.9, ease: EASE.standard })
      .to(refs.innerCircle, { strokeDashoffset: 0, duration: 0.7, ease: EASE.standard }, "-=0.4")
      .to(refs.letters, { opacity: 1, duration: 0.4 }, "-=0.2")
      .to(refs.orbitDots, { opacity: 1, duration: 0.3 }, "-=0.2")
      .to(refs.glowRing, { opacity: 1, boxShadow: "0 0 60px 10px rgba(139,124,246,0.45)", duration: 0.6 }, "-=0.3")
      .to(refs.markEl, { scale: 1.15, duration: 0.5, ease: EASE.entrance }, "-=0.3")
      .to(refs.termEl, { opacity: 0, duration: 0.3 }, "-=0.5")
      .to(refs.rootEl, { opacity: 0, duration: 0.6, ease: EASE.standard }, "+=0.15");

    refs.orbitDots.forEach((dot, i) => {
      orbitTweens.push(
        gsap.to(dot, {
          rotation: i % 2 === 0 ? 360 : -360,
          duration: 3 + i,
          repeat: -1,
          ease: EASE.linear,
          transformOrigin: "0px -55px",
          delay: i * 0.3,
        }),
      );
    });
  }

  function finish() {
    if (!cancelled) onComplete();
  }

  typeLine(0);

  return () => {
    cancelled = true;
    orbitTweens.forEach((t) => t.kill());
    gsap.killTweensOf([refs.outerCircle, refs.innerCircle, refs.letters, refs.glowRing, refs.markEl, refs.rootEl]);
  };
}
