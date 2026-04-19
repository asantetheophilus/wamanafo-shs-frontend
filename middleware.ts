// ============================================================
// Wamanafo SHS Frontend - Middleware
// Uses a role cookie signal for fast route gating.
// Backend JWT authorization is still the source of truth.
// ============================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_PREFIXES: Record<string, string> = {
  "/admin": "ADMIN",
  "/teacher": "TEACHER",
  "/student": "STUDENT",
  "/parent": "PARENT",
};

const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"];

function dashboardForRole(role: string): string {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "TEACHER") return "/teacher/dashboard";
  if (role === "STUDENT") return "/student/portal";
  if (role === "PARENT") return "/parent/portal";
  return "/login";
}

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const authCookie = req.cookies.get("ghana_shs_auth")?.value;
  if (!authCookie) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const decoded = decodeURIComponent(authCookie);
    const user = JSON.parse(decoded) as { role?: string };
    const role = user.role ?? "";

    for (const [prefix, requiredRole] of Object.entries(ROLE_PREFIXES)) {
      if (pathname.startsWith(prefix) && role !== requiredRole) {
        return NextResponse.redirect(new URL(dashboardForRole(role), req.url));
      }
    }

    if (pathname === "/") {
      return NextResponse.redirect(new URL(dashboardForRole(role), req.url));
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
