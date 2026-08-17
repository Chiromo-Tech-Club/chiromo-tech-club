// New file — Clerk's hosted SignIn/SignUp components handled the OAuth
// redirect internally, so there was no equivalent route to write before.
// Supabase's signInWithOAuth() sends Google back here with a ?code=...
// which then gets exchanged for a real session cookie.

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ROUTES } from "@/constants/routes";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? ROUTES.dashboard;

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}${ROUTES.signIn}?error=auth_failed`);
}