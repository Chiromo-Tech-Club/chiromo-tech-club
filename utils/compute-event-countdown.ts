export interface EventCountdown {
  days: number;
  hours: number;
  minutes: number;
  hasPassed: boolean;
}

/** Domain-specific countdown breakdown used by the Events chapter's live counters. */
export function computeEventCountdown(startsAtIso: string, now: Date = new Date()): EventCountdown {
  const target = new Date(startsAtIso).getTime();
  const diff = target - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, hasPassed: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return { days, hours, minutes, hasPassed: false };
}
