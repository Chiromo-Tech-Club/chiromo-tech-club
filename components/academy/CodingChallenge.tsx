"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/academy/CodeEditor";
import { submitCodingChallenge, type TestCaseResult } from "@/app/academy/actions";
import type { CodingChallengeView } from "@/lib/academy/queries";
import { SUPPORTED_LANGUAGES } from "@/lib/academy/piston";

const DIFFICULTY_STYLE = {
  easy: "text-success-base bg-success-lighter",
  medium: "text-warning-base bg-warning-lighter",
  hard: "text-error-base bg-error-lighter",
};

const LANGUAGE_LABEL: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  java: "Java",
  cpp: "C++",
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
  const [output, setOutput] = useState<{ kind: "idle" | "run" | "results"; content: string; results?: TestCaseResult[] }>({
    kind: "idle",
    content: "Run your code against the sample input, or Submit to grade it against all test cases.",
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const code = codeByLanguage[language] ?? "";
  const setCode = (value: string) => setCodeByLanguage((prev) => ({ ...prev, [language]: value }));

  async function handleRun() {
    if (!challenge.sample) return;
    setIsRunning(true);
    try {
      const res = await fetch("/api/academy/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, stdin: challenge.sample.stdin }),
      });
      const data = await res.json();
      if (data.error) {
        setOutput({ kind: "run", content: `Error: ${data.error}` });
      } else {
        const matched = data.stdout.trim() === challenge.sample.expectedStdout.trim();
        setOutput({
          kind: "run",
          content: [
            `$ input:\n${challenge.sample.stdin || "(none)"}`,
            `\n$ your output:\n${data.stdout || "(empty)"}`,
            data.stderr ? `\n$ stderr:\n${data.stderr}` : "",
            data.compileError ? `\n$ compile error:\n${data.compileError}` : "",
            `\n${matched ? "✓ matches expected output" : `✗ expected:\n${challenge.sample.expectedStdout}`}`,
          ].join(""),
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
      if (allPassed && completed !== undefined) onCompleted();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className={`inline-block rounded-pill px-3 py-1 text-label-xs font-medium capitalize ${DIFFICULTY_STYLE[challenge.difficulty]}`}>
          {challenge.difficulty}
        </span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-pill border border-line-strong bg-surface px-3 py-1.5 text-label-xs text-text"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {LANGUAGE_LABEL[lang]}
            </option>
          ))}
        </select>
      </div>

      <p className="whitespace-pre-wrap text-paragraph-sm text-text-2">{challenge.prompt}</p>
      {challenge.hiddenCaseCount > 0 && (
        <p className="text-label-xs text-muted">
          Submit runs {challenge.hiddenCaseCount + (challenge.sample ? 1 : 0)} test case
          {challenge.hiddenCaseCount + (challenge.sample ? 1 : 0) === 1 ? "" : "s"}, including {challenge.hiddenCaseCount} hidden
          one{challenge.hiddenCaseCount === 1 ? "" : "s"}.
        </p>
      )}

      <CodeEditor language={language} value={code} onChange={setCode} />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleRun}
          disabled={isRunning || !challenge.sample}
          className="rounded-pill border border-line-strong px-5 py-2 text-label-sm text-text transition-colors hover:bg-cream-2 disabled:opacity-50"
        >
          {isRunning ? "Running…" : "Run"}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-pill bg-sky px-5 py-2 text-label-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Grading…" : "Submit"}
        </button>
      </div>

      {/* terminal-style output panel */}
      <div className="rounded-card-sm bg-navy-deep p-4 font-mono text-label-xs text-white/90">
        {output.kind !== "results" && <pre className="whitespace-pre-wrap">{output.content}</pre>}
        {output.kind === "results" && output.results && (
          <div className="flex flex-col gap-3">
            {output.results.map((r, i) => (
              <div key={i} className={`rounded-card-sm p-3 ${r.passed ? "bg-success-base/10" : "bg-error-base/10"}`}>
                <p className={r.passed ? "text-success-base" : "text-error-base"}>
                  {r.passed ? "✓ Passed" : "✗ Failed"} — {r.hidden ? "hidden test" : `test case ${i + 1}`}
                </p>
                {!r.hidden && (
                  <div className="mt-1 whitespace-pre-wrap text-white/70">
                    input: {r.stdin || "(none)"}
                    {"\n"}expected: {r.expectedStdout}
                    {"\n"}got: {r.actualStdout}
                    {r.stderr && `\nstderr: ${r.stderr}`}
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