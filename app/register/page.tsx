import Image from "next/image";
import Link from "next/link";
import { RegistrationWizard } from "@/features/membership/RegistrationWizard";
import { getCurrentMember } from "@/lib/supabase/get-current-member";
import { ROUTES } from "@/constants/routes";

export const metadata = {
  title: "Register for Club Membership | Chiromo Tech Club",
  description: "Official student membership registration for Chiromo Tech Club (University of Nairobi). Step-by-step onboarding with progressive disclosure.",
};

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function RegisterPage() {
  const currentMember = await getCurrentMember().catch(() => null);

  const initialUser = currentMember
    ? {
        fullName: currentMember.fullName,
        email: currentMember.email,
      }
    : null;

  return (
    <main className="relative min-h-screen max-w-5xl mx-auto px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      {/* Background Subtle Gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-cream via-cream/80 to-surface pointer-events-none" />

      {/* Header Bar */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <Link
          href={ROUTES.home}
          className="group inline-flex items-center gap-2.5 text-xs font-semibold text-ink-2 transition-colors hover:text-ink"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface/80 text-ink transition-transform group-hover:-translate-x-1">
            <ArrowLeftIcon />
          </span>
          Back to Home
        </Link>

        <div className="flex items-center gap-2 self-start px-3.5 py-1 text-xs font-semibold text-ink">
          {/* <span className="h-2 w-2 rounded-full bg-green animate-pulse" /> */}
          Official Academic Year Membership
        </div>
      </div>

      {/* Page Title & Intro */}
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Chiromo Tech Club Membership Portal
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-2">
          Step into the university&apos;s leading tech ecosystem. Complete your progressive registration below to receive your official digital membership and track placement.
        </p>
      </div>

      {/* Progressive Disclosure Registration Wizard */}
      <RegistrationWizard initialUser={initialUser} />
    </main>
  );
}
