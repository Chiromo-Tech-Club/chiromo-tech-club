import { pgTable, pgEnum, uuid, text, timestamp, integer, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { ROLES } from "@/constants/roles";
import { EXEC_TITLES } from "@/types/exec-title";

/**
 * Schema conventions (per the project's architecture rules):
 * - UUID primary keys everywhere (never auto-increment ints)
 * - createdAt/updatedAt timestamps on every table
 * - deletedAt for soft deletes instead of hard DELETEs, where a record
 *   might need to be recovered or referenced historically (members, events, projects)
 * - Foreign keys always cascade in a way that preserves history: registrations
 *   are removed if the event is hard-deleted, but members/events themselves
 *   are soft-deleted, not hard-deleted, in normal operation.
 */

export const roleEnum = pgEnum("role", ROLES);
export const execTitleEnum = pgEnum("exec_title", EXEC_TITLES);
export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense"]);
export const decisionStatusEnum = pgEnum("decision_status", ["proposed", "approved", "rejected"]);
export const sponsorStatusEnum = pgEnum("sponsor_status", ["prospect", "active", "past"]);
export const initiativeStatusEnum = pgEnum("initiative_status", ["planned", "in_progress", "done"]);

export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    role: roleEnum("role").notNull().default("visitor"),
    /** Only meaningful when role = "exec" — which named seat they hold. */
    execTitle: execTitleEnum("exec_title"),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    githubHandle: text("github_handle"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("members_clerk_user_id_idx").on(table.clerkUserId),
    uniqueIndex("members_email_idx").on(table.email),
  ],
);

/** Many-to-many: a member can belong to several communities. */
export const memberCommunities = pgTable(
  "member_communities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    communitySlug: text("community_slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("member_community_unique_idx").on(table.memberId, table.communitySlug)],
);

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  location: text("location").notNull(),
  capacity: integer("capacity"),
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const eventRegistrations = pgTable(
  "event_registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    registeredAt: timestamp("registered_at", { withTimezone: true }).notNull().defaultNow(),
    attended: boolean("attended").notNull().default(false),
  },
  (table) => [uniqueIndex("event_registration_unique_idx").on(table.eventId, table.memberId)],
);

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tags: text("tags").array().notNull().default([]),
  size: text("size", { enum: ["small", "regular", "tall"] })
    .notNull()
    .default("regular"),
  repoUrl: text("repo_url"),
  stars: integer("stars").notNull().default(0),
  contributorCount: integer("contributor_count").notNull().default(0),
  coverImageUrl: text("cover_image_url"),
  communitySlug: text("community_slug").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

/** Shared-dashboard announcements — visible to every exec, postable by any exec for now. */
export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const announcementsRelations = relations(announcements, ({ one }) => ({
  author: one(members, { fields: [announcements.authorId], references: [members.id] }),
}));

/* ---------- Role-specific flagship tools (one per exec seat) ---------- */

/** Treasurer — income/expense ledger. Amounts stored in cents to avoid float rounding. */
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: transactionTypeEnum("type").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  amountCents: integer("amount_cents").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  recordedById: uuid("recorded_by_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

/** Secretary General — meeting minutes: agenda, notes, and attendance in one record. */
export const meetingMinutes = pgTable("meeting_minutes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  meetingDate: timestamp("meeting_date", { withTimezone: true }).notNull(),
  agenda: text("agenda").notNull().default(""),
  minutes: text("minutes").notNull().default(""),
  attendees: text("attendees").array().notNull().default([]),
  recordedById: uuid("recorded_by_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

/**
 * Chairperson (propose/sign) + Patron (final sign-off) — a shared decisions
 * log. Patron's "Institutional Oversight" section reads the same table,
 * filtered to what's still pending, rather than duplicating a table.
 */
export const decisions = pgTable("decisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: decisionStatusEnum("status").notNull().default("proposed"),
  proposedById: uuid("proposed_by_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

/** Corporate Affairs — sponsor/partner CRM. */
export const sponsors = pgTable("sponsors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  status: sponsorStatusEnum("status").notNull().default("prospect"),
  notes: text("notes"),
  addedById: uuid("added_by_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

/** Training & Skills Development Coordinator — curated learning resource library. */
export const resources = pgTable("resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  topic: text("topic").notNull(),
  description: text("description"),
  addedById: uuid("added_by_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

/** Vice Chairperson — tracks special projects/initiatives distinct from community showcase `projects`. */
export const initiatives = pgTable("initiatives", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: initiativeStatusEnum("status").notNull().default("planned"),
  ownerId: uuid("owner_id").references(() => members.id, { onDelete: "set null" }),
  dueDate: timestamp("due_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

/* ---------- Relations (for Drizzle's relational query API) ---------- */

export const membersRelations = relations(members, ({ many }) => ({
  communities: many(memberCommunities),
  eventRegistrations: many(eventRegistrations),
}));

export const memberCommunitiesRelations = relations(memberCommunities, ({ one }) => ({
  member: one(members, { fields: [memberCommunities.memberId], references: [members.id] }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  registrations: many(eventRegistrations),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, { fields: [eventRegistrations.eventId], references: [events.id] }),
  member: one(members, { fields: [eventRegistrations.memberId], references: [members.id] }),
}));
