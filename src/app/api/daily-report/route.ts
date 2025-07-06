import dbConnect from "@/lib/dbConnect";
import NotificationModel from "@/models/Notification.model";
import TransactionModel from "@/models/Transaction.Model";
import UserModel from "@/models/User.model";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await dbConnect();

  // ✅ Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const users = await UserModel.find();

  for (const user of users) {
    const [totalPurchase] = await TransactionModel.aggregate([
      {
        $match: {
          userId: user._id,
          type: "purchase",
          transactionDate: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          totalPurchaseAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    const [totalSale] = await TransactionModel.aggregate([
      {
        $match: {
          userId: user._id,
          type: "sale",
          transactionDate: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          totalSaleAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    const creditSaleCount = await TransactionModel.countDocuments({
      userId: user._id,
      type: "sale",
      paymentType: "credit",
      transactionDate: { $gte: today, $lt: tomorrow },
    });

    const saleAmount = totalSale?.totalSaleAmount || 0;
    const purchaseAmount = totalPurchase?.totalPurchaseAmount || 0;

    const message = `Today's Summary: ₹${saleAmount} sales, ₹${purchaseAmount} purchases, ${creditSaleCount} credit sales.`;

    await NotificationModel.create({
      user: user._id,
      title: "Today's Report",
      message,
      type: "info",
      isRead: false,
    });

    console.log(`✅ Notification sent to ${user.phone} | ${message}`);
  }

  return NextResponse.json({ success: true, message: "All user reports sent" }, { status: 200 });
}
