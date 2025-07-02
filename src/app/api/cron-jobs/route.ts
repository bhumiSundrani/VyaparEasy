import dbConnect from "@/lib/dbConnect";
import { verifyToken } from "@/lib/jwtTokenManagement";
import { sendSMS } from "@/lib/sendSMS";
import NotificationModel from "@/models/Notification.model";
import ProductModel from "@/models/Product.model";
import TransactionModel from "@/models/Transaction.Model";
import UserModel from "@/models/User.model";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(){
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

        const products = await ProductModel.find({
            user: user._id,
            $expr: { $lte: ["$currentStock", "$lowStockThreshold"] }
        })

        if(products){
            for(const p of products){
                await NotificationModel.create({
                    user: user._id,
                    title: `${p.name} is low in stock`,
                    message: `Only ${p.currentStock} ${p.unit} left of ${p.name}`,
                    type: "stock_alert",
                    isRead: false
                })
            }
        }
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const purchases = await TransactionModel.find({
        userId: user._id,
        type: 'purchase',
        paymentType: 'credit',
        paid: false,
        dueDate: {
            $gte: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
            $lte: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
        }
        })

        if(purchases){
            for(const txn of purchases){
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
        }
        const sales = await TransactionModel.find({
        userId: user._id,
        type: 'sale',
        paymentType: 'credit',
        paid: false,
        dueDate: {
            $gte: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
            $lte: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
        }
    })

    if(sales){
        for(const txn of sales){
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
    }
    return NextResponse.json({
        success: true,
        message: "Cron jobs ran successfully"
    }, {status: 200})
}