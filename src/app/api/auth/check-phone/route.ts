import dbConnect from "@/lib/dbConnect";
import { phoneSchema } from "@/schemas/phoneSchema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    await dbConnect()
    try {
        const {searchParams} = new URL(req.url)
        console.log("Phone param:", searchParams.get("phone"));

        const queryParam = {
            phone: searchParams.get("phone") || ""
        }
        const res = phoneSchema.safeParse(queryParam)
        if(!res.success){
            const phoneError = res.error.format().phone?._errors || []
            return NextResponse.json({
                success: false,
                message: phoneError?.length > 0 ? phoneError.join(", ") : "Invalid query parameters"
            }, {status: 400})
        }
        const {phone} = res.data
        return NextResponse.json({
            success: true,
            message: "Phone number is valid"
        }, {status: 200})
    } catch (error) {
        console.log("Error checking phone number: ", error)
        return NextResponse.json({
            success: false,
            message: "Error checking username"
        }, {status: 500})
    }
}