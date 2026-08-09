import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PROTECTED_PREFIXES, ADMIN_ONLY_PREFIXES, ROUTES } from "./constants/routes";
import { isRole } from "./types/roles";
import { DEFAULT_ROLE } from "./constants/roles";

/**
 * Kept intentionally thin per the architecture doc: this file only wires
 * route matching to Clerk's session, and delegates the actual role logic
 * to lib/clerk. Auth/role rules should never be duplicated here later.
 *
 * Named proxy.ts, not middleware.ts — Next.js 16 renamed the convention.
 */
const isProtectedRoute = createRouteMatcher(PROTECTED_PREFIXES.map((p) => `${p}(.*)`));
const isAdminRoute = createRouteMatcher(ADMIN_ONLY_PREFIXES.map((p) => `${p}(.*)`));

// Pass options as the second argument to clerkMiddleware
export default clerkMiddleware(
  async (auth, req) => {
    if (!isProtectedRoute(req)) return NextResponse.next();

    const { userId, sessionClaims, redirectToSignIn } = await auth();

    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    if (isAdminRoute(req)) {
      const role = sessionClaims?.metadata as { role?: unknown } | undefined;
      const currentRole = isRole(role?.role) ? role.role : DEFAULT_ROLE;
      if (currentRole !== "admin") {
        return NextResponse.redirect(new URL(ROUTES.dashboard, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    // Tells Clerk to resolve its script via your proxy
    proxyUrl: "https://chiromo-tech-club.vercel.app/__clerk",
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};