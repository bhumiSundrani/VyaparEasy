import { NextResponse, type NextRequest } from 'next/server'
import { authMiddleware } from './app/middlewares/auth'
import { allowIfAuthenticatedMiddleware } from './app/middlewares/allowIfAuthenticated'
import { cacheMiddleware } from './app/middlewares/cacheMiddleware'

export async function  middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    if(pathname.startsWith('/verify-user')){
        return allowIfAuthenticatedMiddleware(request)
    }

    const authResult = await authMiddleware(request);
  if (authResult && authResult.redirected) {
    return authResult; // unauthenticated → redirect
  }

 if (pathname.startsWith("/api")) {
  const cacheResult = await cacheMiddleware(request, (req) => {
    const token = req.cookies.get("token")?.value || "guest";
    return `${req.nextUrl.pathname}:${token}`;
  });
  if (cacheResult) return cacheResult;
}


  // 3. Continue to route if no cache hit
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|images|api/auth|.*\\..*).*)',
  ],
};

