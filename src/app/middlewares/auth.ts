import { verifyToken } from "@/lib/jwtTokenManagement"
import { NextRequest, NextResponse } from "next/server"

export async function authMiddleware(request: NextRequest) {
  const token = request.cookies?.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/verify-user', request.url))
  }

  try {
    const user = await verifyToken(token)
    console.log(user)
    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL('/verify-user', request.url))
  }
}
