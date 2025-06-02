import { NextRequest, NextResponse } from "next/server";

export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  if (!token) {
    // Allow access to /verify-user without token
    if (pathname.startsWith('/verify-user')) {
      return NextResponse.next();
    }
    // Redirect to /verify-user if token is missing
    return NextResponse.redirect(new URL('/verify-user', request.url));
  }

  // Token is present, allow access (without verification)
  return NextResponse.next();
}
