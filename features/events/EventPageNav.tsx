"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Home } from "lucide-react";
import { ROUTES } from "@/constants/routes";

/**
 * Events navigation: go back to the previous screen, the events list, or home.
 * "Back" uses browser history when there is one; otherwise it falls back to
 * the events list (detail) or home (list).
 */
export function EventPageNav({
  variant,
  filtered = false,
}: {
  variant: "list" | "detail";
  /** Category or past-scope is active — offer a reset to the default list. */
  filtered?: boolean;
}) {
  const router = useRouter();

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(variant === "detail" ? ROUTES.events : ROUTES.home);
  }

  return (
    <nav aria-label="Event navigation" className="mb-6 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink shadow-sm transition hover:border-sky/40 hover:bg-cream"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      {variant === "detail" ? (
        <Link
          href={ROUTES.events}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink shadow-sm transition hover:border-sky/40 hover:bg-cream"
        >
          <CalendarDays size={14} />
          All events
        </Link>
      ) : null}

      {variant === "list" && filtered ? (
        <Link
          href={ROUTES.events}
          className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 bg-navy px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-navy/90"
        >
          <ArrowLeft size={14} />
          Back to all events
        </Link>
      ) : null}

      <Link
        href={ROUTES.home}
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink shadow-sm transition hover:border-sky/40 hover:bg-cream"
      >
        <Home size={14} />
        Home
      </Link>
    </nav>
  );
}
