import { verifyToken } from "@/lib/jwtTokenManagement";
import { NextRequest, NextResponse } from "next/server";

export async function allowIfAuthenticatedMiddleware(request: NextRequest) {
  const token = request.cookies?.get('token')?.value
  if (!token) return NextResponse.next()
  else return NextResponse.redirect(new URL('/dashboard', request.url))
}
