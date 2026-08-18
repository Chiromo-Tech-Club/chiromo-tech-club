import { pgTable, pgEnum, uuid, text, integer, timestamp, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { members } from "./schema";

/**
 * Academy schema — the gamified learning platform, styled after Wavumbuzi's
 * "gameworld" concept: Quests (topics) → Steps (lessons/challenges) →
 * per-member Progress, plus Badges for milestones and a derived Leaderboard.
 *
 * Follows the same conventions as the rest of schema.ts:
 * - UUID primary keys, defaultRandom()
 * - createdAt/updatedAt on every table, deletedAt for soft deletes on
 *   content tables (quests, steps, badges) so history/analytics survive
 *   an accidental unpublish
 * - memberId FKs cascade on delete, same as the rest of the app
 */

export const questProgressStatusEnum = pgEnum("quest_progress_status", [
  "locked",
  "available",
  "in_progress",
  "completed",
]);

export const questStepTypeEnum = pgEnum("quest_step_type", [
  "lesson",
  "challenge",
  "quiz",
  "coding_challenge",
  "sql_challenge",
]);

export const challengeDifficultyEnum = pgEnum("challenge_difficulty", ["easy", "medium", "hard"]);

export const badgeCriteriaTypeEnum = pgEnum("badge_criteria_type", [
  "points_threshold",
  "quests_completed",
  "specific_quest",
]);

/** One thematic module a learner works through, e.g. "Intro to Git". */
export const academyQuests = pgTable("academy_quests", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  /** Short teaser shown on the quest card / trail node. */
  description: text("description").notNull(),
  topic: text("topic").notNull(),
  /** Position along the quest trail; also drives the unlock sequence. */
  order: integer("order").notNull().default(0),
  pointsReward: integer("points_reward").notNull().default(100),
  /** Key into a fixed icon set on the frontend (e.g. "compass", "code", "rocket"). */
  iconKey: text("icon_key").notNull().default("compass"),
  coverImageUrl: text("cover_image_url"),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

/** A single lesson/challenge/quiz screen within a quest, shown in order. */
export const academyQuestSteps = pgTable(
  "academy_quest_steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questId: uuid("quest_id")
      .notNull()
      .references(() => academyQuests.id, { onDelete: "cascade" }),
    order: integer("order").notNull().default(0),
    title: text("title").notNull(),
    type: questStepTypeEnum("type").notNull().default("lesson"),
    /** Markdown lesson content. */
    content: text("content").notNull(),
    /** For "challenge"/"quiz" steps: the prompt/question shown after the content. */
    challengePrompt: text("challenge_prompt"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("academy_quest_step_order_idx").on(table.questId, table.order)],
);

/**
 * LeetCode-style challenge attached to a step of type "coding_challenge".
 * Model: the learner writes a full program that reads from stdin and
 * writes to stdout (not a bare function) — this is what makes grading
 * language-agnostic across Python/JS/Java/C++ via a single execution API,
 * at the cost of a little more boilerplate for the learner.
 */
export const academyCodingChallenges = pgTable("academy_coding_challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  stepId: uuid("step_id")
    .notNull()
    .references(() => academyQuestSteps.id, { onDelete: "cascade" })
    .unique(),
  prompt: text("prompt").notNull(),
  difficulty: challengeDifficultyEnum("difficulty").notNull().default("easy"),
  /** Per-language starter code shown in the editor, keyed by Piston language id: python/javascript/java/cpp. */
  starterCode: text("starter_code").notNull(), // JSON: Record<string, string>
  /**
   * Test cases run against the program's stdout. The first case is always
   * shown to the learner as a worked example; the rest run only on Submit.
   * JSON: { stdin: string; expectedStdout: string; hidden: boolean }[]
   */
  testCases: text("test_cases").notNull(),
  timeLimitMs: integer("time_limit_ms").notNull().default(5000),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

/**
 * SQL challenge attached to a step of type "sql_challenge". Runs entirely
 * client-side against an in-browser SQLite (sql.js) seeded with setupSql —
 * no execution API involved, so there's no rate limit or latency here.
 */
export const academySqlChallenges = pgTable("academy_sql_challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  stepId: uuid("step_id")
    .notNull()
    .references(() => academyQuestSteps.id, { onDelete: "cascade" })
    .unique(),
  prompt: text("prompt").notNull(),
  difficulty: challengeDifficultyEnum("difficulty").notNull().default("easy"),
  /** DDL + seed INSERTs run once to build the practice database. */
  setupSql: text("setup_sql").notNull(),
  /** The row set the learner's query must produce. JSON: Record<string, unknown>[] */
  expectedResult: text("expected_result").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

/** Per-member progress through a quest. One row per (member, quest). */
export const academyUserProgress = pgTable(
  "academy_user_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    questId: uuid("quest_id")
      .notNull()
      .references(() => academyQuests.id, { onDelete: "cascade" }),
    status: questProgressStatusEnum("status").notNull().default("locked"),
    /** Order value of the furthest step this member has completed. */
    currentStepOrder: integer("current_step_order").notNull().default(0),
    pointsEarned: integer("points_earned").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("academy_progress_member_quest_idx").on(table.memberId, table.questId)],
);

/** A milestone badge a member can unlock. */
export const academyBadges = pgTable("academy_badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  iconKey: text("icon_key").notNull().default("badge"),
  criteriaType: badgeCriteriaTypeEnum("criteria_type").notNull(),
  /** Points threshold, quest count, or (for "specific_quest") unused — see specificQuestId. */
  criteriaValue: integer("criteria_value").notNull().default(0),
  specificQuestId: uuid("specific_quest_id").references(() => academyQuests.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const academyUserBadges = pgTable(
  "academy_user_badges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    badgeId: uuid("badge_id")
      .notNull()
      .references(() => academyBadges.id, { onDelete: "cascade" }),
    earnedAt: timestamp("earned_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("academy_user_badge_unique_idx").on(table.memberId, table.badgeId)],
);

/* ---------- Relations ---------- */

export const academyQuestsRelations = relations(academyQuests, ({ many }) => ({
  steps: many(academyQuestSteps),
  progress: many(academyUserProgress),
}));

export const academyQuestStepsRelations = relations(academyQuestSteps, ({ one }) => ({
  quest: one(academyQuests, { fields: [academyQuestSteps.questId], references: [academyQuests.id] }),
  codingChallenge: one(academyCodingChallenges, {
    fields: [academyQuestSteps.id],
    references: [academyCodingChallenges.stepId],
  }),
  sqlChallenge: one(academySqlChallenges, {
    fields: [academyQuestSteps.id],
    references: [academySqlChallenges.stepId],
  }),
}));

export const academyCodingChallengesRelations = relations(academyCodingChallenges, ({ one }) => ({
  step: one(academyQuestSteps, { fields: [academyCodingChallenges.stepId], references: [academyQuestSteps.id] }),
}));

export const academySqlChallengesRelations = relations(academySqlChallenges, ({ one }) => ({
  step: one(academyQuestSteps, { fields: [academySqlChallenges.stepId], references: [academyQuestSteps.id] }),
}));

export const academyUserProgressRelations = relations(academyUserProgress, ({ one }) => ({
  member: one(members, { fields: [academyUserProgress.memberId], references: [members.id] }),
  quest: one(academyQuests, { fields: [academyUserProgress.questId], references: [academyQuests.id] }),
}));

export const academyUserBadgesRelations = relations(academyUserBadges, ({ one }) => ({
  member: one(members, { fields: [academyUserBadges.memberId], references: [members.id] }),
  badge: one(academyBadges, { fields: [academyUserBadges.badgeId], references: [academyBadges.id] }),
}));