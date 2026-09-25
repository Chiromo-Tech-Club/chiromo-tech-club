"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Pencil } from "lucide-react";
import { RegistrationWizard } from "@/features/membership/RegistrationWizard";
import { Button } from "@/components/alignui/button";
import { ROUTES } from "@/constants/routes";

export function RegisterPageClient({
  isSignedIn,
  registrationComplete,
  initialUser,
}: {
  isSignedIn: boolean;
  registrationComplete: boolean;
  initialUser: { fullName?: string; email?: string } | null;
}) {
  const [editing, setEditing] = useState(false);

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
          . You can open your dashboard, or update a few details below.
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

  return (
    <div className="space-y-4">
      {registrationComplete && editing && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-sky/25 bg-sky/5 px-4 py-3">
          <p className="text-xs text-ink-2">
            Updating your membership details. Changes are saved when you submit the form again.
          </p>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-xs font-bold text-sky hover:underline"
          >
            Cancel edit
          </button>
        </div>
      )}
      <RegistrationWizard initialUser={initialUser} isSignedIn={isSignedIn} />
    </div>
  );
}
