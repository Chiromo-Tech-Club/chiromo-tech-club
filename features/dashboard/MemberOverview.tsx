import { and, desc, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { events, eventRegistrations, projects, announcements, members } from "@/lib/drizzle/schema";
import type { Member } from "@/types/member";
import { WelcomeCard } from "@/features/dashboard/WelcomeCard";
import { MyCommunitiesWidget } from "@/features/dashboard/MyCommunitiesWidget";
import { UpcomingEventsWidget, type UpcomingEventItem } from "@/features/dashboard/UpcomingEventsWidget";
import { CommunityProjectsWidget, type CommunityProjectItem } from "@/features/dashboard/CommunityProjectsWidget";
import { AnnouncementsWidget, type AnnouncementItem } from "@/features/dashboard/AnnouncementsWidget";
import { MemberQuickActions } from "@/features/dashboard/MemberQuickActions";

async function getMemberOverviewData(member: Member) {
  const db = getDb();
  const now = new Date();

  const upcomingEvents = await db
    .select({ id: events.id, title: events.title, startsAt: events.startsAt, location: events.location })
    .from(events)
    .where(gte(events.startsAt, now))
    .orderBy(events.startsAt)
    .limit(5);

  const myRegistrations = await db
    .select({ eventId: eventRegistrations.eventId })
    .from(eventRegistrations)
    .where(sql`${eventRegistrations.memberId} = ${member.id}`);

  const communityProjects =
    member.communitySlugs.length === 0
      ? []
      : await db
          .select({
            slug: projects.slug,
            title: projects.title,
            description: projects.description,
            communitySlug: projects.communitySlug,
            stars: projects.stars,
          })
          .from(projects)
          .where(and(isNull(projects.deletedAt), inArray(projects.communitySlug, member.communitySlugs)))
          .orderBy(desc(projects.createdAt))
          .limit(4);

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
    upcomingEvents: upcomingEvents.map<UpcomingEventItem>((e) => ({
      id: e.id,
      title: e.title,
      startsAt: e.startsAt.toISOString(),
      location: e.location,
    })),
    registeredEventIds: myRegistrations.map((r) => r.eventId),
    communityProjects: communityProjects as CommunityProjectItem[],
    recentAnnouncements: recentAnnouncements.map<AnnouncementItem>((a) => ({
      id: a.id,
      title: a.title,
      body: a.body,
      authorName: a.authorName,
      createdAt: a.createdAt.toISOString(),
    })),
  };
}

export async function MemberOverview({ member }: { member: Member }) {
  const data = await getMemberOverviewData(member);

  return (
    <div className="flex flex-col gap-6">
      <WelcomeCard fullName={member.fullName} execTitle={null} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MyCommunitiesWidget communitySlugs={member.communitySlugs} />
        <UpcomingEventsWidget events={data.upcomingEvents} registeredEventIds={data.registeredEventIds} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CommunityProjectsWidget projects={data.communityProjects} />
        <AnnouncementsWidget announcements={data.recentAnnouncements} />
      </div>

      <MemberQuickActions />
    </div>
  );
}
