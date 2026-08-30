import { and, desc, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import Link from "next/link";
import { 
  Trophy, 
  Sparkles, 
  GraduationCap, 
  Building2, 
  CreditCard, 
  ArrowRight, 
  Flame, 
  CheckCircle2, 
  BookOpen, 
  Award,
  Code2
} from "lucide-react";
import { getDb } from "@/lib/drizzle/client";
import { events, eventRegistrations, projects, announcements, members } from "@/lib/drizzle/schema";
import { academyUserProgress, academyQuests, academyUserBadges, academyBadges } from "@/lib/drizzle/schema.academy";
import type { Member } from "@/types/member";
import { WelcomeCard } from "@/features/dashboard/WelcomeCard";
import { MyCommunitiesWidget } from "@/features/dashboard/MyCommunitiesWidget";
import { UpcomingEventsWidget, type UpcomingEventItem } from "@/features/dashboard/UpcomingEventsWidget";
import { CommunityProjectsWidget, type CommunityProjectItem } from "@/features/dashboard/CommunityProjectsWidget";
import { AnnouncementsWidget, type AnnouncementItem } from "@/features/dashboard/AnnouncementsWidget";
import { MemberQuickActions } from "@/features/dashboard/MemberQuickActions";
import { ROUTES } from "@/constants/routes";

async function getMemberOverviewData(member: Member) {
  const db = getDb();
  const now = new Date();

  // 1. Upcoming events
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

  // 2. Community projects
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

  // 3. Announcements
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

  // 4. Academy Progress & Gamification data
  let academyData = {
    totalPoints: 0,
    questsCompleted: 0,
    totalQuests: 4,
    badgeCount: 0,
    recentBadges: [] as string[],
  };

  try {
    const progressRows = await db
      .select({
        pointsEarned: academyUserProgress.pointsEarned,
        status: academyUserProgress.status,
      })
      .from(academyUserProgress)
      .where(eq(academyUserProgress.memberId, member.id));

    const [questCountRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(academyQuests)
      .where(eq(academyQuests.isPublished, true));

    const badges = await db
      .select({ title: academyBadges.title })
      .from(academyUserBadges)
      .innerJoin(academyBadges, eq(academyUserBadges.badgeId, academyBadges.id))
      .where(eq(academyUserBadges.memberId, member.id))
      .limit(3);

    const totalPoints = progressRows.reduce((sum, p) => sum + (p.pointsEarned ?? 0), 0);
    const questsCompleted = progressRows.filter((p) => p.status === "completed").length;

    academyData = {
      totalPoints,
      questsCompleted,
      totalQuests: Number(questCountRow?.count ?? 4),
      badgeCount: badges.length,
      recentBadges: badges.map((b) => b.title),
    };
  } catch (err) {
    console.error("Failed to load academy stats for member:", err);
  }

  // 5. Full member registration details
  const [memberDetail] = await db
    .select({
      studentId: members.studentId,
      campus: members.campus,
      isChiromo: members.isChiromo,
      course: members.course,
      yearOfStudy: members.yearOfStudy,
      membershipStatus: members.membershipStatus,
      membershipFeeStatus: members.membershipFeeStatus,
      feeAmountPaid: members.feeAmountPaid,
      mpesaReference: members.mpesaReference,
      authProvider: members.authProvider,
    })
    .from(members)
    .where(eq(members.id, member.id))
    .limit(1);

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
    academy: academyData,
    profile: memberDetail,
  };
}

export async function MemberOverview({ member }: { member: Member }) {
  const data = await getMemberOverviewData(member);
  const profile = data.profile;
  const academy = data.academy;

  const isApproved = profile?.membershipStatus === "approved" || member.role === "member" || member.role === "exec" || member.role === "admin";
  const isChiromo = profile?.isChiromo ?? true;

  // Compute Gamification Level based on points
  const currentLevel = Math.floor(academy.totalPoints / 200) + 1;
  const nextLevelPoints = currentLevel * 200;
  const levelProgress = Math.min(100, Math.round(((academy.totalPoints % 200) / 200) * 100));

  return (
    <div className="flex flex-col gap-6">
      {/* Top Welcome Card */}
      <WelcomeCard fullName={member.fullName} execTitle={null} />

      {/* Member Digital ID & Academy Gamification Spotlight Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Digital Membership ID Card */}
        <div className="relative overflow-hidden rounded-3xl border border-line/80 bg-gradient-to-br from-surface via-surface to-cream/40 p-6 shadow-md backdrop-blur-md lg:col-span-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block rounded-full bg-navy/10 px-3 py-1 text-[11px] font-extrabold tracking-wider text-navy uppercase">
                Official CTC Member Card
              </span>
              <h3 className="mt-2 font-display text-xl font-extrabold text-ink">{member.fullName}</h3>
              <p className="text-xs text-muted font-mono">{member.email}</p>
            </div>

            <div className="text-right">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                isApproved 
                  ? "bg-green/10 text-green ring-1 ring-green/20" 
                  : "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20"
              }`}>
                <CheckCircle2 size={12} />
                {isApproved ? "Verified Member" : "Application Pending"}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line/60 pt-4 text-xs">
            <div>
              <span className="text-[11px] text-muted flex items-center gap-1">
                <GraduationCap size={13} className="text-sky" /> Student Reg No.
              </span>
              <p className="mt-0.5 font-mono font-bold text-ink">
                {profile?.studentId || "Complete in Registration"}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-muted flex items-center gap-1">
                <Building2 size={13} className="text-green" /> Home Campus
              </span>
              <p className="mt-0.5 font-bold text-ink">
                {profile?.campus || (isChiromo ? "Chiromo Campus (Jerome)" : "Main Campus")}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-muted flex items-center gap-1">
                <BookOpen size={13} className="text-navy" /> Course & Year
              </span>
              <p className="mt-0.5 font-medium text-ink">
                {profile?.course || "Computing & Sciences"} {profile?.yearOfStudy ? `• ${profile.yearOfStudy}` : ""}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-muted flex items-center gap-1">
                <CreditCard size={13} className="text-sky" /> Fee Status
              </span>
              <p className="mt-0.5 font-bold text-green font-mono">
                {profile?.membershipFeeStatus === "fully_paid"
                  ? "500 KES (Full Paid)"
                  : profile?.membershipFeeStatus === "deposit_paid"
                  ? "250 KES (Deposit Active)"
                  : "Flexible / Pay Later"}
              </p>
            </div>
          </div>

          {!profile?.studentId && (
            <div className="mt-4 rounded-xl border border-sky/20 bg-sky/5 p-3 flex items-center justify-between">
              <span className="text-xs text-sky font-medium">Complete progressive registration for official badge</span>
              <Link href={ROUTES.register} className="text-xs font-bold text-sky hover:underline flex items-center gap-1">
                Register Now <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>

        {/* Academy & Interactive Puzzle Hub Tracker */}
        <div className="relative overflow-hidden rounded-3xl border border-line/80 bg-surface p-6 shadow-md backdrop-blur-md lg:col-span-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky/15 text-sky">
                <Sparkles size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky">Gamified Learning</span>
                <h3 className="font-display text-base font-extrabold text-ink">CTC Academy & Puzzles</h3>
              </div>
            </div>

            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-700">
              <Flame size={14} className="text-amber-500 fill-amber-500" /> Level {currentLevel}
            </span>
          </div>

          {/* XP and Level Bar */}
          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-ink flex items-center gap-1">
                <Trophy size={14} className="text-sky" /> {academy.totalPoints} XP Earned
              </span>
              <span className="font-mono text-xs text-muted">
                {nextLevelPoints - academy.totalPoints > 0 ? `${nextLevelPoints - academy.totalPoints} XP to Level ${currentLevel + 1}` : "Max Level"}
              </span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-line/50">
              <div
                className="h-full bg-gradient-to-r from-sky via-cyan-400 to-navy transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>

          {/* Academy Metrics */}
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-line bg-cream/40 p-3">
              <span className="text-[10px] uppercase font-bold text-muted">Quests Done</span>
              <p className="font-display text-lg font-bold text-ink">
                {academy.questsCompleted} / {academy.totalQuests}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-cream/40 p-3">
              <span className="text-[10px] uppercase font-bold text-muted">Badges</span>
              <p className="font-display text-lg font-bold text-ink flex items-center justify-center gap-1">
                <Award size={15} className="text-amber-500" /> {academy.badgeCount}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-cream/40 p-3">
              <span className="text-[10px] uppercase font-bold text-muted">Puzzles</span>
              <p className="font-display text-lg font-bold text-green font-mono">
                Interactive
              </p>
            </div>
          </div>

          <div className="mt-5">
            <Link
              href={ROUTES.academy}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-navy py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-navy/90"
            >
              <Code2 size={15} /> Jump into Interactive Puzzles & Quests
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

      </div>

      {/* Communities & Events */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MyCommunitiesWidget communitySlugs={member.communitySlugs} />
        <UpcomingEventsWidget events={data.upcomingEvents} registeredEventIds={data.registeredEventIds} />
      </div>

      {/* Projects & Announcements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CommunityProjectsWidget projects={data.communityProjects} />
        <AnnouncementsWidget announcements={data.recentAnnouncements} />
      </div>

      {/* Quick Actions */}
      <MemberQuickActions />
    </div>
  );
}
