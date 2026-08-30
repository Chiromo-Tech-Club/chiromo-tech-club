import { notFound } from "next/navigation";
import { desc, eq, isNull, gte, and } from "drizzle-orm";
import { SHARED_NAV_ITEMS, EXEC_NAV, isSlugForExecTitle } from "@/config/dashboard-nav";
import { isExecTitle, EXEC_TITLE_LABELS } from "@/types/exec-title";
import { canAccessExecSection } from "@/lib/supabase/auth-helpers";
import { getDb } from "@/lib/drizzle/client";
import {
  decisions,
  initiatives,
  meetingMinutes,
  transactions,
  sponsors,
  resources,
  members,
  memberCommunities,
  tasks,
  documents,
  execMessages,
  announcements,
  events,
  eventRegistrations,
  invoices,
  grantApplications,
  guestSpeakers,
  campaigns,
  mentorships,
  trainingAssignments,
  teams,
  teamMembers,
  volunteerLogs,
  projects,
  risks,
} from "@/lib/drizzle/schema";
import { COMMUNITIES } from "@/data/communities";
import { ComingSoon } from "@/components/dashboard/ComingSoon";
import { AccessDenied } from "@/components/dashboard/AccessDenied";
import { DecisionsBoard, type DecisionItem } from "@/features/dashboard/DecisionsBoard";
import { MembersTable } from "@/features/admin/MembersTable";
import { InitiativeTracker, type InitiativeItem } from "@/features/dashboard/InitiativeTracker";
import { MinutesEditor, type MinutesItem } from "@/features/dashboard/MinutesEditor";
import { BudgetPlanner, type TransactionItem } from "@/features/dashboard/BudgetPlanner";
import { SponsorDatabase, type SponsorItem } from "@/features/dashboard/SponsorDatabase";
import { MemberDirectory, type DirectoryMember } from "@/features/dashboard/MemberDirectory";
import { ResourceLibrary, type ResourceItem } from "@/features/dashboard/ResourceLibrary";
import { AnnouncementsBoard, type AnnouncementFullItem } from "@/features/dashboard/AnnouncementsBoard";
import { TaskBoard, type TaskItem, type MemberOption } from "@/features/dashboard/TaskBoard";
import { DocumentRepository, type DocumentItem } from "@/features/dashboard/DocumentRepository";
import { ExecChat } from "@/features/dashboard/ExecChat";
import type { ChatMessageItem } from "@/actions/dashboard/chat";
import { Calendar, type CalendarEntry } from "@/features/dashboard/Calendar";
import { CommitteeActivityFeed, type ActivityEntry } from "@/features/dashboard/CommitteeActivityFeed";
import { TransactionTypeTracker, type TransactionRow } from "@/features/dashboard/TransactionTypeTracker";
import { FinancialReports, type MonthlySummary } from "@/features/dashboard/FinancialReports";
import { DecisionLog, type DecisionLogRow } from "@/features/dashboard/DecisionLog";
import { EventsParticipation, type EventParticipationRow } from "@/features/dashboard/EventsParticipation";
import { EventManager, type EventManagerItem } from "@/features/dashboard/EventManager";
import { InvoiceTracker, type InvoiceItem } from "@/features/dashboard/InvoiceTracker";
import { GrantApplications, type GrantItem } from "@/features/dashboard/GrantApplications";
import { AttendanceRegister, type AttendanceRow } from "@/features/dashboard/AttendanceRegister";
import { GuestSpeakers, type SpeakerItem } from "@/features/dashboard/GuestSpeakers";
import { MarketingCampaigns, type CampaignItem } from "@/features/dashboard/MarketingCampaigns";
import { Mentorship, type MentorshipItem } from "@/features/dashboard/Mentorship";
import { Assignments, type AssignmentItem } from "@/features/dashboard/Assignments";
import { Teams, type TeamItem } from "@/features/dashboard/Teams";
import { Volunteers, type VolunteerLogItem } from "@/features/dashboard/Volunteers";
import { OrgHealthMetrics, type OrgHealthData } from "@/features/dashboard/OrgHealthMetrics";
import { EngagementAnalytics, type EngagementData } from "@/features/dashboard/EngagementAnalytics";
import { FinancialCharts, type MonthlyBar } from "@/features/dashboard/FinancialCharts";
import { RiskTracker, type RiskItem } from "@/features/dashboard/RiskTracker";
import { getCurrentMember } from "@/lib/supabase/get-current-member";

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

async function TreasurerBudget() {
  const db = getDb();
  const rows = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      category: transactions.category,
      description: transactions.description,
      amountCents: transactions.amountCents,
      occurredAt: transactions.occurredAt,
      recordedByName: members.fullName,
    })
    .from(transactions)
    .innerJoin(members, eq(transactions.recordedById, members.id))
    .where(isNull(transactions.deletedAt))
    .orderBy(desc(transactions.occurredAt));

  const items: TransactionItem[] = rows.map((r) => ({ ...r, occurredAt: r.occurredAt.toISOString() }));
  return <BudgetPlanner transactions={items} />;
}

async function CorporateAffairsSponsors() {
  const db = getDb();
  const rows = await db
    .select({
      id: sponsors.id,
      name: sponsors.name,
      contactName: sponsors.contactName,
      contactEmail: sponsors.contactEmail,
      status: sponsors.status,
      notes: sponsors.notes,
    })
    .from(sponsors)
    .where(isNull(sponsors.deletedAt))
    .orderBy(desc(sponsors.createdAt));

  return <SponsorDatabase sponsors={rows as SponsorItem[]} />;
}

async function MembershipOfficerDirectory() {
  const db = getDb();
  const memberRows = await db
    .select({
      id: members.id,
      fullName: members.fullName,
      email: members.email,
      role: members.role,
      execTitle: members.execTitle,
      githubHandle: members.githubHandle,
      createdAt: members.createdAt,
    })
    .from(members)
    .where(isNull(members.deletedAt))
    .orderBy(members.fullName);

  const communityRows = await db
    .select({ memberId: memberCommunities.memberId, communitySlug: memberCommunities.communitySlug })
    .from(memberCommunities);

  const communitiesByMember = new Map<string, string[]>();
  for (const c of communityRows) {
    const list = communitiesByMember.get(c.memberId) ?? [];
    list.push(c.communitySlug);
    communitiesByMember.set(c.memberId, list);
  }

  const items: DirectoryMember[] = memberRows.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    communitySlugs: communitiesByMember.get(m.id) ?? [],
  }));

  return <MemberDirectory members={items} />;
}

async function TrainingCoordinatorResources() {
  const db = getDb();
  const rows = await db
    .select({
      id: resources.id,
      title: resources.title,
      url: resources.url,
      topic: resources.topic,
      description: resources.description,
    })
    .from(resources)
    .where(isNull(resources.deletedAt))
    .orderBy(desc(resources.createdAt));

  return <ResourceLibrary resources={rows as ResourceItem[]} />;
}

async function SharedAnnouncements() {
  const db = getDb();
  const rows = await db
    .select({
      id: announcements.id,
      title: announcements.title,
      body: announcements.body,
      createdAt: announcements.createdAt,
      authorName: members.fullName,
    })
    .from(announcements)
    .innerJoin(members, eq(announcements.authorId, members.id))
    .where(isNull(announcements.deletedAt))
    .orderBy(desc(announcements.createdAt));

  const items: AnnouncementFullItem[] = rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  return <AnnouncementsBoard announcements={items} />;
}

async function SharedTasks() {
  const db = getDb();
  const rows = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      dueDate: tasks.dueDate,
      assigneeName: members.fullName,
    })
    .from(tasks)
    .leftJoin(members, eq(tasks.assigneeId, members.id))
    .where(isNull(tasks.deletedAt))
    .orderBy(desc(tasks.createdAt));

  const memberRows = await getDb().select({ id: members.id, fullName: members.fullName }).from(members).where(isNull(members.deletedAt)).orderBy(members.fullName);

  const items: TaskItem[] = rows.map((r) => ({
    ...r,
    assigneeName: r.assigneeName ?? null,
    dueDate: r.dueDate ? r.dueDate.toISOString() : null,
  }));
  return <TaskBoard tasks={items} memberOptions={memberRows as MemberOption[]} />;
}

async function SharedDocuments({
  category,
  title,
  showSearch,
  showForm = true,
}: {
  category?: string;
  title?: string;
  showSearch?: boolean;
  showForm?: boolean;
} = {}) {
  const db = getDb();
  const conditions = category ? and(isNull(documents.deletedAt), eq(documents.category, category)) : isNull(documents.deletedAt);
  const rows = await db
    .select({
      id: documents.id,
      title: documents.title,
      url: documents.url,
      category: documents.category,
      createdAt: documents.createdAt,
      uploadedByName: members.fullName,
    })
    .from(documents)
    .innerJoin(members, eq(documents.uploadedById, members.id))
    .where(conditions)
    .orderBy(desc(documents.createdAt));

  const items: DocumentItem[] = rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  return <DocumentRepository documents={items} title={title} showSearch={showSearch} showForm={showForm} />;
}

async function SharedChat() {
  const db = getDb();
  const currentMember = await getCurrentMember();

  const rows = await db
    .select({
      id: execMessages.id,
      body: execMessages.body,
      authorId: execMessages.authorId,
      authorName: members.fullName,
      authorTitle: members.execTitle,
      authorAvatarUrl: members.avatarUrl,
      createdAt: execMessages.createdAt,
      editedAt: execMessages.editedAt,
    })
    .from(execMessages)
    .innerJoin(members, eq(execMessages.authorId, members.id))
    .orderBy(execMessages.createdAt)
    .limit(200);

  const items: ChatMessageItem[] = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    editedAt: r.editedAt ? r.editedAt.toISOString() : null,
  }));

  return <ExecChat messages={items} currentUserId={currentMember?.id ?? ""} />;
}

async function SharedCalendar() {
  const db = getDb();
  const now = new Date();

  const [upcomingEvents, upcomingMeetings, dueInitiatives, dueTasks] = await Promise.all([
    db.select({ id: events.id, title: events.title, startsAt: events.startsAt }).from(events).where(gte(events.startsAt, now)),
    db
      .select({ id: meetingMinutes.id, title: meetingMinutes.title, meetingDate: meetingMinutes.meetingDate })
      .from(meetingMinutes)
      .where(isNull(meetingMinutes.deletedAt)),
    db
      .select({ id: initiatives.id, title: initiatives.title, dueDate: initiatives.dueDate })
      .from(initiatives)
      .where(isNull(initiatives.deletedAt)),
    db.select({ id: tasks.id, title: tasks.title, dueDate: tasks.dueDate }).from(tasks).where(isNull(tasks.deletedAt)),
  ]);

  const entries: CalendarEntry[] = [
    ...upcomingEvents.map((e) => ({ id: e.id, title: e.title, date: e.startsAt.toISOString(), kind: "event" as const })),
    ...upcomingMeetings.map((m) => ({ id: m.id, title: m.title, date: m.meetingDate.toISOString(), kind: "meeting" as const })),
    ...dueInitiatives
      .filter((i) => i.dueDate)
      .map((i) => ({ id: i.id, title: i.title, date: i.dueDate!.toISOString(), kind: "initiative-due" as const })),
    ...dueTasks.filter((t) => t.dueDate).map((t) => ({ id: t.id, title: t.title, date: t.dueDate!.toISOString(), kind: "task-due" as const })),
  ];

  return <Calendar entries={entries} />;
}

async function SharedCommitteeActivity() {
  const db = getDb();

  const [recentDecisions, recentInitiatives, recentMinutes, recentTransactions, recentSponsors, recentResources] = await Promise.all([
    db
      .select({ id: decisions.id, title: decisions.title, status: decisions.status, createdAt: decisions.createdAt, actorName: members.fullName })
      .from(decisions)
      .innerJoin(members, eq(decisions.proposedById, members.id))
      .orderBy(desc(decisions.createdAt))
      .limit(8),
    db
      .select({ id: initiatives.id, title: initiatives.title, createdAt: initiatives.createdAt, actorName: members.fullName })
      .from(initiatives)
      .innerJoin(members, eq(initiatives.ownerId, members.id))
      .orderBy(desc(initiatives.createdAt))
      .limit(8),
    db
      .select({ id: meetingMinutes.id, title: meetingMinutes.title, createdAt: meetingMinutes.createdAt, actorName: members.fullName })
      .from(meetingMinutes)
      .innerJoin(members, eq(meetingMinutes.recordedById, members.id))
      .orderBy(desc(meetingMinutes.createdAt))
      .limit(8),
    db
      .select({ id: transactions.id, category: transactions.category, type: transactions.type, createdAt: transactions.createdAt, actorName: members.fullName })
      .from(transactions)
      .innerJoin(members, eq(transactions.recordedById, members.id))
      .orderBy(desc(transactions.createdAt))
      .limit(8),
    db
      .select({ id: sponsors.id, name: sponsors.name, createdAt: sponsors.createdAt, actorName: members.fullName })
      .from(sponsors)
      .innerJoin(members, eq(sponsors.addedById, members.id))
      .orderBy(desc(sponsors.createdAt))
      .limit(8),
    db
      .select({ id: resources.id, title: resources.title, createdAt: resources.createdAt, actorName: members.fullName })
      .from(resources)
      .innerJoin(members, eq(resources.addedById, members.id))
      .orderBy(desc(resources.createdAt))
      .limit(8),
  ]);

  const entries: ActivityEntry[] = [
    ...recentDecisions.map((d) => ({ id: d.id, kind: "decision" as const, summary: `proposed decision "${d.title}"`, actorName: d.actorName, createdAt: d.createdAt.toISOString() })),
    ...recentInitiatives.map((i) => ({ id: i.id, kind: "initiative" as const, summary: `started initiative "${i.title}"`, actorName: i.actorName, createdAt: i.createdAt.toISOString() })),
    ...recentMinutes.map((m) => ({ id: m.id, kind: "minutes" as const, summary: `logged minutes for "${m.title}"`, actorName: m.actorName, createdAt: m.createdAt.toISOString() })),
    ...recentTransactions.map((t) => ({ id: t.id, kind: "transaction" as const, summary: `recorded ${t.type} — ${t.category}`, actorName: t.actorName, createdAt: t.createdAt.toISOString() })),
    ...recentSponsors.map((s) => ({ id: s.id, kind: "sponsor" as const, summary: `added sponsor "${s.name}"`, actorName: s.actorName, createdAt: s.createdAt.toISOString() })),
    ...recentResources.map((r) => ({ id: r.id, kind: "resource" as const, summary: `added resource "${r.title}"`, actorName: r.actorName, createdAt: r.createdAt.toISOString() })),
  ];

  return <CommitteeActivityFeed entries={entries} />;
}

async function TreasurerIncomeTracker() {
  const db = getDb();
  const incomeRows = await db
    .select({
      id: transactions.id,
      category: transactions.category,
      description: transactions.description,
      amountCents: transactions.amountCents,
      occurredAt: transactions.occurredAt,
      recordedByName: members.fullName,
    })
    .from(transactions)
    .innerJoin(members, eq(transactions.recordedById, members.id))
    .where(and(isNull(transactions.deletedAt), eq(transactions.type, "income")))
    .orderBy(desc(transactions.occurredAt));

  const items: TransactionRow[] = incomeRows.map((r) => ({ ...r, occurredAt: r.occurredAt.toISOString() }));
  return <TransactionTypeTracker type="income" rows={items} />;
}

async function TreasurerExpenseTracker() {
  const db = getDb();
  const rows = await db
    .select({
      id: transactions.id,
      category: transactions.category,
      description: transactions.description,
      amountCents: transactions.amountCents,
      occurredAt: transactions.occurredAt,
      recordedByName: members.fullName,
    })
    .from(transactions)
    .innerJoin(members, eq(transactions.recordedById, members.id))
    .where(and(isNull(transactions.deletedAt), eq(transactions.type, "expense")))
    .orderBy(desc(transactions.occurredAt));

  const items: TransactionRow[] = rows.map((r) => ({ ...r, occurredAt: r.occurredAt.toISOString() }));
  return <TransactionTypeTracker type="expense" rows={items} />;
}

async function TreasurerFinancialReports() {
  const db = getDb();
  const rows = await db
    .select({ type: transactions.type, amountCents: transactions.amountCents, occurredAt: transactions.occurredAt })
    .from(transactions)
    .where(isNull(transactions.deletedAt));

  const byMonth = new Map<string, { incomeCents: number; expenseCents: number }>();
  for (const r of rows) {
    const month = r.occurredAt.toISOString().slice(0, 7); // "YYYY-MM"
    const entry = byMonth.get(month) ?? { incomeCents: 0, expenseCents: 0 };
    if (r.type === "income") entry.incomeCents += r.amountCents;
    else entry.expenseCents += r.amountCents;
    byMonth.set(month, entry);
  }

  const summaries: MonthlySummary[] = Array.from(byMonth.entries()).map(([month, totals]) => ({ month, ...totals }));
  return <FinancialReports summaries={summaries} />;
}

async function SecretaryGeneralDecisionLog({ statusFilter }: { statusFilter?: "proposed" | "approved" | "rejected" } = {}) {
  const db = getDb();
  const conditions = statusFilter
    ? and(isNull(decisions.deletedAt), eq(decisions.status, statusFilter))
    : isNull(decisions.deletedAt);
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
    .where(conditions)
    .orderBy(desc(decisions.createdAt));

  const items: DecisionLogRow[] = rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  return <DecisionLog decisions={items} />;
}

async function MembershipOfficerEventsParticipation() {
  const db = getDb();
  const eventRows = await db.select({ id: events.id, title: events.title, startsAt: events.startsAt }).from(events).where(isNull(events.deletedAt));

  const regRows = await db
    .select({ eventId: eventRegistrations.eventId, memberName: members.fullName })
    .from(eventRegistrations)
    .innerJoin(members, eq(eventRegistrations.memberId, members.id));

  const namesByEvent = new Map<string, string[]>();
  for (const r of regRows) {
    const list = namesByEvent.get(r.eventId) ?? [];
    list.push(r.memberName);
    namesByEvent.set(r.eventId, list);
  }

  const items: EventParticipationRow[] = eventRows.map((e) => ({
    eventId: e.id,
    eventTitle: e.title,
    startsAt: e.startsAt.toISOString(),
    attendeeNames: namesByEvent.get(e.id) ?? [],
  }));

  return <EventsParticipation events={items} />;
}

async function CorporateAffairsEventManager() {
  const db = getDb();
  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      startsAt: events.startsAt,
      location: events.location,
      capacity: events.capacity,
    })
    .from(events)
    .where(isNull(events.deletedAt))
    .orderBy(desc(events.startsAt));

  const items: EventManagerItem[] = rows.map((r) => ({ ...r, startsAt: r.startsAt.toISOString() }));
  return <EventManager events={items} />;
}

async function TreasurerInvoices() {
  const db = getDb();
  const rows = await db
    .select({
      id: invoices.id,
      clientName: invoices.clientName,
      description: invoices.description,
      amountCents: invoices.amountCents,
      dueDate: invoices.dueDate,
      status: invoices.status,
    })
    .from(invoices)
    .where(isNull(invoices.deletedAt))
    .orderBy(desc(invoices.createdAt));

  const items: InvoiceItem[] = rows.map((r) => ({ ...r, dueDate: r.dueDate ? r.dueDate.toISOString() : null }));
  return <InvoiceTracker invoices={items} />;
}

async function TreasurerGrantApplications() {
  const db = getDb();
  const rows = await db
    .select({
      id: grantApplications.id,
      funderName: grantApplications.funderName,
      amountCents: grantApplications.amountCents,
      deadline: grantApplications.deadline,
      status: grantApplications.status,
      notes: grantApplications.notes,
    })
    .from(grantApplications)
    .where(isNull(grantApplications.deletedAt))
    .orderBy(desc(grantApplications.createdAt));

  const items: GrantItem[] = rows.map((r) => ({ ...r, deadline: r.deadline ? r.deadline.toISOString() : null }));
  return <GrantApplications grants={items} />;
}

async function SecretaryGeneralAttendanceRegister() {
  const db = getDb();
  const rows = await db
    .select({ attendees: meetingMinutes.attendees })
    .from(meetingMinutes)
    .where(isNull(meetingMinutes.deletedAt));

  const counts = new Map<string, number>();
  for (const r of rows) {
    for (const name of r.attendees) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }

  const attendanceRows: AttendanceRow[] = Array.from(counts.entries()).map(([name, meetingsAttended]) => ({ name, meetingsAttended }));
  return <AttendanceRegister rows={attendanceRows} totalMeetings={rows.length} />;
}

async function getMemberOptions(): Promise<MemberOption[]> {
  const db = getDb();
  const rows = await db.select({ id: members.id, fullName: members.fullName }).from(members).where(isNull(members.deletedAt)).orderBy(members.fullName);
  return rows;
}

async function ChairpersonOrgHealth() {
  const db = getDb();
  const [memberCount, eventCount, projectCount, txRows, pendingDecisions, activeInitiatives] = await Promise.all([
    db.select({ id: members.id }).from(members).where(isNull(members.deletedAt)).then((r) => r.length),
    db.select({ id: events.id }).from(events).where(isNull(events.deletedAt)).then((r) => r.length),
    db.select({ id: projects.id }).from(projects).where(isNull(projects.deletedAt)).then((r) => r.length),
    db.select({ type: transactions.type, amountCents: transactions.amountCents }).from(transactions).where(isNull(transactions.deletedAt)),
    db.select({ id: decisions.id }).from(decisions).where(and(isNull(decisions.deletedAt), eq(decisions.status, "proposed"))).then((r) => r.length),
    db.select({ id: initiatives.id }).from(initiatives).where(and(isNull(initiatives.deletedAt), eq(initiatives.status, "in_progress"))).then((r) => r.length),
  ]);

  const balanceCents = txRows.reduce((sum, t) => sum + (t.type === "income" ? t.amountCents : -t.amountCents), 0);

  const data: OrgHealthData = { memberCount, eventCount, projectCount, balanceCents, pendingDecisions, activeInitiatives };
  return <OrgHealthMetrics data={data} />;
}

async function TreasurerFinancialCharts() {
  const db = getDb();
  const rows = await db
    .select({ type: transactions.type, amountCents: transactions.amountCents, occurredAt: transactions.occurredAt })
    .from(transactions)
    .where(isNull(transactions.deletedAt));

  const byMonth = new Map<string, { incomeCents: number; expenseCents: number }>();
  for (const r of rows) {
    const month = r.occurredAt.toISOString().slice(0, 7);
    const entry = byMonth.get(month) ?? { incomeCents: 0, expenseCents: 0 };
    if (r.type === "income") entry.incomeCents += r.amountCents;
    else entry.expenseCents += r.amountCents;
    byMonth.set(month, entry);
  }

  const bars: MonthlyBar[] = Array.from(byMonth.entries()).map(([month, totals]) => ({ month, ...totals }));
  return <FinancialCharts bars={bars} />;
}

async function CorporateAffairsGuestSpeakers() {
  const db = getDb();
  const rows = await db
    .select({ id: guestSpeakers.id, name: guestSpeakers.name, topic: guestSpeakers.topic, contactEmail: guestSpeakers.contactEmail, status: guestSpeakers.status, notes: guestSpeakers.notes })
    .from(guestSpeakers)
    .where(isNull(guestSpeakers.deletedAt))
    .orderBy(desc(guestSpeakers.createdAt));

  return <GuestSpeakers speakers={rows as SpeakerItem[]} />;
}

async function CorporateAffairsCampaigns() {
  const db = getDb();
  const rows = await db
    .select({ id: campaigns.id, title: campaigns.title, channel: campaigns.channel, status: campaigns.status, startDate: campaigns.startDate, notes: campaigns.notes })
    .from(campaigns)
    .where(isNull(campaigns.deletedAt))
    .orderBy(desc(campaigns.createdAt));

  const items: CampaignItem[] = rows.map((r) => ({ ...r, startDate: r.startDate ? r.startDate.toISOString() : null }));
  return <MarketingCampaigns campaigns={items} />;
}

async function TrainingCoordinatorMentorship() {
  const db = getDb();
  const rows = await db
    .select({ id: mentorships.id, mentorName: mentorships.mentorName, topic: mentorships.topic, status: mentorships.status, notes: mentorships.notes, menteeName: members.fullName })
    .from(mentorships)
    .innerJoin(members, eq(mentorships.menteeId, members.id))
    .where(isNull(mentorships.deletedAt))
    .orderBy(desc(mentorships.createdAt));

  const memberOptions = await getMemberOptions();
  return <Mentorship mentorships={rows as MentorshipItem[]} memberOptions={memberOptions} />;
}

async function TrainingCoordinatorAssignments() {
  const db = getDb();
  const rows = await db
    .select({ id: trainingAssignments.id, title: trainingAssignments.title, description: trainingAssignments.description, topic: trainingAssignments.topic, dueDate: trainingAssignments.dueDate })
    .from(trainingAssignments)
    .where(isNull(trainingAssignments.deletedAt))
    .orderBy(desc(trainingAssignments.createdAt));

  const items: AssignmentItem[] = rows.map((r) => ({ ...r, dueDate: r.dueDate ? r.dueDate.toISOString() : null }));
  return <Assignments assignments={items} />;
}

async function MembershipOfficerTeams() {
  const db = getDb();
  const teamRows = await db
    .select({ id: teams.id, name: teams.name, description: teams.description, leadName: members.fullName })
    .from(teams)
    .leftJoin(members, eq(teams.leadId, members.id))
    .where(isNull(teams.deletedAt));

  const memberRows = await db
    .select({ teamId: teamMembers.teamId, memberName: members.fullName })
    .from(teamMembers)
    .innerJoin(members, eq(teamMembers.memberId, members.id));

  const namesByTeam = new Map<string, string[]>();
  for (const r of memberRows) {
    const list = namesByTeam.get(r.teamId) ?? [];
    list.push(r.memberName);
    namesByTeam.set(r.teamId, list);
  }

  const items: TeamItem[] = teamRows.map((t) => ({ ...t, memberNames: namesByTeam.get(t.id) ?? [] }));
  const memberOptions = await getMemberOptions();
  return <Teams teams={items} memberOptions={memberOptions} />;
}

async function MembershipOfficerVolunteers() {
  const db = getDb();
  const rows = await db
    .select({ id: volunteerLogs.id, activity: volunteerLogs.activity, hours: volunteerLogs.hours, loggedDate: volunteerLogs.loggedDate, memberName: members.fullName })
    .from(volunteerLogs)
    .innerJoin(members, eq(volunteerLogs.memberId, members.id))
    .where(isNull(volunteerLogs.deletedAt))
    .orderBy(desc(volunteerLogs.loggedDate));

  const items: VolunteerLogItem[] = rows.map((r) => ({ ...r, loggedDate: r.loggedDate.toISOString() }));
  const memberOptions = await getMemberOptions();
  return <Volunteers logs={items} memberOptions={memberOptions} />;
}

async function MembershipOfficerEngagementAnalytics() {
  const db = getDb();
  const [totalMembers, communityRows, totalRegs, allTasks] = await Promise.all([
    db.select({ id: members.id }).from(members).where(isNull(members.deletedAt)).then((r) => r.length),
    db.select({ communitySlug: memberCommunities.communitySlug }).from(memberCommunities),
    db.select({ id: eventRegistrations.id }).from(eventRegistrations).then((r) => r.length),
    db.select({ status: tasks.status }).from(tasks).where(isNull(tasks.deletedAt)),
  ]);

  const counts = new Map<string, number>();
  for (const c of communityRows) counts.set(c.communitySlug, (counts.get(c.communitySlug) ?? 0) + 1);
  const communityBreakdown = Array.from(counts.entries())
    .map(([slug, memberCount]) => ({ name: COMMUNITIES.find((c) => c.slug === slug)?.name ?? slug, memberCount }))
    .sort((a, b) => b.memberCount - a.memberCount);

  const data: EngagementData = {
    totalMembers,
    communityBreakdown,
    totalEventRegistrations: totalRegs,
    totalTasksCompleted: allTasks.filter((t) => t.status === "done").length,
    totalTasks: allTasks.length,
  };
  return <EngagementAnalytics data={data} />;
}

async function ViceChairpersonRiskTracker() {
  const db = getDb();
  const rows = await db
    .select({ id: risks.id, title: risks.title, description: risks.description, severity: risks.severity, status: risks.status, mitigation: risks.mitigation })
    .from(risks)
    .where(isNull(risks.deletedAt))
    .orderBy(desc(risks.createdAt));

  return <RiskTracker risks={rows as RiskItem[]} />;
}

export default async function DashboardCatchAllPage({ params }: DashboardCatchAllProps) {
  const { slug } = await params;

  // /dashboard/{sharedSlug} — visible to any exec/admin (layout already gates that).
  if (slug.length === 1) {
    const item = SHARED_NAV_ITEMS.find((i) => i.slug === slug[0]);
    if (!item) notFound();

    switch (slug[0]) {
      case "calendar":
        return <SharedCalendar />;
      case "announcements":
        return <SharedAnnouncements />;
      case "chat":
        return <SharedChat />;
      case "tasks":
        return <SharedTasks />;
      case "documents":
        return <SharedDocuments />;
      case "committee-activity":
        return <SharedCommitteeActivity />;
      default:
        return <ComingSoon label={item.label} />;
    }
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
    if (execTitleParam === "treasurer" && sectionSlug === "budget-planner") {
      return <TreasurerBudget />;
    }
    if (execTitleParam === "corporate_affairs" && sectionSlug === "sponsor-database") {
      return <CorporateAffairsSponsors />;
    }
    if (execTitleParam === "membership_officer" && sectionSlug === "member-directory") {
      return <MembershipOfficerDirectory />;
    }
    if (
      (execTitleParam === "membership_officer" ||
        execTitleParam === "chairperson" ||
        execTitleParam === "vice_chairperson" ||
        execTitleParam === "patron") &&
      sectionSlug === "registration-requests"
    ) {
      const memberRows = await getDb()
        .select({
          id: members.id,
          fullName: members.fullName,
          email: members.email,
          role: members.role,
          execTitle: members.execTitle,
          studentId: members.studentId,
          campus: members.campus,
          isChiromo: members.isChiromo,
          course: members.course,
          yearOfStudy: members.yearOfStudy,
          phoneNumber: members.phoneNumber,
          authProvider: members.authProvider,
          membershipStatus: members.membershipStatus,
          membershipFeeStatus: members.membershipFeeStatus,
          feeAmountPaid: members.feeAmountPaid,
          mpesaReference: members.mpesaReference,
          createdAt: members.createdAt,
        })
        .from(members)
        .where(isNull(members.deletedAt))
        .orderBy(desc(members.createdAt));

      const communityRows = await getDb()
        .select({ memberId: memberCommunities.memberId, communitySlug: memberCommunities.communitySlug })
        .from(memberCommunities);

      const communitiesByMember = new Map<string, string[]>();
      for (const c of communityRows) {
        const list = communitiesByMember.get(c.memberId) ?? [];
        list.push(c.communitySlug);
        communitiesByMember.set(c.memberId, list);
      }

      const items = memberRows.map((row) => ({
        ...row,
        status: (row.membershipStatus as any) || (row.role === "visitor" ? "pending" : "approved"),
        isChiromo: row.isChiromo ?? true,
        feeAmountPaid: row.feeAmountPaid ?? 0,
        communitySlugs: communitiesByMember.get(row.id) ?? [],
        createdAt: row.createdAt ? row.createdAt.toISOString() : undefined,
      }));

      return (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">Member Approvals & Applications</h2>
            <p className="text-xs text-muted">Review, verify student profiles, track fee deposits, and approve official members.</p>
          </div>
          <MembersTable members={items} />
        </div>
      );
    }
    if (execTitleParam === "training_coordinator" && sectionSlug === "resource-library") {
      return <TrainingCoordinatorResources />;
    }
    if (execTitleParam === "treasurer" && sectionSlug === "income-tracker") {
      return <TreasurerIncomeTracker />;
    }
    if (execTitleParam === "treasurer" && sectionSlug === "expense-tracker") {
      return <TreasurerExpenseTracker />;
    }
    if (execTitleParam === "treasurer" && sectionSlug === "financial-reports") {
      return <TreasurerFinancialReports />;
    }
    if (execTitleParam === "secretary_general" && sectionSlug === "decision-log") {
      return <SecretaryGeneralDecisionLog />;
    }
    if (execTitleParam === "secretary_general" && sectionSlug === "document-repository") {
      // Same underlying data/component as the Shared "Recent Documents" page —
      // just reachable from the Secretary General's own nav too.
      return <SharedDocuments />;
    }

    // --- Easy batch: reuse of existing tools under a role-appropriate label/filter ---
    if (execTitleParam === "chairperson" && sectionSlug === "executive-tasks") {
      return <SharedTasks />;
    }
    if (execTitleParam === "chairperson" && sectionSlug === "activity-timeline") {
      return <SharedCommitteeActivity />;
    }
    if (execTitleParam === "chairperson" && sectionSlug === "financial-summary") {
      return <TreasurerFinancialReports />;
    }
    if (execTitleParam === "chairperson" && sectionSlug === "policy-documents") {
      return <SharedDocuments category="Policy" title="Policy Documents" showForm />;
    }
    if (execTitleParam === "chairperson" && sectionSlug === "official-letters") {
      return <SharedDocuments category="Letters" title="Official Letters" showForm />;
    }
    if (execTitleParam === "vice_chairperson" && sectionSlug === "task-assignments") {
      return <SharedTasks />;
    }
    if (execTitleParam === "vice_chairperson" && sectionSlug === "approvals-waiting") {
      return <SecretaryGeneralDecisionLog statusFilter="proposed" />;
    }
    if (execTitleParam === "secretary_general" && sectionSlug === "letters") {
      return <SharedDocuments category="Letters" title="Letters" showForm />;
    }
    if (execTitleParam === "secretary_general" && sectionSlug === "archive") {
      return <SharedDocuments title="Archive" showForm={false} />;
    }
    if (execTitleParam === "secretary_general" && sectionSlug === "document-search") {
      return <SharedDocuments title="Document Search" showSearch showForm={false} />;
    }
    if (execTitleParam === "treasurer" && sectionSlug === "sponsors") {
      return <CorporateAffairsSponsors />;
    }
    if (execTitleParam === "corporate_affairs" && sectionSlug === "partner-crm") {
      return <CorporateAffairsSponsors />;
    }
    if (execTitleParam === "corporate_affairs" && sectionSlug === "press-releases") {
      return <SharedDocuments category="Press Release" title="Press Releases" showForm />;
    }
    if (execTitleParam === "training_coordinator" && sectionSlug === "workshop-calendar") {
      return <SharedCalendar />;
    }
    if (execTitleParam === "training_coordinator" && sectionSlug === "feedback") {
      return <SharedChat />;
    }
    if (execTitleParam === "membership_officer" && sectionSlug === "events-participation") {
      return <MembershipOfficerEventsParticipation />;
    }

    // --- Medium batch ---
    if (execTitleParam === "vice_chairperson" && sectionSlug === "project-tracker") {
      return <ViceChairpersonInitiatives />;
    }
    if (execTitleParam === "vice_chairperson" && sectionSlug === "meeting-followups") {
      return <SharedTasks />;
    }
    if (execTitleParam === "vice_chairperson" && sectionSlug === "cross-committee") {
      return <SharedChat />;
    }
    if (execTitleParam === "vice_chairperson" && sectionSlug === "progress-timeline") {
      return <SharedCalendar />;
    }
    if (execTitleParam === "secretary_general" && (sectionSlug === "meeting-scheduler" || sectionSlug === "agenda-builder")) {
      return <SecretaryGeneralMinutes />;
    }
    if (execTitleParam === "secretary_general" && sectionSlug === "attendance-register") {
      return <SecretaryGeneralAttendanceRegister />;
    }
    if (execTitleParam === "treasurer" && sectionSlug === "invoices") {
      return <TreasurerInvoices />;
    }
    if (execTitleParam === "treasurer" && sectionSlug === "grant-applications") {
      return <TreasurerGrantApplications />;
    }
    if (execTitleParam === "corporate_affairs" && (sectionSlug === "event-manager" || sectionSlug === "social-calendar")) {
      return sectionSlug === "event-manager" ? <CorporateAffairsEventManager /> : <SharedCalendar />;
    }

    // --- This batch ---
    if (execTitleParam === "chairperson" && sectionSlug === "committee-reports") {
      return <SharedCommitteeActivity />;
    }
    if (execTitleParam === "chairperson" && sectionSlug === "meeting-approvals") {
      return <ChairpersonDecisions />;
    }
    if (execTitleParam === "chairperson" && sectionSlug === "signature-queue") {
      return <SharedDocuments category="Needs Signature" title="Signature Queue" showForm />;
    }
    if (execTitleParam === "chairperson" && sectionSlug === "org-health") {
      return <ChairpersonOrgHealth />;
    }
    if (execTitleParam === "treasurer" && sectionSlug === "approval-workflow") {
      return <SecretaryGeneralDecisionLog statusFilter="proposed" />;
    }
    if (execTitleParam === "treasurer" && sectionSlug === "financial-charts") {
      return <TreasurerFinancialCharts />;
    }
    if (execTitleParam === "corporate_affairs" && sectionSlug === "guest-speakers") {
      return <CorporateAffairsGuestSpeakers />;
    }
    if (execTitleParam === "corporate_affairs" && sectionSlug === "marketing-campaigns") {
      return <CorporateAffairsCampaigns />;
    }
    if (execTitleParam === "training_coordinator" && sectionSlug === "mentorship") {
      return <TrainingCoordinatorMentorship />;
    }
    if (execTitleParam === "training_coordinator" && sectionSlug === "assignments") {
      return <TrainingCoordinatorAssignments />;
    }
    if (execTitleParam === "membership_officer" && sectionSlug === "teams") {
      return <MembershipOfficerTeams />;
    }
    if (execTitleParam === "membership_officer" && sectionSlug === "volunteers") {
      return <MembershipOfficerVolunteers />;
    }
    if (execTitleParam === "membership_officer" && sectionSlug === "engagement-analytics") {
      return <MembershipOfficerEngagementAnalytics />;
    }

    // --- Wrap-up batch: 1 new tool + 7 honest reuses (see chat notes for what's deliberately still deferred) ---
    if (execTitleParam === "vice_chairperson" && sectionSlug === "risk-tracker") {
      return <ViceChairpersonRiskTracker />;
    }
    if (execTitleParam === "chairperson" && sectionSlug === "strategic-analytics") {
      return <MembershipOfficerEngagementAnalytics />;
    }
    if (execTitleParam === "chairperson" && sectionSlug === "executive-performance") {
      return <ChairpersonOrgHealth />;
    }
    if (execTitleParam === "treasurer" && sectionSlug === "receipt-manager") {
      return <SharedDocuments category="Receipts" title="Receipt Manager" showForm />;
    }
    if (execTitleParam === "corporate_affairs" && sectionSlug === "media-library") {
      return <SharedDocuments category="Media" title="Media Library" showForm />;
    }
    if (execTitleParam === "corporate_affairs" && sectionSlug === "brand-assets") {
      return <SharedDocuments category="Brand Assets" title="Brand Assets" showForm />;
    }
    if (execTitleParam === "membership_officer" && sectionSlug === "attendance") {
      return <MembershipOfficerEventsParticipation />;
    }
    if (execTitleParam === "membership_officer" && sectionSlug === "feedback") {
      return <SharedChat />;
    }

    const item = EXEC_NAV[execTitleParam].find((i) => i.slug === sectionSlug);
    if (!item) notFound();
    return <ComingSoon label={`${EXEC_TITLE_LABELS[execTitleParam]} — ${item.label}`} />;
  }

  notFound();
}
