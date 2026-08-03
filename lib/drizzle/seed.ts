import { getDb } from "./client";
import { events } from "./schema";
import { EVENTS_SEED } from ".././../data/events-seed";
import { slugify } from "../utils/slugify";

async function main() {
  const db = getDb();

  console.log(`Seeding ${EVENTS_SEED.length} events...`);
  await db
    .insert(events)
    .values(
      EVENTS_SEED.map((e) => ({
        slug: e.slug ?? slugify(e.title),
        title: e.title,
        description: e.description,
        startsAt: new Date(e.startsAt),
        location: e.location,
      })),
    )
    .onConflictDoNothing({ target: events.slug });

  console.log("✅ Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
