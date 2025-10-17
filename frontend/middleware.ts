import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from localStorage (we'll need to handle this differently in production)
  // For now, we'll check if the user is authenticated on the client side
  // In a real app, you'd use HTTP-only cookies or server-side session checking

  // Define route patterns
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  const protectedRoutes = ["/dashboard", "/profile", "/settings"];
  const adminRoutes = ["/admin"];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route);
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // For API routes, let them handle their own authentication
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // For static files, let them through
  if (pathname.startsWith("/_next/") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute || isAdminRoute) {
    // In a real implementation, you'd check for a valid token here
    // For now, we'll let the client-side handle authentication
    // and redirect if needed
    // You could decode JWT here to check roles for admin routes
    // const token = request.cookies.get('access_token');
    // if (token && isAdminRoute) {
    //   const payload = decodeJWT(token.value);
    //   if (payload.role !== 'admin') {
    //     return NextResponse.redirect(new URL('/unauthorized', request.url));
    //   }
    // }
  }

  // Redirect to login if accessing protected route without auth
  // This is a basic implementation - in production you'd check actual tokens
  if (isProtectedRoute && !request.cookies.get("access_token")) {
    return NextResponse.redirect(new URL("/login", request.url));
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
