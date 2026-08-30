"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Terminal,
  Cpu,
  Rocket,
  ShieldCheck,
  Award,
  Layers,
  ChevronRight,
  Code2,
  Flame,
  Zap,
} from "lucide-react";
import { RevealOnScroll } from "../components/animations/RevealOnScroll";
import { Button } from "../components/alignui/button";
import { ROUTES } from "../constants/routes";
import { cn } from "../lib/utils/cn";

interface JourneyStep {
  id: string;
  stepNumber: string;
  stepTag: string;
  objective: string;
  headline: string;
  summary: string;
  deliverables: string[];
  ctaLabel: string;
  ctaHref: string;
  accentBg: string;
  accentGlow: string;
  badgeColor: string;
  stats: { label: string; value: string }[];
  previewType: "identity" | "academy" | "hardware" | "ship" | "career";
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: "onboard",
    stepNumber: "01",
    stepTag: "Genesis & Identity",
    objective: "Streamlined Student Onboarding & Track Allocation",
    headline: "Claim your digital identity in Chiromo's tech vanguard.",
    summary:
      "No friction, no confusion. Progressive registration links your student profile to one of four specialized tracks (AI & ML, Software Engineering, 4IR Robotics, or Cloud Infrastructure), issuing your verified digital membership badge instantly.",
    deliverables: [
      "Official Verified Student Tech ID",
      "Specialized Track Community Enrollment",
      "Direct Senior Mentor & Peer Matching",
    ],
    ctaLabel: "Register for Club",
    ctaHref: ROUTES.register,
    accentBg: "from-blue-600/20 via-indigo-900/40 to-slate-950",
    accentGlow: "bg-blue-500/15",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    stats: [
      { label: "Onboarding Time", value: "< 2 Mins" },
      { label: "Core Tracks", value: "4 Domains" },
      { label: "Verification", value: "Instant" },
    ],
    previewType: "identity",
  },
  {
    id: "academy",
    stepNumber: "02",
    stepTag: "Arena & Mastery",
    objective: "Zero-Slide Hands-on Gamified Sandbox Puzzles",
    headline: "Learn through live code execution and bug arenas.",
    summary:
      "Say goodbye to passive classroom slides. CTC Academy immerses you in interactive coding challenges, algorithmic debugging puzzles, and browser-sandboxed test suites with real-time feedback, earning XP and climbing the leaderboard.",
    deliverables: [
      "In-Browser Instant Sandbox Runner",
      "Track-Tailored Skill & Quest Tree",
      "Gamified Leaderboard & Milestone Badges",
    ],
    ctaLabel: "Explore Academy",
    ctaHref: ROUTES.academy,
    accentBg: "from-purple-600/20 via-indigo-950/50 to-slate-950",
    accentGlow: "bg-purple-500/15",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    stats: [
      { label: "Interactive Quests", value: "24+ Arenas" },
      { label: "Sandboxed Tests", value: "Realtime" },
      { label: "Reward System", value: "XP & Badges" },
    ],
    previewType: "academy",
  },
  {
    id: "hardware",
    stepNumber: "03",
    stepTag: "4IR & AI Labs",
    objective: "Bridging Embedded Hardware to Large Language Models",
    headline: "Hack the physical world with sensors, edge AI & silicon.",
    summary:
      "Physical computing meets modern machine learning. In our weekly 4IR lab workshops at Chiromo Campus, students solder sensors, flash microcontrollers with MicroPython, and deploy lightweight computer vision and PyTorch models to the edge.",
    deliverables: [
      "Microcontroller & Sensor Hardware Kits",
      "Computer Vision & Edge ML Pipelines",
      "Collaborative Lab Hack Sessions",
    ],
    ctaLabel: "View AI & 4IR Community",
    ctaHref: ROUTES.community("ai-and-research"),
    accentBg: "from-emerald-600/20 via-teal-950/50 to-slate-950",
    accentGlow: "bg-emerald-500/15",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    stats: [
      { label: "Lab Stations", value: "Chiromo Hub" },
      { label: "Tech Stack", value: "PyTorch & IoT" },
      { label: "Hardware Access", value: "Included" },
    ],
    previewType: "hardware",
  },
  {
    id: "ship",
    stepNumber: "04",
    stepTag: "Sprint & Launch",
    objective: "High-Velocity Sprints & Public Production Deployments",
    headline: "Ship real software that solves real African challenges.",
    summary:
      "Every learning cycle culminates in a high-tempo build sprint. Form multi-disciplinary teams of designers, full-stack engineers, and cloud architects to take ideas from raw Git commit to live production URLs with real users.",
    deliverables: [
      "Production Cloud Deployment on Vercel/AWS",
      "Open-Source GitHub Showcase Repos",
      "Campus Demo Day & Hackathon Submissions",
    ],
    ctaLabel: "Explore Shipped Projects",
    ctaHref: ROUTES.projects,
    accentBg: "from-rose-600/20 via-pink-950/50 to-slate-950",
    accentGlow: "bg-rose-500/15",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    stats: [
      { label: "Sprint Cycles", value: "Bi-Weekly" },
      { label: "Target", value: "Production Live" },
      { label: "Team Size", value: "3-5 Builders" },
    ],
    previewType: "ship",
  },
  {
    id: "career",
    stepNumber: "05",
    stepTag: "Ascent & Leadership",
    objective: "Executive Pedigree, Tech Grants & Industry Referrals",
    headline: "Graduate as an industry-tested engineering leader.",
    summary:
      "Elevate your career trajectory. High-performing members step into executive roles, receive project grant sponsorships from corporate partners, and unlock direct fast-tracked referrals for high-impact software engineering internships.",
    deliverables: [
      "Executive Board & Leadership Credentials",
      "Direct Hiring Partner & Sponsor Referrals",
      "Research & Innovation Grant Opportunities",
    ],
    ctaLabel: "Join as Member",
    ctaHref: ROUTES.join,
    accentBg: "from-amber-600/20 via-orange-950/50 to-slate-950",
    accentGlow: "bg-amber-500/15",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    stats: [
      { label: "Alumni Network", value: "100+ Builders" },
      { label: "Partners", value: "Industry Tier" },
      { label: "Leadership", value: "Recognized" },
    ],
    previewType: "career",
  },
];

export function AboutCollage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const activeStep = JOURNEY_STEPS[activeIdx];

  const handleNext = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % JOURNEY_STEPS.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIdx((prev) => (prev - 1 + JOURNEY_STEPS.length) % JOURNEY_STEPS.length);
  }, []);

  // Auto-advance carousel smoothly unless paused by user
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(handleNext, 7000);
    return () => clearInterval(interval);
  }, [isAutoPlay, handleNext]);

  return (
    <section
      id="who"
      className="relative overflow-hidden px-4 py-20 sm:px-6 md:px-12 md:py-28"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      <div className="mx-auto max-w-[1280px]">
        {/* Section Header */}
        <RevealOnScroll className="mx-auto max-w-[760px] text-center">
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-ink  backdrop-blur-md">
            {/* <Sparkles size={14} className="text-green" /> */}
            <span>The Chiromo Tech Club Blueprint • End-to-End Roadmap</span>
          </div>

          <h2 className="font-display text-[clamp(28px,4.5vw,52px)] font-extrabold leading-[1.12] tracking-tight text-ink">
            How we turn ambitious students into{" "}
            <span className="relative inline-block text-green">
              world-class builders.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-[620px] text-sm leading-relaxed text-ink-2 sm:text-base">
            Every step is engineered with a definitive core objective. Follow the 5-phase evolution from initial registration to production mastery and industry leadership.
          </p>
        </RevealOnScroll>

        {/* Step Selector Tab Navigation */}
        <div className="mt-12 flex items-center justify-center">
          <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-line/80 bg-surface/80 p-1.5 shadow-sm backdrop-blur-md sm:gap-3 sm:p-2">
            {JOURNEY_STEPS.map((step, idx) => {
              const isActive = idx === activeIdx;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setActiveIdx(idx);
                    setIsAutoPlay(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold transition-all sm:px-5 sm:text-sm",
                    isActive
                      ? "bg-ink text-surface shadow-md scale-105"
                      : "text-ink-2 hover:bg-cream-2 hover:text-ink"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black",
                      isActive ? "bg-green text-white" : "bg-line/70 text-ink-2"
                    )}
                  >
                    {step.stepNumber}
                  </span>
                  <span className="hidden sm:inline">{step.stepTag.split(" ")[0]}</span>
                  <span className="sm:hidden">{step.stepTag.split("&")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Interactive Stage Carousel Card */}
        <div className="relative mt-10 overflow-hidden rounded-[32px] border border-line/80 bg-navy-deep text-white shadow-2xl">
          {/* Subtle Dynamic Gradient Ambient Glow */}
          <div
            className={cn(
              "pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full blur-3xl transition-all duration-700",
              activeStep.accentGlow
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full blur-3xl transition-all duration-700",
              activeStep.accentGlow
            )}
          />

          <div className="relative z-10 grid grid-cols-1 items-stretch gap-10 p-6 sm:p-10 lg:grid-cols-[1.2fr_0.95fr] lg:p-14">
            {/* Left Column: Objective Details & Deliverables */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Step Metadata & Objective Pill */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Step {activeStep.stepNumber} • {activeStep.stepTag}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
                      activeStep.badgeColor
                    )}
                  >
                    <Zap size={13} className="shrink-0" />
                    <span>Objective: {activeStep.objective}</span>
                  </span>
                </div>

                {/* Main Step Headline */}
                <h3 className="mt-6 font-display text-[clamp(24px,3.4vw,40px)] font-extrabold leading-[1.18] text-white">
                  {activeStep.headline}
                </h3>

                {/* In-depth Narrative */}
                <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
                  {activeStep.summary}
                </p>

                {/* Key Deliverables List */}
                <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/50">
                    What You Achieve In This Phase
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-1">
                    {activeStep.deliverables.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green/20 text-green">
                          <CheckCircle2 size={16} />
                        </div>
                        <span className="text-sm font-semibold text-white/90">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions & Mini Metric Grid */}
              <div className="mt-10 flex flex-col gap-6 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  asChild
                  variant="primary"
                  className="rounded-full bg-green px-6 py-3.5 font-bold text-white shadow-lg transition-all hover:bg-green/90 active:scale-95"
                >
                  <Link href={activeStep.ctaHref} className="flex items-center gap-2">
                    <span>{activeStep.ctaLabel}</span>
                    <ArrowRight size={16} />
                  </Link>
                </Button>

                {/* Carousel Controls */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous step"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 active:scale-95"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <span className="font-mono text-xs font-bold text-white/60">
                    {activeStep.stepNumber} / 0{JOURNEY_STEPS.length}
                  </span>
                  <button
                    onClick={handleNext}
                    aria-label="Next step"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 active:scale-95"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Premium High-Craft Visual Artifact */}
            <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/15 bg-white/[0.04] p-6 backdrop-blur-xl shadow-inner sm:p-8">
              {/* Dynamic Interactive Visual Component depending on Step */}
              {activeStep.previewType === "identity" && (
                <div className="flex flex-col justify-between h-full space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-mono text-xs font-bold text-white/80">CTC-MEMBER-ID #2026</span>
                    </div>
                    <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 font-mono text-[11px] font-bold text-blue-300">
                      VERIFIED PASS
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-5 shadow-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">Chiromo Student Member</p>
                        <h4 className="mt-1 font-display text-lg font-extrabold text-white">Alex Kimani</h4>
                        <p className="text-xs text-white/70">BSc. Computer Science • Year 2</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/30 text-blue-300 border border-blue-500/30">
                        <ShieldCheck size={26} />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-white/10">
                      <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/90">AI Track</span>
                      <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/90">Chiromo Campus</span>
                      <span className="rounded-md bg-green/20 px-2 py-0.5 text-[10px] font-semibold text-green-300">Fee Paid: 500 KES</span>
                    </div>
                  </div>

                  <p className="text-xs italic text-white/60">
                    &ldquo;Registration took under two minutes. I got matched into the AI cohort and had my repository access setup the same day.&rdquo;
                  </p>
                </div>
              )}

              {activeStep.previewType === "academy" && (
                <div className="flex flex-col justify-between h-full space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <Terminal size={16} className="text-purple-400" />
                      <span className="font-mono text-xs font-bold text-white/80">arena_sandbox.py</span>
                    </div>
                    <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 font-mono text-[11px] font-bold text-purple-300">
                      TEST PASSED (+50 XP)
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 shadow-inner">
                    <p className="text-slate-500"># Interactive Bug Hunt Challenge</p>
                    <p className="text-purple-300">def optimize_neural_weights(gradient):</p>
                    <p className="pl-4 text-emerald-300">return torch.clamp(gradient * 0.01, -1, 1)</p>
                    <p className="mt-3 text-slate-400">$ python test_suite.py</p>
                    <p className="text-green-400">✓ 5 / 5 Unit tests passed in 42ms</p>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                    <div className="flex items-center gap-2">
                      <Flame size={18} className="text-amber-400" />
                      <span className="text-xs font-bold text-white">Daily Streak: 7 Days</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-purple-300">Level 4 Scholar</span>
                  </div>
                </div>
              )}

              {activeStep.previewType === "hardware" && (
                <div className="flex flex-col justify-between h-full space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <Cpu size={16} className="text-emerald-400" />
                      <span className="font-mono text-xs font-bold text-white/80">ESP32 • 4IR Lab Telemetry</span>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-300">
                      LIVE IOT NODE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                      <p className="text-[10px] font-bold uppercase text-white/50">Edge Inference</p>
                      <p className="mt-1 font-display text-base font-extrabold text-white">YOLO-v8 Nano</p>
                      <p className="text-[11px] text-emerald-400">32.4 FPS on ESP32</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                      <p className="text-[10px] font-bold uppercase text-white/50">Sensor Mesh</p>
                      <p className="mt-1 font-display text-base font-extrabold text-white">LoRa Gateway</p>
                      <p className="text-[11px] text-emerald-400">Chiromo Perimeter</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-semibold text-white/80">
                      Hands-on workshops every weekend at Chiromo Computer Labs. Work directly with microcontrollers, robotics frames, and cloud telemetry.
                    </p>
                  </div>
                </div>
              )}

              {activeStep.previewType === "ship" && (
                <div className="flex flex-col justify-between h-full space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <Rocket size={16} className="text-rose-400" />
                      <span className="font-mono text-xs font-bold text-white/80">Production Pipeline</span>
                    </div>
                    <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 font-mono text-[11px] font-bold text-rose-300">
                      DEPLOYED
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Commit</span>
                      <span className="text-rose-400">#4f92c10 [main]</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Live URL</span>
                      <span className="text-blue-400 underline">agriforecast.chiromotech.club</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Uptime</span>
                      <span className="text-green-400">99.98% (AWS af-south-1)</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/5 p-3 text-xs text-white/80">
                    <strong className="text-white">Sprint Metric:</strong> 100% of teams publish working production code with documentation and open-source licenses.
                  </div>
                </div>
              )}

              {activeStep.previewType === "career" && (
                <div className="flex flex-col justify-between h-full space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-amber-400" />
                      <span className="font-mono text-xs font-bold text-white/80">Executive & Career Tier</span>
                    </div>
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 font-mono text-[11px] font-bold text-amber-300">
                      HONOR ROLL
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                      <div>
                        <p className="text-xs font-bold text-white">Global Internship Placement</p>
                        <p className="text-[11px] text-white/60">Cloud & Fullstack Software Roles</p>
                      </div>
                      <span className="text-xs font-bold text-amber-400">Fast-Track</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                      <div>
                        <p className="text-xs font-bold text-white">Research & Grant Allocation</p>
                        <p className="text-[11px] text-white/60">4IR Innovation Fund</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">Active</span>
                    </div>
                  </div>

                  <p className="text-xs text-white/70 italic">
                    &ldquo;Leading the software engineering track directly helped me secure my engineering role before my final semester.&rdquo;
                  </p>
                </div>
              )}

              {/* Step Metrics Triad */}
              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
                {activeStep.stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="font-display text-sm font-extrabold text-white sm:text-base">
                      {stat.value}
                    </div>
                    <div className="text-[10px] font-semibold text-white/50">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
