"use client";

import Link from "next/link";
import { Button } from "@/components/alignui/button";
import { useEventRegistration } from "@/features/events/useEventRegistration";
import { ROUTES } from "@/constants/routes";

export function EventRegistrationForm({
  eventSlug,
  isSignedIn = false,
  alreadyRegistered,
  spotsLeft,
  canRsvp = false,
  eligibilityMessage,
}: {
  eventSlug: string;
  isSignedIn?: boolean;
  alreadyRegistered?: boolean;
  spotsLeft?: number | null;
  /** Only approved, fully registered members may RSVP. */
  canRsvp?: boolean;
  eligibilityMessage?: string | null;
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
        <p className="mt-1 text-xs text-ink-2">
          Sign in with an approved CTC membership account to RSVP.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="primary" size="sm">
            <Link href={`${ROUTES.signIn}?returnBackUrl=${encodeURIComponent(ROUTES.event(eventSlug))}`}>
              Sign in to register
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={ROUTES.register}>Apply for membership</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!canRsvp) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
        <p className="text-sm font-semibold text-ink">RSVP locked</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-2">
          {eligibilityMessage ??
            "Only registered and approved club members can RSVP for events. Finish your application and wait for leadership approval."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="primary" size="sm">
            <Link href={ROUTES.register}>Complete / check registration</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={ROUTES.dashboard}>Dashboard</Link>
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
          : "One-click RSVP for approved Chiromo Tech Club members."}
      </p>
      <Button
        variant="primary"
        size="sm"
        className="mt-4"
        disabled={status === "submitting" || full}
        onClick={register}
      >
        {status === "submitting" ? "Registering…" : full ? "Sold out" : "RSVP"}
      </Button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
