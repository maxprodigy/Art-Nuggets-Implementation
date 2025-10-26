import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookie } from "@/lib/auth/cookies";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Public routes that don't need authentication
  const publicRoutes = ["/", "/login", "/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Protected routes that need authentication
  const protectedRoutes = ["/dashboard", "/profile", "/onboarding", "/courses"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if user has tokens (backend will validate them)
  const accessToken = getCookie(request, "access_token");
  const refreshToken = getCookie(request, "refresh_token");
  const hasTokens = !!(accessToken && refreshToken);

  // Redirect to login if accessing protected route without tokens
  if (isProtectedRoute && !hasTokens) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from login/signup
  if (hasTokens && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
