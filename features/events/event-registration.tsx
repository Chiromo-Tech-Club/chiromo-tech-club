"use client";

import Link from "next/link";
import { Button } from "@/components/alignui/button";
import { useEventRegistration } from "@/features/events/useEventRegistration";
import { ROUTES } from "@/constants/routes";

export function EventRegistrationForm({
  eventSlug,
  isSignedIn,
  alreadyRegistered,
  spotsLeft,
}: {
  eventSlug: string;
  isSignedIn: boolean;
  alreadyRegistered?: boolean;
  spotsLeft?: number | null;
}) {
  const { status, error, register } = useEventRegistration(eventSlug);

  if (alreadyRegistered || status === "success") {
    return (
      <div className="rounded-2xl border border-green/30 bg-green/5 p-5">
        <p className="text-sm font-semibold text-green">You&apos;re registered</p>
        <p className="mt-1 text-xs text-ink-2">We&apos;ll see you there — check your email for a reminder.</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="rounded-2xl border border-line bg-cream/40 p-5">
        <p className="text-sm font-semibold text-ink">Register for this event</p>
        <p className="mt-1 text-xs text-ink-2">Sign in with your CTC account to RSVP.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="primary" size="sm">
            <Link href={`${ROUTES.signIn}?returnBackUrl=${encodeURIComponent(ROUTES.event(eventSlug))}`}>
              Sign in to register
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={ROUTES.register}>Create account</Link>
          </Button>
        </div>
      </div>
    );
  }

  const full = typeof spotsLeft === "number" && spotsLeft <= 0;

  return (
    <div className="rounded-2xl border border-navy/20 bg-navy/5 p-5">
      <p className="text-sm font-semibold text-ink">Register for this event</p>
      <p className="mt-1 text-xs text-ink-2">
        {typeof spotsLeft === "number"
          ? full
            ? "This event is full."
            : `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`
          : "One-click RSVP for Chiromo Tech Club members."}
      </p>
      <Button
        variant="primary"
        size="sm"
        className="mt-4"
        disabled={status === "submitting" || full}
        onClick={register}
      >
        {status === "submitting" ? "Registering…" : full ? "Sold out" : "Register"}
      </Button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
