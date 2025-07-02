import dbConnect from "@/lib/dbConnect";
import { verifyToken } from "@/lib/jwtTokenManagement";
import NotificationModel from "@/models/Notification.model";
import TransactionModel from "@/models/Transaction.Model";
import UserModel from "@/models/User.model";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function  GET(){
    await dbConnect()
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

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const transactions = await TransactionModel.find({
        userId: user._id,
        type: 'purchase',
        paymentType: 'credit',
        paid: false,
        dueDate: {
            $gte: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
            $lte: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
        }
        })

        if(transactions){
            for(const txn of transactions){
                await NotificationModel.create({
                        user: user._id,
                        title: "Payment due to vendor",
                        message: `Payment of ₹${txn.totalAmount} is due to ${txn.supplier?.name} for purchase on ${txn.transactionDate.toLocaleDateString()}.`,
                        type: "reminder",
                        isRead: false
                })
                return NextResponse.json({
                    success: true,
                    message: "Payment alert sent successfully"
                }, {status: 200})
            }
        }else{
            return;
        }
}