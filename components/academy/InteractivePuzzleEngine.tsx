"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Play, 
  CheckCircle2, 
  HelpCircle, 
  RefreshCw, 
  Lightbulb, 
  Flame, 
  Check, 
  AlertTriangle,
  Award,
  ChevronRight,
  Volume2,
  VolumeX
} from "lucide-react";
import { runSandboxCode } from "@/lib/academy/sandbox-runner";

// Synthesized audio feedback using browser Web Audio API
function playChime(success = true) {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (success) {
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.1); // E3
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // Audio context may be restricted before user gesture
  }
}

export interface PuzzleDefinition {
  id: string;
  type: "bug_hunter" | "code_trace" | "parsons_reorder" | "logic_riddle";
  title: string;
  story: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  initialCode?: string;
  solution?: string;
  options?: { id: string; label: string; isCorrect: boolean }[];
  scrambledLines?: { id: string; text: string }[];
  correctOrder?: string[];
  hint: string;
}

export function InteractivePuzzleEngine({
  puzzle,
  onSolved,
}: {
  puzzle?: PuzzleDefinition;
  onSolved?: (points: number) => void;
}) {
  const activePuzzle: PuzzleDefinition = puzzle ?? {
    id: "demo_bug_hunter",
    type: "bug_hunter",
    title: "Bug Hunter: The Rogue Off-By-One Index",
    story: "A student wrote a function to calculate the running sum of an array in Nairobi traffic data, but it keeps skipping elements or returning the wrong cumulative sum. Find and fix the bug in the loop condition!",
    difficulty: "easy",
    points: 100,
    initialCode: `function runningSum(nums) {\n  let result = [];\n  let sum = 0;\n  // BUG IS HERE: condition is i < nums.length - 1\n  for (let i = 0; i < nums.length - 1; i++) {\n    sum += nums[i];\n    result.push(sum);\n  }\n  return result;\n}\n\n// Test with [1, 2, 3, 4] -> should be [1, 3, 6, 10]\nconsole.log(JSON.stringify(runningSum([1, 2, 3, 4])));`,
    solution: `[1, 3, 6, 10]`,
    hint: "Look at the loop upper bound: `i < nums.length - 1` stops 1 element too early!",
  };

  const [code, setCode] = useState(activePuzzle.initialCode ?? "");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [reorderedLines, setReorderedLines] = useState(activePuzzle.scrambledLines ?? []);
  
  const [showHint, setShowHint] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [status, setStatus] = useState<"idle" | "running" | "success" | "fail">("idle");
  const [outputLog, setOutputLog] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleRunPuzzle = async () => {
    setStatus("running");
    setOutputLog("");
    setFeedback("");

    if (activePuzzle.type === "bug_hunter") {
      const res = await runSandboxCode({ language: "javascript", code });
      setOutputLog(res.stdout || res.stderr);

      if (res.stdout.includes("[1,3,6,10]") || res.stdout.includes("[1, 2, 3, 4]") || res.stdout.replace(/\s/g, "").includes("[1,3,6,10]")) {
        setStatus("success");
        setFeedback("🎉 Excellent! You fixed the loop boundary bug!");
        if (soundEnabled) playChime(true);
        onSolved?.(activePuzzle.points);
      } else {
        setStatus("fail");
        setFeedback("❌ Not quite. Expected output: [1, 3, 6, 10]. Got: " + (res.stdout || "Error"));
        if (soundEnabled) playChime(false);
      }
    } else if (activePuzzle.type === "code_trace") {
      const chosen = activePuzzle.options?.find((o) => o.id === selectedOption);
      if (chosen?.isCorrect) {
        setStatus("success");
        setFeedback("🎉 Correct deduction! You traced the program flow flawlessly.");
        if (soundEnabled) playChime(true);
        onSolved?.(activePuzzle.points);
      } else {
        setStatus("fail");
        setFeedback("❌ Incorrect. Trace the loop counter step by step.");
        if (soundEnabled) playChime(false);
      }
    } else if (activePuzzle.type === "parsons_reorder") {
      const currentIds = reorderedLines.map((l) => l.id);
      const isCorrect = JSON.stringify(currentIds) === JSON.stringify(activePuzzle.correctOrder);
      if (isCorrect) {
        setStatus("success");
        setFeedback("🎉 Logic puzzle solved! The code blocks are in perfect execution order.");
        if (soundEnabled) playChime(true);
        onSolved?.(activePuzzle.points);
      } else {
        setStatus("fail");
        setFeedback("❌ The code sequence has logical errors. Try repositioning the variable declarations.");
        if (soundEnabled) playChime(false);
      }
    }
  };

  const moveLine = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= reorderedLines.length) return;
    const copy = [...reorderedLines];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setReorderedLines(copy);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line/80 bg-surface/95 p-6 shadow-xl backdrop-blur-md sm:p-8">
      {/* Top Banner & Gamification Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-sky/15 px-3 py-0.5 text-xs font-bold text-sky">
              <Sparkles size={13} /> Interactive Puzzle
            </span>
            <span className="inline-block rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 capitalize">
              {activePuzzle.difficulty}
            </span>
          </div>
          <h3 className="mt-2 font-display text-lg font-bold text-ink sm:text-xl">{activePuzzle.title}</h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="rounded-full border border-line p-2 text-muted hover:text-ink transition-colors"
            title={soundEnabled ? "Mute audio effects" : "Enable sound"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <span className="flex items-center gap-1 rounded-full bg-green/10 px-3 py-1 font-mono text-xs font-bold text-green">
            <Award size={14} /> +{activePuzzle.points} XP
          </span>
        </div>
      </div>

      {/* Story / Problem Intro */}
      <div className="mt-4 rounded-2xl bg-cream/40 p-4">
        <p className="text-xs leading-relaxed text-ink-2 sm:text-sm">{activePuzzle.story}</p>
      </div>

      {/* Interactive Arena based on Puzzle Type */}
      <div className="mt-5 space-y-4">
        {/* Type 1: Bug Hunter / Interactive Code Fixer */}
        {activePuzzle.type === "bug_hunter" && (
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted">Interactive Code Sandbox (Edit to fix):</span>
              <button
                type="button"
                onClick={() => setCode(activePuzzle.initialCode ?? "")}
                className="flex items-center gap-1 text-[11px] font-semibold text-sky hover:underline"
              >
                <RefreshCw size={12} /> Reset Code
              </button>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={9}
              className="w-full rounded-2xl border border-line bg-navy-deep p-4 font-mono text-xs text-white outline-none focus:border-sky/80 focus:ring-1 focus:ring-sky leading-relaxed"
              spellCheck={false}
            />
          </div>
        )}

        {/* Type 2: Code Trace Multiple Choice */}
        {activePuzzle.type === "code_trace" && activePuzzle.options && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted">Select the output produced by this logic:</span>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {activePuzzle.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedOption(opt.id)}
                  className={`flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${
                    selectedOption === opt.id
                      ? "border-sky bg-sky/10 ring-2 ring-sky text-ink font-bold"
                      : "border-line bg-surface hover:bg-cream-2 text-ink-2"
                  }`}
                >
                  <span className="font-mono text-xs">{opt.label}</span>
                  {selectedOption === opt.id && <Check size={14} className="text-sky" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Type 3: Parsons Code Block Reordering */}
        {activePuzzle.type === "parsons_reorder" && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted">Reorder blocks into correct executable sequence:</span>
            <div className="space-y-2">
              {reorderedLines.map((line, idx) => (
                <div
                  key={line.id}
                  className="flex items-center justify-between rounded-2xl border border-line bg-surface p-3 text-xs font-mono"
                >
                  <span className="text-ink">{line.text}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveLine(idx, "up")}
                      className="rounded-lg border border-line px-2 py-1 text-[10px] font-bold text-ink hover:bg-cream-2 disabled:opacity-30"
                    >
                      ▲ Up
                    </button>
                    <button
                      type="button"
                      disabled={idx === reorderedLines.length - 1}
                      onClick={() => moveLine(idx, "down")}
                      className="rounded-lg border border-line px-2 py-1 text-[10px] font-bold text-ink hover:bg-cream-2 disabled:opacity-30"
                    >
                      ▼ Down
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terminal / Feedback Output */}
        {outputLog && (
          <div className="rounded-2xl bg-navy-deep p-4 font-mono text-xs text-white/90">
            <span className="text-[10px] uppercase font-bold text-muted">Terminal Output:</span>
            <pre className="mt-1 whitespace-pre-wrap">{outputLog}</pre>
          </div>
        )}

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`flex items-center gap-2 rounded-2xl p-4 text-xs font-semibold ${
              status === "success"
                ? "border border-green/30 bg-green/10 text-green"
                : "border border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {status === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{feedback}</span>
          </div>
        )}

        {/* Action Buttons & Hints */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 text-xs font-semibold text-sky hover:underline"
          >
            <Lightbulb size={14} />
            {showHint ? "Hide Hint" : "Need a Hint?"}
          </button>

          <button
            type="button"
            disabled={status === "running"}
            onClick={handleRunPuzzle}
            className="flex items-center gap-2 rounded-2xl bg-navy px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-navy/90 active:scale-95 disabled:opacity-50"
          >
            <Play size={14} className="fill-current" />
            {status === "running" ? "Testing Solution…" : "Test Solution & Claim XP"}
          </button>
        </div>

        {/* Hint Box */}
        {showHint && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 animate-in fade-in duration-200">
            <p className="flex items-center gap-1.5 font-bold">
              <HelpCircle size={14} /> Clue:
            </p>
            <p className="mt-1">{activePuzzle.hint}</p>
          </div>
        )}
      </div>
    </div>
  );
}
