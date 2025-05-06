import { verifyToken } from "@/lib/jwtTokenManagement";
import { NextRequest, NextResponse } from "next/server";

export function allowIfAuthenticatedMiddleware(request: NextRequest){
    const token = request.cookies?.get('token')?.value
    if(!token) return NextResponse.next()
    try {
        const user = verifyToken(token)
        if(!user) return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch (error) {
        return NextResponse.next()
    }
}