import { JWTToken, verifyToken } from '@/lib/jwtTokenManagement'
import {cookies} from 'next/headers'
import { NextResponse } from 'next/server'
import UserModel from '@/models/User.model'
import dbConnect from '@/lib/dbConnect'

export async function GET(){
    try {
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
            decodedToken = verifyToken(token)
        } catch (err) {
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
        // Verify user exists in database
        await dbConnect()
        const user = await UserModel.findOne({ phone: decodedToken.phone })
        
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found in database",
                user: null
            }, {status: 404})
        }

        return NextResponse.json({
            success: true,
            message: "User data found",
            user: {
                phone: user.phone,
                name: user.name,
                shopName: user.shopName,
                preferredLanguage: user.preferredLanguage
            }
        }, {status: 200})
    } catch (error) {
        console.error("Error in get-user route:", error)
        return NextResponse.json({
            success: false,
            message: "Internal server error",
            user: null
        }, {status: 500})
    }
}