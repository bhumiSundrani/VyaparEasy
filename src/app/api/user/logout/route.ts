import { invalidateCache } from "@/app/middlewares/cacheMiddleware";
import { verifyToken } from "@/lib/jwtTokenManagement";
import UserModel from "@/models/User.model";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    try {

        const cookieStore = await cookies();
                    const { searchParams } = new URL(req.url);
          const days = parseInt(searchParams.get('days') || '7', 10);
                    const token = cookieStore.get('token')?.value;
                    if (!token) {
                        return NextResponse.json({
                            success: false,
                            message: "Unauthorized access"
                        }, { status: 401 });
                    }
            
                    const decodedToken = await verifyToken(token);
                    if (!decodedToken) {
                        return NextResponse.json({
                            success: false,
                            message: "Invalid token"
                        }, { status: 401 });
                    }
        
                    const user = await UserModel.findOne({ phone: decodedToken.phone });
                            if (!user) {
                                return NextResponse.json({
                                    success: false,
                                    message: "User not found"
                                }, { status: 401 });
                            }
        await invalidateCache(`/api/user/get-user:${token}`)
        await invalidateCache(`/api/products:${token}`)
        await invalidateCache(`/api/get-notifications:${token}`)
        await invalidateCache(`/api/categories:${token}`)
        
        


    const response = NextResponse.json({
        success: true,
        message: "Logged out successfully"
    }, {status: 200})
    response.cookies.set("token", "", {
        httpOnly: true,
        path: '/',
        expires: new Date(0)
    })
    return response
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Logged out failed"
        }, {status: 500})
    }
    
}