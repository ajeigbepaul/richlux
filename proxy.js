import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ADMIN_ROLES = ["superadmin", "manager", "agent"];
const SUPERADMIN_ONLY_PREFIXES = ["/admin/users"];

// Defense-in-depth for /admin pages: app/admin/layout.js already gates on
// role server-side, but middleware catches it earlier (Edge, before the page
// even renders) and API routes are separately protected by requireRole() in
// each handler -- this only ever needs to cover page routes, not /api/*,
// since redirecting an API caller to /login instead of a 401 JSON body would
// break API clients.
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    if (
      SUPERADMIN_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix)) &&
      role !== "superadmin"
    ) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    if (pathname.startsWith("/admin") && !ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
