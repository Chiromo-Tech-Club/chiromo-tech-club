import { LEADERSHIP } from "../data/leadership";
import { RevealOnScroll } from "../components/animations/RevealOnScroll";
import { TiltCard } from "../components/animations/TiltCard";

export function Leadership() {
  return (
    <section id="leadership" className="py-40">
      <div className="mx-auto max-w-[1280px] px-8">
        <RevealOnScroll className="mb-[72px] max-w-[640px]">
          <div className="mb-5 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.18em] text-accent">
            <span className="h-px w-4 bg-accent" />
            Ch. 06 — Leadership
          </div>
          <h2 className="font-display text-[clamp(32px,4.4vw,52px)] font-medium leading-[1.02] tracking-[-0.02em]">
            The people steering the club.
          </h2>
        </RevealOnScroll>

        <RevealOnScroll className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {LEADERSHIP.map((l) => (
            <TiltCard key={l.name} maxTilt={4} className="group cursor-pointer text-left">
              <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-bg-2 to-bg-1 transition-transform duration-400 group-hover:-translate-y-1.5">
                <div className="absolute inset-0 flex items-center justify-center font-display text-[34px] text-text-2">
                  {l.initials}
                </div>
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-60"
                  style={{ background: "radial-gradient(circle at 50% 0%, rgba(139,124,246,0.45), transparent 65%)" }}
                />
              </div>
              <h3 className="text-[17px] font-medium">{l.name}</h3>
              <div className="mt-0.5 text-[13px] text-text-3">{l.role}</div>
            </TiltCard>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
