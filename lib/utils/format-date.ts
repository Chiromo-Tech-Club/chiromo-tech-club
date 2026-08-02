import { format, formatDistanceToNow, isFuture } from "date-fns";

/** "AUG 14, 2026" — used on event timeline cards. */
export function formatEventDate(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy").toUpperCase();
}

/** "2:00 PM" — used alongside formatEventDate for the time portion. */
export function formatEventTime(iso: string): string {
  return format(new Date(iso), "h:mm a");
}

/** "in 3 days" / "3 days ago" — used for relative timestamps. */
export function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function isUpcoming(iso: string): boolean {
  return isFuture(new Date(iso));
}
