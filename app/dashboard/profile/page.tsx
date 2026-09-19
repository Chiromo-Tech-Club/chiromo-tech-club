import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/supabase/get-current-member";
import { ProfileEditForm } from "@/features/dashboard/ProfileEditForm";
import { AccountDeactivationPanel } from "@/features/dashboard/AccountDeactivationPanel";
import { ROUTES } from "@/constants/routes";

export const metadata = { title: "Edit Profile — CTC" };

export default async function DashboardProfilePage() {
  const member = await getCurrentMember();
  if (!member) redirect(ROUTES.dashboard);

  return (
    <div className="space-y-8">
      <ProfileEditForm
        member={{
          fullName: member.fullName,
          email: member.email,
          username: (member as { username?: string | null }).username ?? null,
          avatarUrl: member.avatarUrl,
          bio: member.bio,
          githubHandle: member.githubHandle,
          phoneNumber: member.phoneNumber,
          studentId: member.studentId ?? null,
          course: member.course,
          yearOfStudy: member.yearOfStudy,
          campus: member.campus,
        }}
      />
      <div className="mx-auto max-w-2xl">
        <AccountDeactivationPanel
          deactivatedAt={member.deactivatedAt}
          purgeScheduledAt={member.purgeScheduledAt}
        />
      </div>
    </div>
  );
}
