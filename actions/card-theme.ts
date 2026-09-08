"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/drizzle/client";
import { ensureMembersColumns } from "@/lib/drizzle/ensure-members-columns";
import { members } from "@/lib/drizzle/schema";
import { getAuthUserId } from "@/lib/supabase/auth-helpers";
import { isCardThemeId, type CardThemeId } from "@/lib/membership/card-theme";
import { ROUTES } from "@/constants/routes";

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/** Persists the signed-in member's preferred membership-card color theme. */
export async function updateMyCardTheme(themeId: string): Promise<ActionResult<{ themeId: CardThemeId }>> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Sign in to recolor your card." };
  if (!isCardThemeId(themeId)) return { success: false, error: "Unknown card theme." };

  const db = getDb();
  try {
    await ensureMembersColumns();
    await db
      .update(members)
      .set({ cardTheme: themeId, updatedAt: new Date() })
      .where(eq(members.id, userId));

    revalidatePath(ROUTES.dashboard);
    revalidatePath(ROUTES.dashboardProfile);
    return { success: true, data: { themeId } };
  } catch (err) {
    console.error("updateMyCardTheme failed:", err);
    return { success: false, error: "Could not save card color. Try again." };
  }
}
