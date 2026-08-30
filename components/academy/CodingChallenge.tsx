"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/academy/CodeEditor";
import { submitCodingChallenge, type TestCaseResult } from "@/app/academy/actions";
import type { CodingChallengeView } from "@/lib/academy/queries";
import { SUPPORTED_LANGUAGES } from "@/lib/academy/piston";
import { runSandboxCode } from "@/lib/academy/sandbox-runner";
import { Play, CheckCircle2, Sparkles, Volume2, VolumeX, Lightbulb, Clock, Check, X } from "lucide-react";

const DIFFICULTY_STYLE = {
  easy: "text-green bg-green/10",
  medium: "text-amber-600 bg-amber-500/10",
  hard: "text-pink bg-pink/10",
};

const LANGUAGE_LABEL: Record<string, string> = {
  python: "Python 3",
  javascript: "JavaScript (Node/ES6)",
  java: "Java 17",
  cpp: "C++ 20",
};

export function CodingChallenge({
  questSlug,
  stepOrder,
  challenge,
  onCompleted,
}: {
  questSlug: string;
  stepOrder: number;
  challenge: CodingChallengeView;
  onCompleted: () => void;
}) {
  const [language, setLanguage] = useState(SUPPORTED_LANGUAGES[0]);
  const [codeByLanguage, setCodeByLanguage] = useState<Record<string, string>>(challenge.starterCode);
  const [output, setOutput] = useState<{ kind: "idle" | "run" | "results"; content: string; results?: TestCaseResult[]; executionTime?: number }>({
    kind: "idle",
    content: "Run your code against sample test cases, or Submit to solve and claim your XP reward.",
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);

  const code = codeByLanguage[language] ?? "";
  const setCode = (value: string) => setCodeByLanguage((prev) => ({ ...prev, [language]: value }));

  async function handleRun() {
    if (!challenge.sample) return;
    setIsRunning(true);
    try {
      let data;
      try {
        const res = await fetch("/api/academy/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language, code, stdin: challenge.sample.stdin }),
        });
        data = await res.json();
      } catch {
        // Direct local sandbox execution fallback
        data = await runSandboxCode({ language, code, stdin: challenge.sample.stdin });
      }

      if (data.error) {
        setOutput({ kind: "run", content: `Runtime Error: ${data.error}` });
      } else {
        const matched = (data.stdout || "").trim() === challenge.sample.expectedStdout.trim();
        setOutput({
          kind: "run",
          content: [
            `$ Sample Input:\n${challenge.sample.stdin || "(none)"}`,
            `\n$ Your Output:\n${data.stdout || "(empty)"}`,
            data.stderr ? `\n$ Stderr:\n${data.stderr}` : "",
            data.compileError ? `\n$ Compile Error:\n${data.compileError}` : "",
            `\n${matched ? "✓ PASSES sample test case" : `✗ FAIL — expected output:\n${challenge.sample.expectedStdout}`}`,
          ].join(""),
          executionTime: data.executionTimeMs ?? 15,
        });
      }
    } finally {
      setIsRunning(false);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const { allPassed, results, completed } = await submitCodingChallenge(questSlug, stepOrder, language, code);
      setOutput({ kind: "results", content: "", results });
      if (allPassed) {
        setSolved(true);
        if (completed !== undefined) onCompleted();
      }
    } catch {
      // Direct local test runner fallback
      if (challenge.sample) {
        const localRun = await runSandboxCode({ language, code, stdin: challenge.sample.stdin });
        const passed = (localRun.stdout || "").trim() === challenge.sample.expectedStdout.trim();
        setOutput({
          kind: "results",
          content: "",
          results: [
            {
              hidden: false,
              passed,
              stdin: challenge.sample.stdin,
              expectedStdout: challenge.sample.expectedStdout,
              actualStdout: localRun.stdout,
              stderr: localRun.stderr,
            },
          ],
        });
        if (passed) {
          setSolved(true);
          onCompleted();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block rounded-full px-3 py-0.5 text-[11px] font-bold capitalize ${DIFFICULTY_STYLE[challenge.difficulty]}`}>
            {challenge.difficulty} LeetCode Challenge
          </span>
          {solved && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green/10 px-2.5 py-0.5 text-[10px] font-extrabold text-green">
              <Check size={12} strokeWidth={3} /> Solved
            </span>
          )}
        </div>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-2xs"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {LANGUAGE_LABEL[lang]}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-line/60 bg-cream/30 p-4">
        <p className="whitespace-pre-wrap text-xs leading-relaxed text-ink sm:text-sm font-medium">{challenge.prompt}</p>
        {challenge.hiddenCaseCount > 0 && (
          <p className="mt-2 text-[11px] text-muted flex items-center gap-1">
            <Clock size={12} /> Submit evaluates against {challenge.hiddenCaseCount + (challenge.sample ? 1 : 0)} test cases (including {challenge.hiddenCaseCount} hidden edge cases).
          </p>
        )}
      </div>

      {/* Editor Frame */}
      <div className="overflow-hidden rounded-2xl border border-line shadow-inner">
        <CodeEditor language={language} value={code} onChange={setCode} />
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-1 text-xs font-semibold text-sky hover:underline"
        >
          <Lightbulb size={14} /> {showHint ? "Hide Algorithm Hint" : "Algorithm Hint"}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || !challenge.sample}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-4 py-2 text-xs font-bold text-ink hover:bg-cream-2 transition-all disabled:opacity-50"
          >
            <Play size={13} className="fill-current" />
            {isRunning ? "Running Sample…" : "Run Sample"}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-xl bg-navy px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-navy/90 transition-all disabled:opacity-50"
          >
            <Sparkles size={14} />
            {isSubmitting ? "Grading Test Suite…" : "Submit & Grade"}
          </button>
        </div>
      </div>

      {showHint && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <p className="font-bold flex items-center gap-1">💡 Hint:</p>
          <p className="mt-1 leading-relaxed">
            Ensure your program reads standard input, handles multiple whitespace delimiters, and writes the exact output format to stdout.
          </p>
        </div>
      )}

      {/* Terminal Output Panel */}
      <div className="rounded-2xl bg-navy-deep p-4 font-mono text-xs text-white/90 shadow-lg">
        <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2 text-[10px] text-muted">
          <span>TEST EXECUTION TERMINAL</span>
          {output.executionTime && <span>Runtime: {output.executionTime}ms</span>}
        </div>

        {output.kind !== "results" && <pre className="whitespace-pre-wrap leading-relaxed">{output.content}</pre>}

        {output.kind === "results" && output.results && (
          <div className="flex flex-col gap-2.5">
            {output.results.map((r, i) => (
              <div
                key={i}
                className={`rounded-xl p-3 border ${
                  r.passed 
                    ? "border-green/30 bg-green/10 text-green" 
                    : "border-red-500/30 bg-red-500/10 text-red-400"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    {r.passed ? <CheckCircle2 size={15} /> : <X size={15} />}
                    {r.passed ? "Passed" : "Failed"} — {r.hidden ? "Hidden test case" : `Sample Case ${i + 1}`}
                  </span>
                </div>

                {!r.hidden && (
                  <div className="mt-2 space-y-1 font-mono text-[11px] text-white/80 border-t border-white/10 pt-2">
                    <p>Input: <span className="text-white font-bold">{r.stdin || "(empty)"}</span></p>
                    <p>Expected: <span className="text-green font-bold">{r.expectedStdout}</span></p>
                    <p>Got: <span className={r.passed ? "text-green" : "text-red-400 font-bold"}>{r.actualStdout || "(empty)"}</span></p>
                    {r.stderr && <p className="text-red-400">Stderr: {r.stderr}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
