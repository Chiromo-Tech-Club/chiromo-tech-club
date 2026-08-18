import { and, desc, eq, sql } from "drizzle-orm";

// ── ADJUST THESE TWO IMPORTS to match your project's actual paths ──────────
import { getDb } from "@/lib/drizzle/client";
import {
  academyQuests,
  academyQuestSteps,
  academyUserProgress,
  academyBadges,
  academyUserBadges,
  academyCodingChallenges,
  academySqlChallenges,
} from "@/lib/drizzle/schema.academy";
import { members } from "@/lib/drizzle/schema";
// ─────────────────────────────────────────────────────────────────────────

export type QuestTrailItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  topic: string;
  order: number;
  pointsReward: number;
  iconKey: string;
  status: "locked" | "available" | "in_progress" | "completed";
};

/**
 * Everything the /academy home page needs: the ordered quest trail (with
 * each quest's status for this member) plus a running points total.
 *
 * Unlock rule: quest N is "available" once quest N-1 is completed (or it's
 * the first quest). This is computed here rather than stored, so reordering
 * quests doesn't require a data migration.
 */
export async function getAcademyHomeData(memberId: string) {
  const db = getDb();   
  const quests = await db
    .select()
    .from(academyQuests)
    .where(and(eq(academyQuests.isPublished, true), sql`${academyQuests.deletedAt} is null`))
    .orderBy(academyQuests.order);

  const progressRows = await db
    .select()
    .from(academyUserProgress)
    .where(eq(academyUserProgress.memberId, memberId));

  const progressByQuestId = new Map(progressRows.map((p) => [p.questId, p]));

  let previousCompleted = true;
  const trail: QuestTrailItem[] = quests.map((quest) => {
    const progress = progressByQuestId.get(quest.id);
    let status: QuestTrailItem["status"] = "locked";

    if (progress?.status === "completed") {
      status = "completed";
    } else if (progress?.status === "in_progress") {
      status = "in_progress";
    } else if (previousCompleted) {
      status = "available";
    }

    previousCompleted = status === "completed";

    return {
      id: quest.id,
      slug: quest.slug,
      title: quest.title,
      description: quest.description,
      topic: quest.topic,
      order: quest.order,
      pointsReward: quest.pointsReward,
      iconKey: quest.iconKey,
      status,
    };
  });

  const totalPoints = progressRows.reduce((sum, p) => sum + p.pointsEarned, 0);
  const questsCompleted = progressRows.filter((p) => p.status === "completed").length;

  const badgeRows = await db
    .select({ badge: academyBadges })
    .from(academyUserBadges)
    .innerJoin(academyBadges, eq(academyUserBadges.badgeId, academyBadges.id))
    .where(eq(academyUserBadges.memberId, memberId));

  return {
    trail,
    totalPoints,
    questsCompleted,
    totalQuests: quests.length,
    badges: badgeRows.map((b) => b.badge),
  };
}

export type CodingChallengeView = {
  prompt: string;
  difficulty: "easy" | "medium" | "hard";
  starterCode: Record<string, string>;
  /** Only the non-hidden sample case's expectedStdout is sent to the client. */
  sample: { stdin: string; expectedStdout: string } | null;
  hiddenCaseCount: number;
};

export type SqlChallengeView = {
  prompt: string;
  difficulty: "easy" | "medium" | "hard";
  setupSql: string;
  /**
   * Sent to the client because grading happens in-browser (sql.js has no
   * server to check against). Fine for a club learning tool — if this ever
   * needs to be tamper-proof, move grading into a server action instead.
   */
  expectedResult: Record<string, unknown>[];
};

/** Quest detail + its steps (with any coding/SQL challenge payload) + this member's progress, for /academy/[slug]. */
export async function getQuestDetail(slug: string, memberId: string) {
  const db = getDb();
  const [quest] = await db.select().from(academyQuests).where(eq(academyQuests.slug, slug)).limit(1);
  if (!quest) return null;

  const stepRows = await db
    .select()
    .from(academyQuestSteps)
    .where(and(eq(academyQuestSteps.questId, quest.id), sql`${academyQuestSteps.deletedAt} is null`))
    .orderBy(academyQuestSteps.order);

  const stepIds = stepRows.map((s) => s.id);

  const [codingRows, sqlRows] = stepIds.length
    ? await Promise.all([
        db.select().from(academyCodingChallenges).where(sql`${academyCodingChallenges.stepId} in ${stepIds}`),
        db.select().from(academySqlChallenges).where(sql`${academySqlChallenges.stepId} in ${stepIds}`),
      ])
    : [[], []];

  const codingByStepId = new Map(codingRows.map((c) => [c.stepId, c]));
  const sqlByStepId = new Map(sqlRows.map((s) => [s.stepId, s]));

  const steps = stepRows.map((step) => {
    const coding = codingByStepId.get(step.id);
    const sqlChallenge = sqlByStepId.get(step.id);

    let codingChallenge: CodingChallengeView | null = null;
    if (coding) {
      const testCases = JSON.parse(coding.testCases) as { stdin: string; expectedStdout: string; hidden: boolean }[];
      const sample = testCases.find((t) => !t.hidden) ?? null;
      codingChallenge = {
        prompt: coding.prompt,
        difficulty: coding.difficulty,
        starterCode: JSON.parse(coding.starterCode),
        sample: sample ? { stdin: sample.stdin, expectedStdout: sample.expectedStdout } : null,
        hiddenCaseCount: testCases.filter((t) => t.hidden).length,
      };
    }

    return {
      ...step,
      codingChallenge,
      sqlChallenge: sqlChallenge
        ? ({
            prompt: sqlChallenge.prompt,
            difficulty: sqlChallenge.difficulty,
            setupSql: sqlChallenge.setupSql,
            expectedResult: JSON.parse(sqlChallenge.expectedResult),
          } as SqlChallengeView)
        : null,
    };
  });

  const [progress] = await db
    .select()
    .from(academyUserProgress)
    .where(and(eq(academyUserProgress.memberId, memberId), eq(academyUserProgress.questId, quest.id)))
    .limit(1);

  return { quest, steps, progress: progress ?? null };
}

export type LeaderboardRow = {
  memberId: string;
  fullName: string;
  avatarUrl: string | null;
  totalPoints: number;
  questsCompleted: number;
};

/** Top N members by total academy points, for /academy/leaderboard. */
export async function getLeaderboard(limit = 20): Promise<LeaderboardRow[]> {
  const db = getDb();
  const rows = await db
    .select({
      memberId: members.id,
      fullName: members.fullName,
      avatarUrl: members.avatarUrl,
      totalPoints: sql<number>`coalesce(sum(${academyUserProgress.pointsEarned}), 0)`.as("total_points"),
      questsCompleted: sql<number>`count(*) filter (where ${academyUserProgress.status} = 'completed')`.as(
        "quests_completed",
      ),
    })
    .from(members)
    .innerJoin(academyUserProgress, eq(academyUserProgress.memberId, members.id))
    .groupBy(members.id)
    .orderBy(desc(sql`total_points`))
    .limit(limit);

  return rows;
}