import dbConnect from "@/lib/dbConnect";
import { generateOtp } from "@/lib/generateOtp";
import { sendOTP } from "@/lib/sendOTP";
import OtpVerificationModel from "@/models/OtpVerification.model";
import { phoneSchema } from "@/schemas/phoneSchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    await dbConnect()
    try {
        const body = await req.json()
        const parsed = phoneSchema.safeParse(body)
        if(!parsed.success){
            console.log("Error parsing data: ", parsed.error.issues)
            return NextResponse.json({
                success: false,
                message: "Invalid Input"
            }, {status: 400})
        }
        const {phone} = parsed.data

        const otp = generateOtp()
//         const smsPayload : SmsPayload = {
//             phone: `${phone}`,
//             message: `VyaparEasy OTP: ${otp}. Use this to verify your phone number. Do not share it with anyone.
// `
//         }
        const response = await sendOTP({phone, otp})
        if (response?.return !== true) {
            console.log("Error sending otp: ", response)
            return NextResponse.json({
                success: false,
                message: "Error sending otp"
            }, { status: 500 });
        }
        const now = new Date()
        await OtpVerificationModel.findOneAndUpdate(
            {phone: `+91${phone}`},
            {
                phone: `+91${phone}`,
                otp,
                expiresAt: new Date(now.getTime()+5*60*1000),
                isVerified: false
            },
            {upsert: true, new: true}
        )

        return NextResponse.json({
            success: true,
            message: "Otp sent successfully"
        }, {status: 200})
    } catch (error: any) {
        console.log("Error sending otp: ", error)
            return NextResponse.json({
                success: false,
                message: error.message || "Error sending otp"
            }, {status: 500})
    }
}