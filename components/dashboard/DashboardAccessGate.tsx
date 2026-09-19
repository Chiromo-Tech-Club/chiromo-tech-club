"use client";

import { usePathname } from "next/navigation";
import { DeactivationGate } from "@/components/dashboard/DeactivationGate";
import { LoginNameMergeGate } from "@/features/membership/LoginNameMergeGate";
import { ROUTES } from "@/constants/routes";

/**
 * Blocks the dashboard while deactivating, but still allows /dashboard/profile
 * so the member can cancel within the 14-day window.
 */
export function DashboardAccessGate({
  isDeactivated,
  deactivatedAt,
  purgeScheduledAt,
  children,
}: {
  isDeactivated: boolean;
  deactivatedAt?: Date | string | null;
  purgeScheduledAt?: Date | string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const onProfile = pathname === ROUTES.dashboardProfile || pathname?.startsWith(`${ROUTES.dashboardProfile}/`);

  if (isDeactivated && !onProfile) {
    return (
      <DeactivationGate deactivatedAt={deactivatedAt} purgeScheduledAt={purgeScheduledAt} />
    );
  }

  return (
    <>
      {!isDeactivated && <LoginNameMergeGate />}
      {children}
    </>
  );
}
