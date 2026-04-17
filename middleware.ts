// ============================================================
// Wamanafo SHS Frontend — Middleware
// Protects routes by checking for JWT token in localStorage.
// Since middleware runs on the server (Edge), we use a cookie
// as the auth signal. The JWT itself stays in localStorage.
// ============================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_PREFIXES: Record<string, string> = {
  "/admin":   "ADMIN",
  "/teacher": "TEACHER",
  "/student": "STUDENT",
  "/parent":  "PARENT",
};

const PUBLIC_PATHS = ["/login"];

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // Check auth cookie (set by the login page after successful JWT login)
  const authCookie = req.cookies.get("ghana_shs_auth");

  if (!authCookie?.value) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const user = JSON.parse(authCookie.value) as { role: string };

    // Role-based route protection
    for (const [prefix, role] of Object.entries(ROLE_PREFIXES)) {
      if (pathname.startsWith(prefix) && user.role !== role) {
        const dashboard =
          user.role === "ADMIN"   ? "/admin/dashboard"  :
          user.role === "TEACHER" ? "/teacher/dashboard" :
          user.role === "STUDENT" ? "/student/portal"    :
          user.role === "PARENT"  ? "/parent/portal"     : "/login";
        return NextResponse.redirect(new URL(dashboard, req.url));
      }
    }

    if (pathname === "/") {
      const dashboard =
        user.role === "ADMIN"   ? "/admin/dashboard"  :
        user.role === "TEACHER" ? "/teacher/dashboard" :
        user.role === "STUDENT" ? "/student/portal"    :
        user.role === "PARENT"  ? "/parent/portal"     : "/login";
      return NextResponse.redirect(new URL(dashboard, req.url));
    }
  } catch {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
