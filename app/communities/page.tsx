import Link from "next/link";
import { COMMUNITIES } from ".././../data/communities";
import { ROUTES } from ".././../constants/routes";
import { TiltCard } from ".././../components/animations/TiltCard";
import { RevealOnScroll } from ".././../components/animations/RevealOnScroll";

export const metadata = { title: "Communities" };

export default function CommunitiesPage() {
  return (
    <main className="mx-auto max-w-[1280px] px-8 pb-24 pt-40">
      <RevealOnScroll className="max-w-[640px]">
        <div className="mb-5 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.18em] text-accent">
          <span className="h-px w-4 bg-accent" />
          Communities
        </div>
        <h1 className="font-display text-[clamp(32px,4.4vw,52px)] font-medium leading-[1.02] tracking-[-0.02em]">
          Eight disciplines. One club.
        </h1>
        <p className="mt-4.5 max-w-[520px] text-[16px] leading-[1.6] text-text-2">
          Pick a lane or work across all of them — every community runs its own projects, workshops, and mentors.
        </p>
      </RevealOnScroll>

      <RevealOnScroll className="mt-[72px] grid grid-cols-1 gap-px overflow-hidden rounded-[20px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {COMMUNITIES.map((c) => (
          <Link key={c.slug} href={ROUTES.community(c.slug)} className="block">
            <TiltCard maxTilt={4} className="group relative min-h-[200px] bg-bg p-[26px] transition-colors duration-300 hover:bg-bg-1">
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-50"
                style={{ background: "radial-gradient(circle at 30% 20%, rgba(139,124,246,0.45), transparent 60%)" }}
              />
              <div className="relative z-[1] font-mono text-[11px] text-text-3">{c.number}</div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.4"
                className="relative z-[1] my-[26px] h-[26px] w-[26px] stroke-text-2 transition-all duration-300 group-hover:-translate-y-1 group-hover:stroke-accent"
                dangerouslySetInnerHTML={{ __html: c.iconPaths }}
              />
              <h2 className="relative z-[1] text-[19px] font-medium">{c.name}</h2>
              <p className="relative z-[1] mt-1.5 text-[13px] text-text-3">{c.description}</p>
            </TiltCard>
          </Link>
        ))}
      </RevealOnScroll>
    </main>
  );
}
