const DAY_MS = 24 * 60 * 60 * 1000;

export function defaultRegistrationDeadline(startsAt: Date): Date {
  return new Date(startsAt.getTime() - DAY_MS);
}

export function effectiveRegistrationDeadline(
  startsAt: Date,
  stored: Date | string | null | undefined,
): Date {
  if (stored) {
    const parsed = stored instanceof Date ? stored : new Date(stored);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return defaultRegistrationDeadline(startsAt);
}

/** Why new RSVPs are blocked, or null while registration is still open. */
export function rsvpClosureMessage(
  startsAt: Date | string,
  storedDeadline: Date | string | null | undefined,
  now = new Date(),
): string | null {
  const start = startsAt instanceof Date ? startsAt : new Date(startsAt);
  if (Number.isNaN(start.getTime())) return "RSVP is closed for this event.";
  if (now.getTime() >= start.getTime()) {
    return "This event has already passed, so RSVP is closed.";
  }
  const deadline = effectiveRegistrationDeadline(start, storedDeadline);
  if (now.getTime() >= deadline.getTime()) {
    return "Registration has closed for this event.";
  }
  return null;
}
