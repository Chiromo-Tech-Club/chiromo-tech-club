// Supabase OAuth returns here with ?code=...
// intent=signin → reject brand-new Google accounts (no silent sign-up)
// intent=signup → require referral unlock cookie set on /sign-up

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { ROUTES } from "@/constants/routes";

const REFERRAL_COOKIE = "ctc_signup_referral";
const NEW_USER_WINDOW_MS = 90_000; // treat as newly created if within 90s

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
  const next = searchParams.get("next") ?? ROUTES.dashboard;

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
  const isGoogle = user.app_metadata?.provider === "google" || user.identities?.some((i) => i.provider === "google");

  // Sign-in must never create accounts — Google OAuth otherwise auto-registers.
  if (intent === "signin" && isNew) {
    return rejectAndCleanup(user.id, origin, "no_account");
  }

  // Google sign-up requires a verified referral unlock cookie (set on /sign-up).
  // Email confirmation links may arrive later without the cookie — only gate new Google users.
  if (intent === "signup" && isNew && isGoogle) {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const hasReferral = cookieHeader.split(";").some((c) => c.trim().startsWith(`${REFERRAL_COOKIE}=1`));

    if (!hasReferral) {
      return rejectAndCleanup(user.id, origin, "signup_locked");
    }

    const response = NextResponse.redirect(`${origin}${next}`);
    response.cookies.set(REFERRAL_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  }

  return NextResponse.redirect(`${origin}${next}`);
}
