// ─────────────────────────────────────────────────────────────────────────
// CLERK (commented out — kept for reference / rollback)
// ─────────────────────────────────────────────────────────────────────────
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { isRole } from "./types/roles";
// import { DEFAULT_ROLE } from "./constants/roles";
//
// const isAdminRoute = createRouteMatcher(ADMIN_ONLY_PREFIXES.map((p) => `${p}(.*)`));
//
// export default clerkMiddleware(async (auth, req) => {
//   if (!isProtectedRoute(req)) return NextResponse.next();
//
//   const { userId, sessionClaims, redirectToSignIn } = await auth();
//
//   if (!userId) {
//     return redirectToSignIn({ returnBackUrl: req.url });
//   }
//
//   if (isAdminRoute(req)) {
//     const role = sessionClaims?.metadata as { role?: unknown } | undefined;
//     const currentRole = isRole(role?.role) ? role.role : DEFAULT_ROLE;
//     if (currentRole !== "admin") {
//       return NextResponse.redirect(new URL(ROUTES.dashboard, req.url));
//     }
//   }
//
//   return NextResponse.next();
// });
// ─────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { PROTECTED_PREFIXES, ROUTES } from "./constants/routes";

/**
 * Kept intentionally thin per the architecture doc: this file only wires
 * route matching to the Supabase session, and delegates role logic to a
 * server component (see app/admin/layout.tsx) instead of middleware —
 * Supabase doesn't embed custom role claims in the JWT the way Clerk's
 * sessionClaims.metadata did, so that check needs a DB read, which is
 * cheaper to do once in a layout than on every matched request here.
 */
function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  // updateSession() refreshes the Supabase auth cookie on every request —
  // this is the Supabase equivalent of Clerk's automatic session handling.
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (!matchesPrefix(pathname, PROTECTED_PREFIXES)) return supabaseResponse;

  if (!user) {
    const signInUrl = new URL(ROUTES.signIn, request.url);
    signInUrl.searchParams.set("returnBackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};