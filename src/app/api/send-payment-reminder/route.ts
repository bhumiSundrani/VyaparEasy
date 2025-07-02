import dbConnect from "@/lib/dbConnect";
import { verifyToken } from "@/lib/jwtTokenManagement";
import { sendSMS } from "@/lib/sendSMS";
import NotificationModel from "@/models/Notification.model";
import TransactionModel from "@/models/Transaction.Model";
import UserModel from "@/models/User.model";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET () {
    await dbConnect()
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
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const transactions = await TransactionModel.find({
        userId: user._id,
        type: 'sale',
        paymentType: 'credit',
        paid: false,
        dueDate: {
            $gte: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
            $lte: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
        }
    })

    if(!transactions){
        return
    }

    try {
        for(const txn of transactions){
            if (txn?.dueDate) {
            const due = new Date(txn.dueDate);
            due.setHours(0, 0, 0, 0);
            const daysDiff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if ([-2, 0, 2].includes(daysDiff)) {
                const message = `
                Hi ${txn.customer?.name}, your payment of ₹${txn.totalAmount} on purchase on ${txn.transactionDate.toLocaleDateString()} is ${daysDiff === 2 ? `due in 2 days.`: daysDiff === 0 ? `due today.`: `overdue by 2 days`}. Please pay at your earliest convenience.
                `;
                const phone = txn.customer?.phone;
                if(phone) {
                    const res = await sendSMS(phone, message)
                    if(res) {await NotificationModel.create({
                        user: user._id,
                        title: "Payment alert sent to customer",
                        message: `Repayment reminder of ₹${txn.totalAmount} is sent to ${txn.customer?.name} for purchase on ${txn.transactionDate.toLocaleDateString()}.`,
                        type: "reminder",
                        isRead: false
                    })
                    return NextResponse.json({
                        success: true,
                        message: "Reminder sent to customer"
                    }, {status: 200})
                }
                }
            }
        }
        }
    } catch (error) {
        console.log("Error sending reminder to customer: ", error)
         return NextResponse.json({
                        success: false,
                        message: "Failed to send reminder"
                    }, {status: 500})
    }
}