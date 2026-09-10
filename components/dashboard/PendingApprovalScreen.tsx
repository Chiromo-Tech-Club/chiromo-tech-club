import Link from "next/link";
import { Clock3, FileCheck2, LogOut } from "lucide-react";
import { ROUTES } from "@/constants/routes";

/** Shown instead of the member dashboard until leadership approves membership. */
export function PendingApprovalScreen({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-line bg-surface p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky/10 text-sky">
          <Clock3 size={28} />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-ink">Membership pending approval</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Hi {fullName.split(" ")[0] || "there"} — your account ({email}) is signed in, but the member
          dashboard stays locked until leadership reviews your CTC registration.
        </p>

        <ul className="mt-6 space-y-2 rounded-2xl border border-line bg-cream/40 p-4 text-left text-xs text-ink-2">
          <li className="flex gap-2">
            <FileCheck2 size={14} className="mt-0.5 shrink-0 text-green" />
            Complete / update your application on the registration form if you haven&apos;t already.
          </li>
          <li className="flex gap-2">
            <Clock3 size={14} className="mt-0.5 shrink-0 text-sky" />
            You&apos;ll get access to the dashboard, calendar tools, and member events once approved.
          </li>
        </ul>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href={ROUTES.register}
            className="inline-flex items-center justify-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky"
          >
            Finish / update registration
          </Link>
          <Link
            href={ROUTES.events}
            className="inline-flex items-center justify-center rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream-2"
          >
            Browse public events
          </Link>
        </div>

        <form action="/auth/sign-out" method="post" className="mt-6">
          <Link href={ROUTES.signIn} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink">
            <LogOut size={12} /> Sign out and use another account
          </Link>
        </form>
      </div>
    </div>
  );
}
