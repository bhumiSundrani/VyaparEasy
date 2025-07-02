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

        const today = new Date();
today.setHours(0, 0, 0, 0);

const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

const totalPurchase = await TransactionModel.aggregate([
  {
    $match: {
      userId: user._id,
      type: "purchase",
      transactionDate: {
        $gte: today,
        $lt: tomorrow,
      },
    },
  },
  {
    $group: {
      _id: null,
      totalPurchaseAmount: { $sum: "$totalAmount" },
    },
  },
]);

const purchaseAmount = totalPurchase[0]?.totalPurchaseAmount || 0;

const totalSale = await TransactionModel.aggregate([{
    $match: {
        userId: user._id,
        type: "sale",
        transactionDate: {
        $gte: today,
        $lt: tomorrow,
      },

    }, 
    $group: {
        _id: null,
        totalSaleAmount: {$sum: "$totalAmount"}
    }
}])

const saleAmount = totalSale[0]?.totalSaleAmount || 0;

const creditSaleCount = await TransactionModel.countDocuments({
    userId: user._id,
    type: "sale",
    paymentType: "credit",
    transactionDate: {
        $gt: today,
        $lt: tomorrow
    }
})

await NotificationModel.create({
    title: "Today's Report",
    message: `Today's Summary: ₹${saleAmount} sales, ₹${purchaseAmount} purchases, ${creditSaleCount} credit sales.`
})

}