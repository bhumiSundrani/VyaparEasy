import { verifyToken } from "@/lib/jwtTokenManagement";
import { sendSMS } from "@/lib/sendSMS";
import NotificationModel from "@/models/Notification.model";
import TransactionModel from "@/models/Transaction.Model";
import UserModel from "@/models/User.model";
import { User } from "lucide-react";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET (req: NextRequest){
            const { searchParams } = new URL(req.url);
            const phone = searchParams.get("phone")
            const amount = searchParams.get("amount")
            const name = searchParams.get("name")
    // Get user from token
            const cookieStore = await cookies();
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
             const message = `
Hi ${name}, your payment of ₹${amount} on purchase from ${user.shopName} is due. Please pay at your earliest convenience.`;                
            try {
               
                if (phone) {
            const res = await sendSMS(phone, message);
            if (res) {
              await NotificationModel.create({
                user: user._id,
                title: "Payment alert sent to customer",
                message: `Repayment reminder of ₹${amount} is sent to ${name} for purchase.`,
                type: "reminder",
                isRead: false,
              });
            }
          }

    return NextResponse.json({
        success: true,
        message: "Reminder sent"
    }, {status: 200})


            } catch (error) {
                console.log("Error sending reminder: ", error)
                return NextResponse.json({
                        success: false,
                        message: "Error sending reminder"
                    }, {status: 500})
            }

}