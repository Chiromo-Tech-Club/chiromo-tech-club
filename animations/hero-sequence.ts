import { gsap } from "../lib/motion/register-gsap";
import { EASE } from "./easings";

const WORDS = ["Think.", "Build.", "Lead.", "Innovate."];

export interface HeroSequenceRefs {
  sequenceEl: HTMLElement;
  finalEl: HTMLElement;
  subEl: HTMLElement;
  ctaEl: HTMLElement;
  floatEls: HTMLElement[];
  scrollCueEl: HTMLElement;
}

/** Runs the word-cycle -> final headline -> subhead/CTA/float-object entrance. Returns the GSAP timeline. */
export function runHeroSequence(refs: HeroSequenceRefs) {
  const tl = gsap.timeline({ delay: 0.2 });

  WORDS.forEach((word, i) => {
    const span = document.createElement("span");
    span.textContent = word;
    span.style.display = "inline-block";
    tl.set(refs.sequenceEl, { innerHTML: "" })
      .add(() => refs.sequenceEl.appendChild(span))
      .fromTo(
        span,
        { opacity: 0, y: 40, rotateX: 60, filter: "blur(10px)" },
        { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)", duration: 0.55, ease: EASE.overshoot },
      )
      .to(span, { opacity: 0, y: -30, filter: "blur(8px)", duration: 0.35, ease: EASE.exit }, i === WORDS.length - 1 ? undefined : "+=0.35");
  });

  tl.set(refs.sequenceEl, { display: "none" })
    .fromTo(
      refs.finalEl,
      { opacity: 0, y: 30, scale: 0.94, filter: "blur(10px)" },
      { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.8, ease: EASE.standard },
    )
    .fromTo(refs.subEl, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.35")
    .fromTo(refs.ctaEl, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
    .fromTo(refs.floatEls, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, "-=0.5")
    .fromTo(refs.scrollCueEl, { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.3");

  return tl;
}

/** Reduced-motion fallback: skip straight to the settled state, no animation. */
export function setHeroSequenceFinalState(refs: HeroSequenceRefs) {
  refs.sequenceEl.style.display = "none";
  [refs.finalEl, refs.subEl, refs.ctaEl, refs.scrollCueEl, ...refs.floatEls].forEach((el) => {
    el.style.opacity = "1";
  });
}