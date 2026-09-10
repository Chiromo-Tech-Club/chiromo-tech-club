import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CalendarsManager } from "@/features/admin/CalendarsManager";
import { listGoogleCalendarSources } from "@/lib/calendar/sources";
import { getCurrentRole } from "@/lib/supabase/auth-helpers";
import { ROUTES } from "@/constants/routes";
import { SITE_CONFIG } from "@/config/site";

export const metadata = { title: "Admin — Joint Calendars" };

export default async function AdminCalendarsPage() {
  const role = await getCurrentRole();
  if (role !== "admin" && role !== "exec") {
    return <div className="text-text-2">You don&apos;t have access to this page.</div>;
  }

  const sources = await listGoogleCalendarSources();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link
          href={ROUTES.dashboard}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-sky hover:underline"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
        <h1 className="font-display text-3xl font-extrabold text-ink">Joint Google Calendars</h1>
        <p className="mt-2 max-w-2xl text-sm text-text-2">
          Any admin or executive can add calendar emails here. Active sources are combined into one
          club embed on the dashboard — not locked to a single personal Gmail. Club email replies
          still go to <span className="font-mono text-ink">{SITE_CONFIG.contactEmail}</span>.
        </p>
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-xs text-muted">
          <li>In Google Calendar → Settings → your calendar → make it public (or share with the club).</li>
          <li>Copy the calendar email / Calendar ID and paste it above (several at once are fine).</li>
          <li>Members see every active calendar together under Dashboard → Calendar.</li>
        </ol>
      </div>
      <CalendarsManager initial={sources} />
    </div>
  );
}
