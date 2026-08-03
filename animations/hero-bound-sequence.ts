import { gsap } from "@/lib/motion/register-gsap";
import { EASE } from "@/animations/easings";

export interface HeroBandRefs {
  badgeEl: HTMLElement;
  headlineWords: HTMLElement[];
  ctaEl: HTMLElement;
  doodleWrapperEl: HTMLElement;
  doodlePaths: SVGPathElement[];
  ringGroup: HTMLElement;
  underlinePath: SVGPathElement;
  cardEls: HTMLElement[];
  /** The "." after "here" — plays the ball/arrow/drop through the sequence. */
  fullStopEl: HTMLElement;
  /** The "d" in "builders" — the sponge that consumes and releases the drop. */
  dLetterEl: HTMLElement;
}

const UNDERLINE_REST_D = "M0 15 Q 50 25 100 10";
const UNDERLINE_PULL_D = "M0 15 Q 50 45 100 10";
const UNDERLINE_OVERSHOOT_D = "M0 15 Q 50 -5 100 10";

/** One-shot entrance choreography, run on mount. Returns a cleanup for the idle loops it starts. */
export function runHeroBandEntrance(refs: HeroBandRefs): () => void {
  const idleTweens: gsap.core.Tween[] = [];

  // ---- Prep starting states ----
  gsap.set(refs.badgeEl, { opacity: 0, y: -14, scale: 0.9 });
  gsap.set(refs.headlineWords, { opacity: 0, y: 34 });
  gsap.set(refs.ctaEl, { opacity: 0, y: 18, scale: 0.92 });
  gsap.set(refs.ringGroup, { opacity: 0, scale: 0.6 });
  gsap.set(refs.cardEls, { opacity: 0, y: 28 });
  gsap.set(refs.fullStopEl, { display: "inline-block", x: -85, y: -10, opacity: 0, transformOrigin: "50% 50%" });
  gsap.set(refs.dLetterEl, { display: "inline-block", transformOrigin: "bottom center" });

  refs.doodlePaths.forEach((path) => {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
  });

  const underlineLen = refs.underlinePath.getTotalLength();
  gsap.set(refs.underlinePath, { strokeDasharray: underlineLen, strokeDashoffset: underlineLen, attr: { d: UNDERLINE_REST_D } });

  const tl = gsap.timeline({ defaults: { ease: EASE.standard } });

  // ---- 1. Standard entrance ----
  tl.to(refs.badgeEl, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: EASE.overshoot })
    .to(refs.headlineWords, { opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: EASE.overshoot }, "-=0.2")
    .to(refs.ctaEl, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: EASE.overshoot }, "-=0.3")
    .to(refs.doodlePaths, { strokeDashoffset: 0, duration: 0.9, stagger: 0.15, ease: EASE.entrance }, "-=0.5")
    .to(refs.ringGroup, { opacity: 1, scale: 1, duration: 0.6, ease: EASE.overshoot }, "-=0.6")
    .to(refs.cardEls, { opacity: 1, y: 0, duration: 0.55, stagger: 0.09, ease: EASE.standard }, "-=0.35");

  // ---- 2. The bow-and-arrow / sponge / drip sequence ----

  // Phase A — underline draws itself in while the ball rolls into the dip
  tl.addLabel("drawAndRoll", "-=0.2")
    .to(refs.underlinePath, { strokeDashoffset: 0, duration: 0.5, ease: "sine.inOut" }, "drawAndRoll")
    .to(refs.fullStopEl, { opacity: 1, duration: 0.1 }, "drawAndRoll")
    .to(refs.fullStopEl, { x: -45, y: 12, rotation: 360, duration: 0.5, ease: "sine.in" }, "drawAndRoll");

  // Phase B — bowstring pulls back (underline dips, ball drops with it), then snaps + shoots
  tl.addLabel("bowPull")
    .to(refs.underlinePath, { attr: { d: UNDERLINE_PULL_D }, duration: 0.3, ease: "power2.inOut" }, "bowPull")
    .to(refs.fullStopEl, { y: 22, duration: 0.3, ease: "power2.inOut" }, "bowPull")
    .addLabel("shoot")
    .to(refs.underlinePath, { attr: { d: UNDERLINE_OVERSHOOT_D }, duration: 0.12, ease: "power2.out" }, "shoot")
    .to(refs.underlinePath, { attr: { d: UNDERLINE_REST_D }, duration: 0.5, ease: "elastic.out(1.2, 0.3)" }, "shoot+=0.12")
    .to(refs.fullStopEl, { x: 15, y: -80, rotation: 720, duration: 0.32, ease: "power1.out" }, "shoot");

  // Phase C — the "d" in builders acts as a sponge, absorbing the impact
  tl.addLabel("sponge", "shoot+=0.3")
    .to(refs.fullStopEl, { scale: 0, opacity: 0, duration: 0.1 }, "sponge")
    .to(refs.dLetterEl, { scaleX: 1.25, scaleY: 0.8, duration: 0.15, ease: "power1.out" }, "sponge")
    .to(refs.dLetterEl, { scaleX: 1.1, scaleY: 1.1, duration: 0.2, ease: "power1.inOut" }, "sponge+=0.15");

  // Phase D — the sponge wrings out a drop, which forms and falls
  tl.addLabel("dripForm", "+=0.2")
    .set(refs.fullStopEl, { x: 15, y: -70, scaleX: 0.4, scaleY: 0, rotation: 0 })
    .to(refs.dLetterEl, { scaleX: 0.9, scaleY: 1.15, duration: 0.2, ease: "power2.in" }, "dripForm")
    .to(refs.fullStopEl, { opacity: 1, scaleY: 1.2, duration: 0.3, ease: "power1.in" }, "dripForm")
    .addLabel("dripFall")
    .to(refs.dLetterEl, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" }, "dripFall")
    .to(refs.fullStopEl, { y: 0, duration: 0.35, ease: "power2.in" }, "dripFall");

  // Phase E — the drop splats and re-forms back into a resting full stop
  tl.addLabel("splat")
    .to(refs.fullStopEl, { scaleX: 1.4, scaleY: 0.6, duration: 0.1, ease: "power1.out" }, "splat")
    .to(refs.fullStopEl, { x: 0, y: 0, scale: 1, rotation: 360, duration: 0.7, ease: "back.out(1.2)" }, "splat+=0.1");

  // ---- Idle loops — start once the entrance settles, run forever until cleanup ----
  tl.eventCallback("onComplete", () => {
    idleTweens.push(
      gsap.to(refs.ringGroup, { scale: 1.06, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" }),
    );
    idleTweens.push(
      gsap.to(refs.doodleWrapperEl, { y: -8, rotate: 3, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" }),
    );
  });

  return () => {
    tl.kill();
    idleTweens.forEach((t) => t.kill());
  };
}

/** Reduced-motion fallback: settle everything to its final state instantly, no animation. */
export function setHeroBandFinalState(refs: HeroBandRefs) {
  gsap.set([refs.badgeEl, ...refs.headlineWords, refs.ctaEl, refs.ringGroup, ...refs.cardEls], {
    opacity: 1,
    y: 0,
    scale: 1,
  });
  gsap.set(refs.underlinePath, { strokeDashoffset: 0, attr: { d: UNDERLINE_REST_D } });
  refs.doodlePaths.forEach((p) => gsap.set(p, { strokeDashoffset: 0 }));
  gsap.set([refs.fullStopEl, refs.dLetterEl], { x: 0, y: 0, rotation: 0, scale: 1, scaleX: 1, scaleY: 1, opacity: 1 });
}