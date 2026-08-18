import { notFound, redirect } from "next/navigation";
import { getQuestDetail } from "@/lib/academy/queries";
import { getAuthUserId } from "@/lib/supabase/auth-helpers"; // ← adjust to your auth helper
import { QuestStepList } from "@/components/academy/QuestStepList";

export default async function QuestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const memberId = await getAuthUserId();
  if (!memberId) {
    redirect(`/sign-in?redirect_url=/academy/${slug}`);
  }

  const data = await getQuestDetail(slug, memberId);
  if (!data || !data.quest.isPublished) return notFound();

  const { quest, steps, progress } = data;

  return (
    <div className="min-h-screen bg-cream">
      <section className="mx-auto max-w-2xl px-4 pt-14 pb-8">
        <p className="text-subheading-sm uppercase tracking-widest text-sky">{quest.topic}</p>
        <h1 className="mt-2 font-display text-title-h4 text-text">{quest.title}</h1>
        <p className="mt-3 text-paragraph-md text-text-2">{quest.description}</p>
        <p className="mt-2 text-label-sm text-sky">{quest.pointsReward} points on completion</p>
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-20">
        <QuestStepList questSlug={quest.slug} steps={steps} currentStepOrder={progress?.currentStepOrder ?? 0} />
      </section>
    </div>
  );
}