import Link from "next/link";
import { redirect } from "next/navigation";
import { getAcademyHomeData } from "@/lib/academy/queries";
import { getAuthUserId } from "@/lib/supabase/auth-helpers"; // ← adjust to your auth helper
import { QuestTrail } from "@/components/academy/QuestTrail";
import { ProgressSummary } from "@/components/academy/Progresssummary";

export default async function AcademyPage() {
  const memberId = await getAuthUserId();
  if (!memberId) {
    redirect("/sign-in?redirect_url=/academy");
  }

  const { trail, totalPoints, questsCompleted, totalQuests, badges } = await getAcademyHomeData(memberId);

  return (
    <div className="min-h-screen bg-cream">
      <section className="mx-auto max-w-2xl px-4 pt-16 pb-10 text-center">
        <p className="text-subheading-sm uppercase tracking-widest text-sky">Chiromo Tech Club Academy</p>
        <h1 className="mt-3 font-display text-title-h3 text-text">
          Level up your skills, <span className="text-sky">one quest at a time</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-paragraph-md text-text-2">
          Work through hands-on quests, earn points, unlock badges, and see how you stack up against the rest of the
          club.
        </p>
        <Link
          href="/academy/leaderboard"
          className="mt-6 inline-block rounded-pill border border-line-strong px-5 py-2 text-label-sm text-text-2 transition-colors hover:bg-cream-2"
        >
          View leaderboard →
        </Link>
      </section>

      <div className="px-4">
        <ProgressSummary
          totalPoints={totalPoints}
          questsCompleted={questsCompleted}
          totalQuests={totalQuests}
          badgeCount={badges.length}
        />
      </div>

      <section className="px-4 py-14">
        <QuestTrail trail={trail} />
      </section>
    </div>
  );
}