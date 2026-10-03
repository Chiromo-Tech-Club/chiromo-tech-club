import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmitProjectForm } from "@/features/projects/SubmitProjectForm";
import { getCurrentMember, hasCompletedClubRegistration } from "@/lib/supabase/get-current-member";
import { ROUTES } from "@/constants/routes";

export const metadata = { title: "Share a project" };

export default async function MyProjectPage() {
  const member = await getCurrentMember();
  if (!member) redirect(ROUTES.signIn);
  if (!hasCompletedClubRegistration(member)) redirect(ROUTES.register);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-ink">Share a project</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">
        This becomes a public listing, in the same shape as a startup directory: a name, one line about what it
        does, and a longer explanation of the problem and what you built. Administrators can archive a listing
        later from the project admin page.
      </p>
      <div className="mt-6">
        <SubmitProjectForm />
      </div>
      <Link href={ROUTES.projects} className="mt-4 inline-block text-sm font-semibold text-sky hover:underline">
        See the project directory
      </Link>
    </div>
  );
}
