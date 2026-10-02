"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Pencil } from "lucide-react";
import { RegistrationWizard } from "@/features/membership/RegistrationWizard";
import { Button } from "@/components/alignui/button";
import { ROUTES } from "@/constants/routes";
import {
  REGISTRATION_EDIT_STEP_KEY,
  REGISTRATION_STEPS,
  type RegistrationSeed,
} from "@/features/membership/registration-draft";

export function RegisterPageClient({
  isSignedIn,
  registrationComplete,
  initialUser,
  savedProfile,
}: {
  isSignedIn: boolean;
  registrationComplete: boolean;
  initialUser: { fullName?: string; email?: string } | null;
  savedProfile?: RegistrationSeed | null;
}) {
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editStep, setEditStep] = useState<number | null>(null);

  useEffect(() => {
    if (!registrationComplete) {
      setReady(true);
      return;
    }
    const saved = Number(window.localStorage.getItem(REGISTRATION_EDIT_STEP_KEY));
    if (saved >= 1 && saved <= 5) {
      setEditing(true);
      setEditStep(saved);
    }
    setReady(true);
  }, [registrationComplete]);

  function chooseStep(step: number) {
    window.localStorage.setItem(REGISTRATION_EDIT_STEP_KEY, String(step));
    setEditStep(step);
    setEditing(true);
  }

  function cancelEdit() {
    window.localStorage.removeItem(REGISTRATION_EDIT_STEP_KEY);
    setEditing(false);
    setEditStep(null);
  }

  if (registrationComplete && !ready) {
    return <div className="mx-auto min-h-[240px] max-w-lg" />;
  }

  if (registrationComplete && !editing) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-line/70 bg-surface/95 p-8 text-center shadow-lg sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green/10 text-green ring-8 ring-green/5">
          <CheckCircle2 size={36} strokeWidth={2.2} />
        </div>
        <h2 className="font-display text-2xl font-extrabold text-ink">
          You&apos;ve completed registration
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Your membership application is already on file
          {initialUser?.fullName ? (
            <>
              {" "}
              for <span className="font-semibold text-ink">{initialUser.fullName}</span>
            </>
          ) : null}
          . Open your dashboard, or pick one step to change.
        </p>
        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link
            href={ROUTES.dashboard}
            className="inline-flex items-center justify-center rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-navy/90"
          >
            Go to dashboard
          </Link>
          <Button
            type="button"
            variant="ghost"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl text-sm"
            onClick={() => setEditing(true)}
          >
            <Pencil size={14} /> Edit some details
          </Button>
        </div>
      </div>
    );
  }

  if (registrationComplete && editing && !editStep) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-line/70 bg-surface/95 p-6 shadow-lg sm:p-8">
        <h2 className="font-display text-xl font-extrabold text-ink">Which step do you want to edit?</h2>
        <p className="mt-2 text-sm text-ink-2">
          Your saved answers stay in place. Only the step you pick opens.
        </p>
        <div className="mt-5 space-y-2">
          {REGISTRATION_STEPS.map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => chooseStep(item.step)}
              className="flex w-full items-center justify-between rounded-2xl border border-line bg-cream/40 px-4 py-3 text-left transition hover:border-sky hover:bg-sky/5"
            >
              <span>
                <span className="block text-sm font-bold text-ink">{item.title}</span>
                <span className="block text-xs text-ink-2">{item.detail}</span>
              </span>
              <span className="font-mono text-xs text-muted">Step {item.step}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={cancelEdit} className="mt-4 text-xs font-bold text-sky hover:underline">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {registrationComplete && editing && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-sky/25 bg-sky/5 px-4 py-3">
          <p className="text-xs text-ink-2">
            Editing step {editStep}. Your other answers stay saved.
          </p>
          <button type="button" onClick={() => setEditStep(null)} className="text-xs font-bold text-sky hover:underline">
            Choose another step
          </button>
        </div>
      )}
      <RegistrationWizard
        initialUser={initialUser}
        isSignedIn={isSignedIn}
        startStep={registrationComplete ? editStep ?? undefined : undefined}
        savedProfile={savedProfile}
      />
    </div>
  );
}
