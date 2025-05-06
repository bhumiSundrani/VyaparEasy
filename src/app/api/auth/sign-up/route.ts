import dbConnect from '@/lib/dbConnect'
import OtpVerificationModel from '@/models/OtpVerification.model'
import UserModel from '@/models/User.model'
import { signupSchema } from '@/schemas/signupSchema'
import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '@/lib/jwtTokenManagement'

export async function POST(req: NextRequest){
    await dbConnect()
    try{
        const body = await req.json()
        const parsed = signupSchema.safeParse(body)
        if(!parsed.success){
            console.log("Error parsing data: ", parsed.error.issues)
            return NextResponse.json({
                success: false,
                message: "Invalid Input"
            }, {status: 400})
        }
        const {name, shopName, phone, preferredLanguage} = parsed.data
        const verifiedUser = await OtpVerificationModel.findOne({phone: `+91${phone}`})
        if(!verifiedUser || !verifiedUser.isVerified){
            return NextResponse.json({
                success: false,
                message: "User is not verified"
            }, {status: 400})
        }
        const existingUser = await UserModel.findOne({
            phone
        })
        if(existingUser){
            return NextResponse.json({
                success: false,
                message: "User already regiseterd"
            }, {status: 400})
        }
        const newUser = new UserModel({
            name,
            shopName,
            phone: `+91${phone}`,
            preferredLanguage,
            isVerified: true
        })
        await newUser.save()
         const token = generateToken({
            phone: `+91${phone}`,
            name: newUser.name,
            shopName: newUser.shopName,
            preferredLanguage: newUser.preferredLanguage
        })
        if (token == null) {
             return NextResponse.json({
                success: false,
                message: "Error generating token"
            }, { status: 500 });
        }
        const cookie = `token=${token}; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/; Secure=${process.env.NODE_ENV === 'production' ? 'true' : 'false'}`;
        const response =  NextResponse.json({
            success: true,
            message: "user registered successfully"
        }, {status: 201})
        response.headers.set('Set-Cookie', cookie);
        return response;
    }catch(error){
        console.error("Error registering user: ", error)
        return NextResponse.json({
            success: false,
            error: "Error registering the user"
        }, {status: 500})
    }
}

