import { verifyToken } from "@/lib/jwtTokenManagement";
import { NextRequest, NextResponse } from "next/server";

export async function allowIfAuthenticatedMiddleware(request: NextRequest) {
  const token = request.cookies?.get('token')?.value
  if (!token) return NextResponse.next()

  try {
    const user = await verifyToken(token)
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  } catch (error) {
    return NextResponse.next()
  }
}