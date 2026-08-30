"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ── ADJUST to match your project ────────────────────────────────────────
import { getDb } from "@/lib/drizzle/client";
import { academyQuests, academyQuestSteps, academyUserProgress, academyCodingChallenges } from "@/lib/drizzle/schema.academy";
import { getAuthUserId } from "@/lib/supabase/auth-helpers"; // resolves the logged-in member's row id
// ─────────────────────────────────────────────────────────────────────────
import { executeCode } from "@/lib/academy/piston";
import { runSandboxCode } from "@/lib/academy/sandbox-runner";

/** Shared by every step type: records progress and, on the final step, completes the quest and awards points. */
async function applyStepCompletion(memberId: string, questSlug: string, stepOrder: number) {
  const db = getDb();
  const [quest] = await db.select().from(academyQuests).where(eq(academyQuests.slug, questSlug)).limit(1);
  if (!quest) throw new Error("Quest not found");

  const steps = await db
    .select()
    .from(academyQuestSteps)
    .where(eq(academyQuestSteps.questId, quest.id))
    .orderBy(academyQuestSteps.order);

  const isFinalStep = steps.length > 0 && stepOrder >= steps[steps.length - 1].order;

  const [existing] = await db
    .select()
    .from(academyUserProgress)
    .where(and(eq(academyUserProgress.memberId, memberId), eq(academyUserProgress.questId, quest.id)))
    .limit(1);

  if (existing) {
    await db
      .update(academyUserProgress)
      .set({
        currentStepOrder: Math.max(existing.currentStepOrder, stepOrder),
        status: isFinalStep ? "completed" : "in_progress",
        pointsEarned: isFinalStep ? quest.pointsReward : existing.pointsEarned,
        completedAt: isFinalStep ? new Date() : existing.completedAt,
        updatedAt: new Date(),
      })
      .where(eq(academyUserProgress.id, existing.id));
  } else {
    await db.insert(academyUserProgress).values({
      memberId,
      questId: quest.id,
      status: isFinalStep ? "completed" : "in_progress",
      currentStepOrder: stepOrder,
      pointsEarned: isFinalStep ? quest.pointsReward : 0,
      startedAt: new Date(),
      completedAt: isFinalStep ? new Date() : null,
    });
  }

  revalidatePath("/academy");
  revalidatePath(`/academy/${questSlug}`);

  return { completed: isFinalStep };
}

/** For "lesson" steps — no grading, just mark as read. */
export async function completeQuestStep(questSlug: string, stepOrder: number) {
  const memberId = await getAuthUserId();
  if (!memberId) throw new Error("Not signed in");
  return applyStepCompletion(memberId, questSlug, stepOrder);
}

export type TestCaseResult = {
  hidden: boolean;
  passed: boolean;
  stdin: string;
  expectedStdout: string | null; // null for hidden cases that failed — don't leak the answer
  actualStdout: string;
  stderr: string;
};

/**
 * Runs every test case (visible + hidden) server-side so hidden cases never
 * reach the client, then completes the step only if all cases pass.
 */
export async function submitCodingChallenge(
  questSlug: string,
  stepOrder: number,
  language: string,
  code: string,
): Promise<{ allPassed: boolean; results: TestCaseResult[]; completed?: boolean }> {
  const memberId = await getAuthUserId();
  if (!memberId) throw new Error("Not signed in");

  const [quest] = await getDb().select().from(academyQuests).where(eq(academyQuests.slug, questSlug)).limit(1);
  if (!quest) throw new Error("Quest not found");

  const [step] = await getDb()
    .select()
    .from(academyQuestSteps)
    .where(and(eq(academyQuestSteps.questId, quest.id), eq(academyQuestSteps.order, stepOrder)))
    .limit(1);
  if (!step) throw new Error("Step not found");

  const [challenge] = await getDb()
    .select()
    .from(academyCodingChallenges)
    .where(eq(academyCodingChallenges.stepId, step.id))
    .limit(1);
  if (!challenge) throw new Error("This step has no coding challenge attached");

  const testCases = JSON.parse(challenge.testCases) as { stdin: string; expectedStdout: string; hidden: boolean }[];

  const results: TestCaseResult[] = [];
  for (const tc of testCases) {
    let run;
    try {
      run = await executeCode({ language, code, stdin: tc.stdin, timeLimitMs: challenge.timeLimitMs });
    } catch {
      // Fallback to local sandbox runner when remote API is unavailable
      run = await runSandboxCode({ language, code, stdin: tc.stdin, timeLimitMs: challenge.timeLimitMs });
    }
    const actual = run.stdout.trim();
    const expected = tc.expectedStdout.trim();
    const passed = !run.compileError && !run.timedOut && actual === expected;

    results.push({
      hidden: tc.hidden,
      passed,
      stdin: tc.hidden ? "" : tc.stdin,
      expectedStdout: tc.hidden && !passed ? null : tc.expectedStdout,
      actualStdout: tc.hidden ? (passed ? "" : "Hidden test failed") : run.stdout,
      stderr: run.compileError ?? run.stderr,
    });

    // Stop early on a compile error — same error will repeat for every remaining case.
    if (run.compileError) break;
  }

  const allPassed = results.length === testCases.length && results.every((r) => r.passed);

  if (allPassed) {
    const { completed } = await applyStepCompletion(memberId, questSlug, stepOrder);
    return { allPassed, results, completed };
  }

  return { allPassed, results };
}

/**
 * SQL challenges are graded client-side (sql.js runs entirely in the
 * browser, there's no server to check). This action just trusts the
 * client's verdict and records completion — same trust model as a client
 * reporting "I clicked Run and it passed" for a lesson quiz.
 */
export async function completeSqlChallenge(questSlug: string, stepOrder: number) {
  const memberId = await getAuthUserId();
  if (!memberId) throw new Error("Not signed in");
  return applyStepCompletion(memberId, questSlug, stepOrder);
}