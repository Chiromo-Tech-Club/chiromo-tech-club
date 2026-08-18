import { getLeaderboard } from "@/lib/academy/queries";
import { getAuthUserId } from "@/lib/supabase/auth-helpers"; // ← adjust to your auth helper
import { LeaderboardTable } from "@/components/academy/Leaderboardtable";

export default async function LeaderboardPage() {
  const [memberId, rows] = await Promise.all([getAuthUserId(), getLeaderboard(20)]);

  return (
    <div className="min-h-screen bg-cream px-4 py-16">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-subheading-sm uppercase tracking-widest text-sky">Academy</p>
        <h1 className="mt-2 font-display text-title-h4 text-text">Leaderboard</h1>
        <p className="mt-2 text-paragraph-sm text-text-2">Top learners across the club, ranked by points earned.</p>
      </div>
      <div className="mt-10">
        <LeaderboardTable rows={rows} currentMemberId={memberId ?? undefined} />
      </div>
    </div>
  );
}