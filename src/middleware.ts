import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authMiddleware } from './app/middlewares/auth'
import { allowIfAuthenticatedMiddleware } from './app/middlewares/allowIfAuthenticated'

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    if(pathname.startsWith('/dashboard')){
      return authMiddleware(request)
    }
  
    if(pathname.startsWith('/verify-user')){
      return allowIfAuthenticatedMiddleware(request)
    }
}

export const config = {
  matcher: [
    '/dashboard',
    '/verify-user/:path*',
  ],
}
