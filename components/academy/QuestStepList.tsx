"use client";

import { useState } from "react";
import { completeQuestStep } from "@/app/academy/actions";
import { CodingChallenge } from "@/components/academy/CodingChallenge";
import { SqlChallenge } from "@/components/academy/SqlChallenge";
import type { CodingChallengeView, SqlChallengeView } from "@/lib/academy/queries";

type Step = {
  id: string;
  order: number;
  title: string;
  type: "lesson" | "challenge" | "quiz" | "coding_challenge" | "sql_challenge";
  content: string;
  challengePrompt: string | null;
  codingChallenge: CodingChallengeView | null;
  sqlChallenge: SqlChallengeView | null;
};

const TYPE_LABEL: Record<Step["type"], string> = {
  lesson: "lesson",
  challenge: "challenge",
  quiz: "quiz",
  coding_challenge: "code",
  sql_challenge: "sql",
};

export function QuestStepList({
  questSlug,
  steps,
  currentStepOrder,
}: {
  questSlug: string;
  steps: Step[];
  currentStepOrder: number;
}) {
  const [completedUpTo, setCompletedUpTo] = useState(currentStepOrder);
  const [openStep, setOpenStep] = useState<number>(
    steps.find((s) => s.order > currentStepOrder)?.order ?? steps[0]?.order ?? 0,
  );
  const [isPending, setIsPending] = useState(false);

  function advanceAfter(order: number) {
    setCompletedUpTo(order);
    const next = steps.find((s) => s.order === order + 1);
    setOpenStep(next ? next.order : order);
  }

  async function handleGenericComplete(step: Step) {
    setIsPending(true);
    try {
      await completeQuestStep(questSlug, step.order);
      advanceAfter(step.order);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step) => {
        const isDone = step.order <= completedUpTo;
        const isLocked = step.order > completedUpTo + 1;
        const isOpen = openStep === step.order && !isLocked;

        return (
          <li key={step.id} className="overflow-hidden rounded-card bg-surface shadow-custom-sm">
            <button
              type="button"
              disabled={isLocked}
              onClick={() => setOpenStep(isOpen ? -1 : step.order)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-label-xs font-medium ${
                  isDone ? "bg-navy text-white" : "bg-cream-2 text-muted"
                }`}
              >
                {isDone ? "✓" : step.order + 1}
              </span>
              <span className="flex-1 font-display text-label-md text-text">{step.title}</span>
              <span className="text-label-xs uppercase tracking-wide text-muted">{TYPE_LABEL[step.type]}</span>
            </button>

            {isOpen && (
              <div className="border-t border-line px-5 py-4">
                {step.type === "coding_challenge" && step.codingChallenge ? (
                  <CodingChallenge
                    questSlug={questSlug}
                    stepOrder={step.order}
                    challenge={step.codingChallenge}
                    onCompleted={() => advanceAfter(step.order)}
                  />
                ) : step.type === "sql_challenge" && step.sqlChallenge ? (
                  <SqlChallenge
                    questSlug={questSlug}
                    stepOrder={step.order}
                    challenge={step.sqlChallenge}
                    onCompleted={() => advanceAfter(step.order)}
                  />
                ) : (
                  <>
                    <div className="whitespace-pre-wrap text-paragraph-sm text-text-2">{step.content}</div>
                    {step.challengePrompt && (
                      <p className="mt-4 rounded-card-sm bg-cream-2 p-3 text-paragraph-sm text-text">{step.challengePrompt}</p>
                    )}
                    {!isDone && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleGenericComplete(step)}
                        className="mt-4 rounded-pill bg-sky px-5 py-2 text-label-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {isPending ? "Saving…" : step.order === steps[steps.length - 1]?.order ? "Complete quest" : "Mark step complete"}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}