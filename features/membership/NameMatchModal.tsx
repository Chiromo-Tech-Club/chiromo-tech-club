"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/alignui/dialog";
import { Button } from "@/components/alignui/button";
import {
  confirmNameIsDistinct,
  mergeMemberAccounts,
} from "@/actions/account-linking";
import type { SimilarMemberCandidate } from "@/lib/membership/name-match";
import { Mail, UserRound, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Mode = "register" | "login";

export function NameMatchModal({
  open,
  mode,
  current,
  candidates,
  onClose,
  onDistinct,
  onMerged,
}: {
  open: boolean;
  mode: Mode;
  /** The person currently registering / signed in. */
  current: { id?: string; fullName: string; email: string };
  candidates: SimilarMemberCandidate[];
  onClose: () => void;
  /** Called when user says "this is not me" — continue with a new dashboard. */
  onDistinct: () => void;
  /** Called after a successful merge (login mode). */
  onMerged?: (primaryEmail: string) => void;
}) {
  const [isTheirs, setIsTheirs] = useState<boolean | null>(null);
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allAccounts: SimilarMemberCandidate[] = [
    {
      id: current.id ?? "__current__",
      fullName: current.fullName,
      email: current.email,
      membershipStatus: null,
      emailDisplay: current.email,
    },
    ...candidates,
  ];

  function handleConfirmDistinct() {
    setError(null);
    startTransition(async () => {
      if (current.id) {
        const res = await confirmNameIsDistinct();
        if (!res.success) {
          setError(res.error ?? "Could not save your choice.");
          return;
        }
      }
      onDistinct();
    });
  }

  function handleMerge() {
    if (!primaryId || !current.id) {
      setError("Select which email should be your primary login.");
      return;
    }

    let primaryMemberId = primaryId;
    let secondaryMemberId: string;

    if (primaryId === current.id) {
      const other = candidates.find((c) => c.id !== primaryId);
      if (!other) {
        setError("No other account to merge.");
        return;
      }
      secondaryMemberId = other.id;
    } else {
      primaryMemberId = primaryId;
      secondaryMemberId = current.id;
    }

    setError(null);
    startTransition(async () => {
      const res = await mergeMemberAccounts({
        primaryMemberId,
        secondaryMemberId,
      });
      if (!res.success) {
        setError(res.error ?? "Merge failed.");
        return;
      }
      onMerged?.(res.data?.primaryEmail ?? "");
      onClose();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="flex flex-col gap-4 p-5 sm:p-6">
        <div>
          <DialogTitle className="font-display text-lg font-extrabold text-ink">
            {mode === "register" ? "Similar name found" : "Multiple accounts with your name"}
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-sm text-muted">
            {mode === "register"
              ? "We found existing club accounts with the same name (ignoring capital letters). Are these yours?"
              : "You appear to have more than one CTC account under the same name. Pick one email as primary so you keep a single dashboard."}
          </DialogDescription>
        </div>

        <ul className="max-h-48 space-y-2 overflow-y-auto rounded-2xl border border-line/70 bg-cream/40 p-3">
          {candidates.map((c) => (
            <li
              key={c.id}
              className="flex items-start gap-2 rounded-xl bg-surface px-3 py-2.5 text-sm"
            >
              <UserRound size={14} className="mt-0.5 shrink-0 text-sky" />
              <div className="min-w-0">
                <p className="font-semibold text-ink">{c.fullName}</p>
                <p className="flex items-center gap-1 break-all text-xs text-muted">
                  <Mail size={11} /> {c.emailDisplay}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {isTheirs === null && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="primary"
              className="flex-1 rounded-xl"
              disabled={isPending}
              onClick={() => setIsTheirs(true)}
            >
              Yes — these are mine
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1 rounded-xl"
              disabled={isPending}
              onClick={handleConfirmDistinct}
            >
              No — I&apos;m someone else
            </Button>
          </div>
        )}

        {isTheirs === true && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-ink-2">
              Which email should be your <span className="text-ink">primary</span> login? The other
              becomes secondary and both share one dashboard.
            </p>
            <div className="space-y-2">
              {allAccounts.map((a) => (
                <label
                  key={a.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                    primaryId === a.id
                      ? "border-navy bg-navy/5"
                      : "border-line bg-surface hover:border-sky/40",
                  )}
                >
                  <input
                    type="radio"
                    name="primaryEmail"
                    className="mt-1"
                    checked={primaryId === a.id}
                    onChange={() => setPrimaryId(a.id)}
                    disabled={a.id === "__current__" && !current.id}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{a.emailDisplay}</p>
                    <p className="text-[11px] text-muted">
                      {a.id === current.id || a.id === "__current__" ? "This session" : "Existing account"}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {mode === "register" && !current.id && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2.5 text-xs text-amber-900">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <p>
                  Sign in with the account you want to keep as primary, then we can link the other
                  email from your dashboard. Or continue registration only if you are a different
                  person.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              {current.id ? (
                <Button
                  type="button"
                  variant="primary"
                  className="flex-1 rounded-xl"
                  disabled={isPending || !primaryId}
                  onClick={handleMerge}
                >
                  {isPending ? "Merging…" : "Make primary & merge"}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 rounded-xl"
                  disabled={isPending}
                  onClick={handleConfirmDistinct}
                >
                  Continue as a new person
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                className="rounded-xl"
                disabled={isPending}
                onClick={() => setIsTheirs(null)}
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
