"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  requestAccountDeactivation,
  cancelAccountDeactivation,
} from "@/actions/deactivation";
import { DEACTIVATION_GRACE_DAYS, daysUntilPurge } from "@/lib/membership/constants";
import { Button } from "@/components/alignui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ROUTES } from "@/constants/routes";

export function AccountDeactivationPanel({
  deactivatedAt,
  purgeScheduledAt,
}: {
  deactivatedAt?: string | Date | null;
  purgeScheduledAt?: string | Date | null;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDeactivated = Boolean(deactivatedAt);
  const daysLeft = daysUntilPurge(purgeScheduledAt ?? null);

  function handleDeactivate() {
    setError(null);
    startTransition(async () => {
      const res = await requestAccountDeactivation();
      if (!res.success) {
        setError(res.error ?? "Could not deactivate.");
        return;
      }
      setConfirming(false);
      router.refresh();
    });
  }

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const res = await cancelAccountDeactivation();
      if (!res.success) {
        setError(res.error ?? "Could not restore account.");
        return;
      }
      router.refresh();
    });
  }

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push(ROUTES.signIn);
  }

  if (isDeactivated) {
    return (
      <div className="space-y-4 rounded-3xl border border-amber-300/80 bg-amber-50/70 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={20} />
          <div>
            <h2 className="font-display text-sm font-bold text-ink">Account deactivating</h2>
            <p className="mt-1 text-sm text-ink-2">
              Your profile and dashboard access will be permanently removed in{" "}
              <span className="font-bold text-ink">
                {daysLeft === null ? `${DEACTIVATION_GRACE_DAYS} days` : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
              </span>
              . Event registrations and fee records you contributed stay with the club.
            </p>
            <p className="mt-2 text-xs text-muted">
              Sign in again before then and cancel below to keep your account.
            </p>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="primary"
            disabled={isPending}
            onClick={handleCancel}
            className="rounded-xl"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Restoring…
              </>
            ) : (
              "Cancel deactivation"
            )}
          </Button>
          <Button type="button" variant="ghost" className="rounded-xl" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl border border-line bg-surface p-6 shadow-sm">
      <div>
        <h2 className="font-display text-sm font-bold text-ink">Deactivate account</h2>
        <p className="mt-1 text-xs text-muted">
          Like a temporary off-switch: you have {DEACTIVATION_GRACE_DAYS} days to change your mind.
          After that your personal details and login are removed, but club records you contributed
          (events, fees) remain.
        </p>
      </div>

      {!confirming ? (
        <Button
          type="button"
          variant="ghost"
          className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
          onClick={() => setConfirming(true)}
        >
          Deactivate my account…
        </Button>
      ) : (
        <div className="space-y-3 rounded-2xl border border-red-200/80 bg-red-50/50 p-4">
          <p className="text-sm text-ink-2">
            Are you sure? Dashboard access pauses immediately. Permanent deletion runs after{" "}
            {DEACTIVATION_GRACE_DAYS} days unless you cancel.
          </p>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              disabled={isPending}
              onClick={handleDeactivate}
              className="rounded-xl bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Starting…" : `Yes, deactivate for ${DEACTIVATION_GRACE_DAYS} days`}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              className="rounded-xl"
              onClick={() => setConfirming(false)}
            >
              Keep my account
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
