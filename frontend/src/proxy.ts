import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes that require authentication
const protectedPaths = ["/assessment", "/dashboard", "/checkup", "/settings"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected path
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for the NextAuth session cookie
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!sessionToken) {
    // Not logged in — redirect to login with callback URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/assessment/:path*", "/dashboard/:path*", "/checkup/:path*", "/settings/:path*"],
};
