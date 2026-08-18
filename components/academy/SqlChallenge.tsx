"use client";

import { useEffect, useRef, useState } from "react";
import type { Database } from "sql.js";
import { createPracticeDb, runQuery, resultsMatch, type QueryResult } from "@/lib/academy/sqlite";
import { completeSqlChallenge } from "@/app/academy/actions";
import type { SqlChallengeView } from "@/lib/academy/queries";

const DIFFICULTY_STYLE = {
  easy: "text-success-base bg-success-lighter",
  medium: "text-warning-base bg-warning-lighter",
  hard: "text-error-base bg-error-lighter",
};

export function SqlChallenge({
  questSlug,
  stepOrder,
  challenge,
  onCompleted,
}: {
  questSlug: string;
  stepOrder: number;
  challenge: SqlChallengeView;
  onCompleted: () => void;
}) {
  const dbRef = useRef<Database | null>(null);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("SELECT *\nFROM ");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<"idle" | "pass" | "fail">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    createPracticeDb(challenge.setupSql).then((db) => {
      if (cancelled) return db.close();
      dbRef.current = db;
      setReady(true);
    });
    return () => {
      cancelled = true;
      dbRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge.setupSql]);

  function handleRun() {
    if (!dbRef.current) return;
    setError(null);
    setVerdict("idle");
    try {
      setResult(runQuery(dbRef.current, query));
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Query failed");
    }
  }

  async function handleSubmit() {
    if (!dbRef.current) return;
    setIsSubmitting(true);
    try {
      const res = runQuery(dbRef.current, query);
      setResult(res);
      setError(null);
      const passed = resultsMatch(res.rows, challenge.expectedResult);
      setVerdict(passed ? "pass" : "fail");
      if (passed) {
        await completeSqlChallenge(questSlug, stepOrder);
        onCompleted();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query failed");
      setVerdict("fail");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <span className={`inline-block w-fit rounded-pill px-3 py-1 text-label-xs font-medium capitalize ${DIFFICULTY_STYLE[challenge.difficulty]}`}>
        {challenge.difficulty}
      </span>
      <p className="whitespace-pre-wrap text-paragraph-sm text-text-2">{challenge.prompt}</p>

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        spellCheck={false}
        rows={5}
        className="w-full rounded-card-sm border border-line-strong bg-navy-deep p-3 font-mono text-label-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-sky"
      />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleRun}
          disabled={!ready}
          className="rounded-pill border border-line-strong px-5 py-2 text-label-sm text-text transition-colors hover:bg-cream-2 disabled:opacity-50"
        >
          {ready ? "Run query" : "Loading database…"}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!ready || isSubmitting}
          className="rounded-pill bg-sky px-5 py-2 text-label-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Checking…" : "Submit"}
        </button>
      </div>

      {verdict !== "idle" && (
        <p className={`text-label-sm font-medium ${verdict === "pass" ? "text-success-base" : "text-error-base"}`}>
          {verdict === "pass" ? "✓ Correct — result matches." : "✗ Not quite — result doesn't match expected output."}
        </p>
      )}

      {error && <p className="text-label-sm text-error-base">{error}</p>}

      {result && (
        <div className="overflow-x-auto rounded-card-sm border border-line">
          <table className="w-full text-left text-label-xs">
            <thead className="bg-cream-2">
              <tr>
                {result.columns.map((col) => (
                  <th key={col} className="px-3 py-2 font-medium text-text">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i} className="border-t border-line">
                  {result.columns.map((col) => (
                    <td key={col} className="px-3 py-2 font-mono text-text-2">
                      {String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
              {result.rows.length === 0 && (
                <tr>
                  <td className="px-3 py-2 text-muted" colSpan={result.columns.length || 1}>
                    No rows returned.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}