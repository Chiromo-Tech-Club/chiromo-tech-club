import { pgTable, pgEnum, uuid, text, timestamp, integer, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { ROLES } from "@/constants/roles";

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

export const members = pgTable(
  "members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    role: roleEnum("role").notNull().default("visitor"),
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
