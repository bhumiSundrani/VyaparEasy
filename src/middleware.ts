import type { NextRequest } from 'next/server'
import { authMiddleware } from './app/middlewares/auth'
import { allowIfAuthenticatedMiddleware } from './app/middlewares/allowIfAuthenticated'

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    if(pathname.startsWith('/verify-user')){
        return allowIfAuthenticatedMiddleware(request)
    }else {
        return authMiddleware(request)
    }
}

export const config = {
    matcher: [
        '/((?!_next|favicon.ico|images|api|.*\\..*).*)',
    ],
}
