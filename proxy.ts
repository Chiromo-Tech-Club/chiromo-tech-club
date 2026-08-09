import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PROTECTED_PREFIXES, ADMIN_ONLY_PREFIXES, ROUTES } from "./constants/routes";
import { isRole } from "./types/roles";
import { DEFAULT_ROLE } from "./constants/roles";

const isProtectedRoute = createRouteMatcher(PROTECTED_PREFIXES.map((p) => `${p}(.*)`));
const isAdminRoute = createRouteMatcher(ADMIN_ONLY_PREFIXES.map((p) => `${p}(.*)`));

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
    // Tells Clerk's middleware to act as the native proxy for production
    frontendApiProxy: {
      enabled: true,
      path: '/__clerk',
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    // Required so the middleware intercepts the proxy chunk requests
    "/__clerk/(.*)",
  ],
};