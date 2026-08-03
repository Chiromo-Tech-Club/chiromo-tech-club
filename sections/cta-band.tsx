"use client";

import { useState } from "react";
import { subscribeToNewsletter } from "../actions/newsletter";
import { RevealOnScroll } from "../components/animations/RevealOnScroll";
import { Button } from "../components/alignui/button";

export function CTABand() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");

  async function onSubmit(formData: FormData) {
    setStatus("submitting");
    await subscribeToNewsletter(formData);
    setStatus("done");
  }

  return (
    <section className="px-8 pb-10 pt-4">
      <RevealOnScroll className="mx-auto max-w-[1280px] rounded-[var(--radius-card)] bg-green px-8 py-10 md:px-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-[clamp(24px,3.2vw,32px)] font-extrabold leading-tight text-white">
              Your Passion Can
              <br />
              Start Today
            </h2>
          </div>
          <p className="max-w-[280px] text-sm text-white/85">
            Every skill, no matter where you&apos;re starting from, helps build something bigger.
          </p>

          {status === "done" ? (
            <p className="text-sm font-semibold text-white">You&apos;re subscribed — welcome aboard.</p>
          ) : (
            <form action={onSubmit} className="flex w-full max-w-[380px] overflow-hidden rounded-full bg-white p-1.5">
              <input
                type="email"
                name="email"
                required
                placeholder="you..nairobi.ac.ke"
                className="w-full bg-transparent px-4 text-sm text-ink placeholder:text-muted focus:outline-none"
              />
              <Button type="submit" variant="dark" size="sm" disabled={status === "submitting"} className="flex-none">
                {status === "submitting" ? "…" : "Start Now"}
              </Button>
            </form>
          )}
        </div>
      </RevealOnScroll>
    </section>
  );
}
