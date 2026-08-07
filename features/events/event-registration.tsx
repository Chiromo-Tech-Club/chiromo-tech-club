"use client";

import { Button } from "@/components/alignui/button";
import { useEventRegistration } from "@/features/events/useEventRegistration";

export function EventRegistrationForm({ eventSlug }: { eventSlug: string }) {
  const { status, error, register } = useEventRegistration(eventSlug);

  if (status === "success") {
    return <p className="text-sm text-accent-2">You&apos;re registered — see you there.</p>;
  }

  return (
    <div>
      <Button variant="primary" size="sm" disabled={status === "submitting"} onClick={register}>
        {status === "submitting" ? "Registering…" : "Register"}
      </Button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}