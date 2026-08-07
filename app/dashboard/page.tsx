import { Users, CalendarCheck, FolderKanban, Megaphone as MegaphoneIcon } from "lucide-react";
import { desc, gte, isNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { members, events, projects, announcements } from "@/lib/drizzle/schema";
import { getCurrentMember } from "@/lib/clerk/get-current-user";
import { WelcomeCard } from "@/features/dashboard/WelcomeCard";
import { StatCard } from "@/features/dashboard/StatCard";
import { UpcomingEventsWidget, type UpcomingEventItem } from "@/features/dashboard/UpcomingEventsWidget";
import { AnnouncementsWidget, type AnnouncementItem } from "@/features/dashboard/AnnouncementsWidget";
import { ComingSoon } from "@/components/dashboard/ComingSoon";

async function getOverviewData() {
  const db = getDb();
  const now = new Date();

  const [memberCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(members)
    .where(isNull(members.deletedAt));

  const [eventCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(events)
    .where(isNull(events.deletedAt));

  const [projectCountRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(projects)
    .where(isNull(projects.deletedAt));

  const upcomingEvents = await db
    .select({ id: events.id, title: events.title, startsAt: events.startsAt, location: events.location })
    .from(events)
    .where(gte(events.startsAt, now))
    .orderBy(events.startsAt)
    .limit(3);

  const recentAnnouncements = await db
    .select({
      id: announcements.id,
      title: announcements.title,
      body: announcements.body,
      createdAt: announcements.createdAt,
      authorName: members.fullName,
    })
    .from(announcements)
    .innerJoin(members, sql`${announcements.authorId} = ${members.id}`)
    .where(isNull(announcements.deletedAt))
    .orderBy(desc(announcements.createdAt))
    .limit(3);

  return {
    memberCount: Number(memberCountRow?.count ?? 0),
    eventCount: Number(eventCountRow?.count ?? 0),
    projectCount: Number(projectCountRow?.count ?? 0),
    upcomingEvents: upcomingEvents.map<UpcomingEventItem>((e) => ({
      id: e.id,
      title: e.title,
      startsAt: e.startsAt.toISOString(),
      location: e.location,
    })),
    recentAnnouncements: recentAnnouncements.map<AnnouncementItem>((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      authorName: a.authorName,
      createdAt: a.createdAt.toISOString(),
    })),
  };
}

export default async function DashboardOverviewPage() {
  const member = await getCurrentMember();
  const data = await getOverviewData();

  return (
    <div className="flex w-full flex-col gap-4 sm:gap-6">
      <WelcomeCard fullName={member?.fullName ?? "there"} execTitle={member?.execTitle ?? null} />

      {/* Stats grid: 1 col on phones, 2 on tablets, 4 on desktop */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Members" value={data.memberCount} icon={Users} />
        <StatCard label="Upcoming Events" value={data.eventCount} icon={CalendarCheck} />
        <StatCard label="Active Projects" value={data.projectCount} icon={FolderKanban} />
        <StatCard label="Announcements" value={data.recentAnnouncements.length} icon={MegaphoneIcon} />
      </div>

      {/* Main widgets: stack on mobile, 2 columns on lg+ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <UpcomingEventsWidget events={data.upcomingEvents} />
        <AnnouncementsWidget announcements={data.recentAnnouncements} />
      </div>

      {/* Secondary widgets: stack on mobile, 3 columns on lg+ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <ComingSoon label="Quick Actions" />
        <ComingSoon label="Task List" />
        <ComingSoon label="Committee Activity Feed" />
      </div>
    </div>
  );
}