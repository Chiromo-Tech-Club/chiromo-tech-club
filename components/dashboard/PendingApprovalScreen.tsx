import Link from "next/link";
import { Clock3, LogOut } from "lucide-react";
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
          Hi {fullName.split(" ")[0] || "there"} — your registration ({email}) is in. The member dashboard
          opens after leadership approves your application. You don&apos;t need to register again.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href={ROUTES.events}
            className="inline-flex items-center justify-center rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky"
          >
            Browse public events
          </Link>
          <Link
            href={ROUTES.home}
            className="inline-flex items-center justify-center rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream-2"
          >
            Back to home
          </Link>
        </div>

        <p className="mt-6 text-[11px] text-muted">
          Need to correct a detail?{" "}
          <Link href={ROUTES.register} className="font-semibold text-sky hover:underline">
            Update your application
          </Link>
        </p>

        <div className="mt-4">
          <Link href={ROUTES.signIn} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink">
            <LogOut size={12} /> Sign out and use another account
          </Link>
        </div>
      </div>
    </div>
  );
}
