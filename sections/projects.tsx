import { PROJECTS } from "../data/projects";
import { RevealOnScroll } from "../components/animations/RevealOnScroll";
import { TiltCard } from "../components/animations/TiltCard";
import { cn } from "../lib/utils/cn";

const SIZE_CLASS: Record<string, string> = {
  tall: "sm:col-span-2 sm:row-span-2",
  regular: "sm:col-span-2",
  small: "sm:col-span-1",
};

export function Projects() {
  return (
    <section id="projects" className="py-40">
      <div className="mx-auto max-w-[1280px] px-8">
        <RevealOnScroll className="mb-[72px] max-w-[640px]">
          <div className="mb-5 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.18em] text-accent">
            <span className="h-px w-4 bg-accent" />
            Ch. 04 — Projects
          </div>
          <h2 className="font-display text-[clamp(32px,4.4vw,52px)] font-medium leading-[1.02] tracking-[-0.02em]">
            Built by members, shipped for impact.
          </h2>
          <p className="mt-4.5 max-w-[520px] text-[16px] leading-[1.6] text-text-2">
            A rotating showcase of what the club is building right now — open source, research, and product.
          </p>
        </RevealOnScroll>

        <RevealOnScroll className="grid auto-rows-[220px] grid-cols-1 gap-[18px] sm:grid-cols-4">
          {PROJECTS.map((p) => (
            <TiltCard
              key={p.slug}
              maxTilt={3}
              className={cn(
                "group relative flex flex-col justify-end overflow-hidden rounded-[18px] border border-line bg-bg-1 p-[26px]",
                SIZE_CLASS[p.size],
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-bg-2 to-bg-1 transition-transform duration-500 group-hover:scale-105" />
              <div className="relative z-[1]">
                <div className="mb-2.5 flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-accent-2/25 px-2 py-0.5 font-mono text-[10px] text-accent-2">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-medium">{p.title}</h3>
                <p className="mt-1.5 text-[13px] text-text-2">{p.description}</p>
                <div className="mt-3.5 flex items-center gap-3.5 font-mono text-[11px] text-text-3">
                  <span className="flex items-center gap-1">
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" className="h-[13px] w-[13px] stroke-text-3">
                      <path d="M12 2l3 6 6 .9-4.5 4.3 1 6-5.5-3-5.5 3 1-6L3 8.9 9 8z" />
                    </svg>
                    {p.stars}
                  </span>
                  <span>{p.contributorCount} contributors</span>
                </div>
              </div>
            </TiltCard>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
