import { notFound } from "next/navigation";
import { desc, eq, isNull } from "drizzle-orm";
import { SHARED_NAV_ITEMS, EXEC_NAV, isSlugForExecTitle } from "@/config/dashboard-nav";
import { isExecTitle, EXEC_TITLE_LABELS } from "@/types/exec-title";
import { canAccessExecSection } from "@/lib/clerk/client";
import { getDb } from "@/lib/drizzle/client";
import { decisions, initiatives, meetingMinutes, members } from "@/lib/drizzle/schema";
import { ComingSoon } from "@/components/dashboard/ComingSoon";
import { AccessDenied } from "@/components/dashboard/AccessDenied";
import { DecisionsBoard, type DecisionItem } from "@/features/dashboard/DecisionsBoard";
import { InitiativeTracker, type InitiativeItem } from "@/features/dashboard/InitiativeTracker";
import { MinutesEditor, type MinutesItem } from "@/features/dashboard/MinutesEditor";

interface DashboardCatchAllProps {
  params: Promise<{ slug: string[] }>;
}

async function ChairpersonDecisions() {
  const db = getDb();
  const rows = await db
    .select({
      id: decisions.id,
      title: decisions.title,
      description: decisions.description,
      status: decisions.status,
      createdAt: decisions.createdAt,
      proposedByName: members.fullName,
    })
    .from(decisions)
    .innerJoin(members, eq(decisions.proposedById, members.id))
    .where(isNull(decisions.deletedAt))
    .orderBy(desc(decisions.createdAt));

  const items: DecisionItem[] = rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  return <DecisionsBoard decisions={items} />;
}

async function ViceChairpersonInitiatives() {
  const db = getDb();
  const rows = await db
    .select({
      id: initiatives.id,
      title: initiatives.title,
      description: initiatives.description,
      status: initiatives.status,
      dueDate: initiatives.dueDate,
      ownerName: members.fullName,
    })
    .from(initiatives)
    .leftJoin(members, eq(initiatives.ownerId, members.id))
    .where(isNull(initiatives.deletedAt))
    .orderBy(desc(initiatives.createdAt));

  const items: InitiativeItem[] = rows.map((r) => ({
    ...r,
    ownerName: r.ownerName ?? null,
    dueDate: r.dueDate ? r.dueDate.toISOString() : null,
  }));
  return <InitiativeTracker initiatives={items} />;
}

async function SecretaryGeneralMinutes() {
  const db = getDb();
  const rows = await db
    .select({
      id: meetingMinutes.id,
      title: meetingMinutes.title,
      meetingDate: meetingMinutes.meetingDate,
      agenda: meetingMinutes.agenda,
      minutes: meetingMinutes.minutes,
      attendees: meetingMinutes.attendees,
      recordedByName: members.fullName,
    })
    .from(meetingMinutes)
    .innerJoin(members, eq(meetingMinutes.recordedById, members.id))
    .where(isNull(meetingMinutes.deletedAt))
    .orderBy(desc(meetingMinutes.meetingDate));

  const items: MinutesItem[] = rows.map((r) => ({ ...r, meetingDate: r.meetingDate.toISOString() }));
  return <MinutesEditor records={items} />;
}

export default async function DashboardCatchAllPage({ params }: DashboardCatchAllProps) {
  const { slug } = await params;

  // /dashboard/{sharedSlug} — visible to any exec/admin (layout already gates that).
  if (slug.length === 1) {
    const item = SHARED_NAV_ITEMS.find((i) => i.slug === slug[0]);
    if (!item) notFound();
    return <ComingSoon label={item.label} />;
  }

  // /dashboard/{execTitle}/{sectionSlug} — scoped to that exec title (or admin).
  if (slug.length === 2) {
    const [execTitleParam, sectionSlug] = slug;
    if (!isExecTitle(execTitleParam)) notFound();
    if (!isSlugForExecTitle(execTitleParam, sectionSlug)) notFound();

    const allowed = await canAccessExecSection(execTitleParam);
    if (!allowed) return <AccessDenied />;

    // Flagship sections with a real, working tool behind them — everything
    // else in EXEC_NAV still falls through to <ComingSoon> until it's built.
    if (execTitleParam === "chairperson" && sectionSlug === "recent-decisions") {
      return <ChairpersonDecisions />;
    }
    if (execTitleParam === "vice_chairperson" && sectionSlug === "initiative-dashboard") {
      return <ViceChairpersonInitiatives />;
    }
    if (execTitleParam === "secretary_general" && sectionSlug === "minute-editor") {
      return <SecretaryGeneralMinutes />;
    }

    const item = EXEC_NAV[execTitleParam].find((i) => i.slug === sectionSlug);
    if (!item) notFound();
    return <ComingSoon label={`${EXEC_TITLE_LABELS[execTitleParam]} — ${item.label}`} />;
  }

  notFound();
}
