import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional classnames and resolve conflicting Tailwind utility
 * classes (e.g. "p-2" vs "p-4") in favor of the one that appears last.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
