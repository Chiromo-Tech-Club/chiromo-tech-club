import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import {
  getCurrentMember,
  hasCompletedClubRegistration,
} from "@/lib/supabase/get-current-member";
import { ROUTES } from "@/constants/routes";

const NEW_USER_WINDOW_MS = 90_000;

function isNewlyCreatedUser(createdAt: string | undefined): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < NEW_USER_WINDOW_MS;
}

async function rejectAndCleanup(userId: string, origin: string, errorCode: string) {
  try {
    const supabase = await getSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }

  try {
    const admin = getSupabaseServiceClient();
    await admin.auth.admin.deleteUser(userId);
  } catch (err) {
    console.warn("Could not delete unauthorized OAuth user:", err);
  }

  return NextResponse.redirect(`${origin}${ROUTES.signIn}?error=${errorCode}`);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const intent = searchParams.get("intent") ?? "signin";
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}${ROUTES.signIn}?error=auth_failed`);
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}${ROUTES.signIn}?error=auth_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}${ROUTES.signIn}?error=auth_failed`);
  }

  const isNew = isNewlyCreatedUser(user.created_at);

  // Sign-in must never create accounts — Google OAuth otherwise auto-registers.
  if (intent === "signin" && isNew) {
    return rejectAndCleanup(user.id, origin, "no_account");
  }

  // Membership Google flow: finish the registration form on /register
  // unless they already completed it (then dashboard).
  if (intent === "register") {
    const member = await getCurrentMember({ createIfMissing: true }).catch(() => null);
    if (member && hasCompletedClubRegistration(member)) {
      return NextResponse.redirect(`${origin}${ROUTES.dashboard}`);
    }
    return NextResponse.redirect(`${origin}${ROUTES.register}`);
  }

  if (intent === "signup") {
    const destination = next || ROUTES.dashboard;
    return NextResponse.redirect(`${origin}${destination}`);
  }

  // After normal sign-in: incomplete applications must finish /register first
  if (intent === "signin") {
    const member = await getCurrentMember({ createIfMissing: false }).catch(() => null);
    const role = member?.role;
    const isExecOrAdmin = role === "exec" || role === "admin";
    if (!isExecOrAdmin && member && !hasCompletedClubRegistration(member)) {
      return NextResponse.redirect(`${origin}${ROUTES.register}`);
    }
    if (!isExecOrAdmin && !member) {
      // Auth exists but no club application yet
      return NextResponse.redirect(`${origin}${ROUTES.register}`);
    }
  }

  return NextResponse.redirect(`${origin}${next || ROUTES.dashboard}`);
}
