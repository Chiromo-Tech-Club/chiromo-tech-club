import Link from "next/link";
import { redirect } from "next/navigation";
import { getAcademyHomeData } from "@/lib/academy/queries";
import { getAuthUserId } from "@/lib/supabase/auth-helpers";
import { QuestTrail } from "@/components/academy/QuestTrail";
import { ProgressSummary } from "@/components/academy/Progresssummary";
import { InteractivePuzzleEngine } from "@/components/academy/InteractivePuzzleEngine";
import { Trophy, Flame, Sparkles, Code2, Gamepad2 } from "lucide-react";

export const metadata = {
  title: "Academy & Interactive Puzzles | Chiromo Tech Club",
  description: "Gamified learning quests, interactive algorithm puzzles, and hands-on coding challenges for Chiromo Tech Club members.",
};

export default async function AcademyPage() {
  const memberId = await getAuthUserId();
  if (!memberId) {
    redirect("/sign-in?redirect_url=/academy");
  }

  const { trail, totalPoints, questsCompleted, totalQuests, badges } = await getAcademyHomeData(memberId);

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Hero Banner */}
      <section className="mx-auto max-w-4xl px-4 pt-14 pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky/30 bg-sky/10 px-4 py-1 text-xs font-bold text-sky">
          <Gamepad2 size={14} /> Gamified Learning & Interactive Puzzles
        </div>
        
        <h1 className="mt-4 font-display text-3xl font-extrabold text-ink sm:text-5xl">
          Level up your skills, <span className="text-sky">one puzzle at a time</span>
        </h1>
        
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-2 sm:text-base">
          Solve interactive logic riddles, fix subtle algorithmic bugs, write LeetCode solutions, and unlock exclusive Chiromo badges.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/academy/leaderboard"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2 text-xs font-bold text-ink shadow-sm transition-all hover:bg-cream-2 hover:shadow-md"
          >
            <Trophy size={14} className="text-amber-500" /> View Leaderboard
          </Link>
          <a
            href="#daily-puzzle"
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-navy/90"
          >
            <Sparkles size={14} /> Daily Puzzle Challenge
          </a>
        </div>
      </section>

      {/* Progress & Streak Bar */}
      <div className="mx-auto max-w-4xl px-4">
        <ProgressSummary
          totalPoints={totalPoints}
          questsCompleted={questsCompleted}
          totalQuests={totalQuests}
          badgeCount={badges.length}
        />
      </div>

      {/* Daily Puzzle Section */}
      <section id="daily-puzzle" className="mx-auto mt-10 max-w-4xl px-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-amber-500 fill-amber-500" />
            <h2 className="font-display text-lg font-bold text-ink">Daily Interactive Challenge</h2>
          </div>
          <span className="text-xs text-muted font-medium">New puzzle every 24h</span>
        </div>

        <InteractivePuzzleEngine />
      </section>

      {/* Quest Trail Section */}
      <section className="mx-auto mt-14 max-w-4xl px-4">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-sky">Learning Tracks</span>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-ink sm:text-3xl">The Quest Trail</h2>
          <p className="text-xs text-muted mt-1">Complete quests in sequence to unlock advanced modules</p>
        </div>

        <QuestTrail trail={trail} />
      </section>
    </div>
  );
}
