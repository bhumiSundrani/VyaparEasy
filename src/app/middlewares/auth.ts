import { verifyToken } from "@/lib/jwtTokenManagement"
import { NextRequest, NextResponse } from "next/server"

export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  if (!token) {
    if (pathname.startsWith('/verify-user')) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/verify-user', request.url))
  }

  try {
    const user = await verifyToken(token)
    console.log(user)
    return NextResponse.next()
  } catch (error) {
    if (pathname.startsWith('/verify-user')) {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/verify-user', request.url))
  }
}
