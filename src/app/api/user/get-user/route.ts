import { verifyToken } from '@/lib/jwtTokenManagement'
import { JWTToken } from '@/types/jwt'
import {cookies} from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import UserModel from '@/models/User.model'
import dbConnect from '@/lib/dbConnect'
import { setCache } from '@/app/middlewares/cacheMiddleware'

export async function GET(req: NextRequest){
    try {
            await dbConnect()
        
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value
        
        if(!token){
            return NextResponse.json({
                success: false,
                message: "No authentication token found",
                user: null
            }, {status: 401})
        }

        let decodedToken: JWTToken | null = null
        try {
            decodedToken = await verifyToken(token)
        } catch (err) {
            console.log(err)
            return NextResponse.json({
                success: false,
                message: "Invalid or expired token",
                user: null
            }, { status: 401 })
        }
        if(!decodedToken){
            return NextResponse.json({
                success: false,
                message: "Token not found",
                user: null
            }, { status: 401 })
        }
        const user = await UserModel.findOne({ phone: decodedToken.phone })
        
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found in database",
                user: null
            }, {status: 404})
        }

        const responseData = {
            success: true,
            message: "User data found",
            user: {
                phone: user.phone,
                name: user.name,
                shopName: user.shopName,
                preferredLanguage: user.preferredLanguage
            }
        }

        await setCache(`${req.nextUrl.pathname}:${token}`, responseData, 360000)

        return NextResponse.json(responseData, {status: 200})
    } catch (error) {
        console.error("Error in get-user route:", error)
        return NextResponse.json({
            success: false,
            message: "Internal server error",
            user: null
        }, {status: 500})
    }
}