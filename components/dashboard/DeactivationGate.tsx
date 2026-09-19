"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { AccountDeactivationPanel } from "@/features/dashboard/AccountDeactivationPanel";
import { ROUTES } from "@/constants/routes";
import { daysUntilPurge, DEACTIVATION_GRACE_DAYS } from "@/lib/membership/constants";

/**
 * Full-page gate when a member is in the deactivation grace window.
 * They can still reach profile to cancel.
 */
export function DeactivationGate({
  purgeScheduledAt,
}: {
  purgeScheduledAt?: string | Date | null;
  deactivatedAt?: string | Date | null;
}) {
  const daysLeft = daysUntilPurge(purgeScheduledAt ?? null);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center gap-6 px-4 py-12">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <AlertTriangle size={28} />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-ink">Account deactivating</h1>
        <p className="mt-2 text-sm text-muted">
          Your membership dashboard is paused. You have{" "}
          <span className="font-semibold text-ink">
            {daysLeft ?? DEACTIVATION_GRACE_DAYS} day
            {(daysLeft ?? DEACTIVATION_GRACE_DAYS) === 1 ? "" : "s"}
          </span>{" "}
          left to cancel before your personal details and login are removed.
        </p>
      </div>

      <AccountDeactivationPanel
        deactivatedAt={new Date().toISOString()}
        purgeScheduledAt={purgeScheduledAt}
      />

      <p className="text-center text-xs text-muted">
        Need help?{" "}
        <Link href={ROUTES.dashboardProfile} className="font-semibold text-sky hover:underline">
          Open profile settings
        </Link>
      </p>
    </div>
  );
}
