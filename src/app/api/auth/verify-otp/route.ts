import dbConnect from "@/lib/dbConnect";
import { generateToken } from "@/lib/jwtTokenManagement";
import OtpVerificationModel from "@/models/OtpVerification.model";
import UserModel from "@/models/User.model";
import { verificationSchema } from "@/schemas/verifySchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const body = await req.json();
        const parsed = verificationSchema.safeParse(body);

        if (!parsed.success) {
            console.log(parsed.error.issues);
            return NextResponse.json({
                success: false,
                message: "Invalid input"
            }, { status: 400 });
        }

        const { phone, otp } = parsed.data;
        const record = await OtpVerificationModel.findOne({ phone: `+91${phone}` });

        if (!record) {
            return NextResponse.json({
                success: false,
                message: "OTP record not found. Please request a new OTP."
            }, { status: 404 });
        }

        if (record.isVerified) {
            return NextResponse.json({
                success: false,
                message: "OTP already used"
            }, { status: 400 });
        }

        if (record && record.expiresAt < new Date()) {
            return NextResponse.json({
                success: false,
                message: "OTP Expired. Please try again!"
            }, { status: 400 });
        }

        if (record && otp !== record.otp) {
            return NextResponse.json({
                success: false,
                message: "Wrong OTP"
            }, { status: 400 });
        }

        record.isVerified = true;
        await record.save();

        // Find existing user in user database
        const existingUser = await UserModel.findOne({ phone: `+91${phone}` });

        if (existingUser) {
            const token = generateToken({
                phone: `+91${phone}`,
                name: existingUser.name,
                shopName: existingUser.shopName,
                preferredLanguage: existingUser.preferredLanguage
            });

            if (!token) {
                return NextResponse.json({
                    success: false,
                    message: "Error generating token"
                }, { status: 500 });
            }

            // Set cookie for authentication
            const cookie = `token=${token}; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/; Secure=${process.env.NODE_ENV === 'production' ? 'true' : 'false'}`;

            const response = NextResponse.json({
                success: true,
                message: "OTP verified"
            }, { status: 200 });

            response.headers.set("Set-Cookie", cookie);
            return response;
        }

        return NextResponse.json({
            success: true,
            message: "OTP verified"
        }, { status: 200 });

    } catch (error) {
        console.error("Error verifying OTP: ", error);
        return NextResponse.json({
            success: false,
            message: "Error verifying OTP"
        }, { status: 500 });
    }
}
