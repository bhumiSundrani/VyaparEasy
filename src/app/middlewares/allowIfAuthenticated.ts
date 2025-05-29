import { verifyToken } from "@/lib/jwtTokenManagement";
import { NextRequest, NextResponse } from "next/server";

export async function allowIfAuthenticatedMiddleware(request: NextRequest) {
  const token = request.cookies?.get('token')?.value
  if (!token) return NextResponse.next()

  try {
    const user = await verifyToken(token)
    // If user is authenticated, redirect them away from auth pages
    if (user) return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (error) {
    return NextResponse.next()
  }

  return NextResponse.next()
}
