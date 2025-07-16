import { verifyToken } from "@/lib/jwtTokenManagement";
import NotificationModel from "@/models/Notification.model";
import ProductModel from "@/models/Product.model";
import TransactionModel from "@/models/Transaction.Model";
import UserModel from "@/models/User.model";
import { User } from "lucide-react";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET (){
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
            
                
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);

                const todaySales = await TransactionModel.aggregate([
                    {$match: {
                        userId: user._id,
                        type: "sale",
                        transactionDate: {$gte: today, $lte: tomorrow}
                    }}, {
                        $group: {
                            _id: null,
                            totalSaleAmount: {$sum: "$totalAmount"}
                        }
                    }
                ])

                const todayPurchases = await TransactionModel.aggregate([
                    {$match: {
                        userId: user._id,
                        type: "purchase",
                        transactionDate: {$gte: today, $lte: tomorrow}
                    }}, {
                        $group: {
                            _id: null,
                            totalPurchaseAmount: {$sum: "$totalAmount"}
                        }
                    }
                ])

                const totalCreditSales = await TransactionModel.aggregate([
                    {$match: {
                        userId: user._id,
                        type: "sale",
                        paymentType: "credit",
                        transactionDate: {$gte: today, $lte: tomorrow}
                    }}, {
                        $group: {
                            _id: null,
                            totalCreditSaleAmount: {$sum: "$totalAmount"}
                        }
                    }
                ])
                
                const totalOutstandingCredit = await TransactionModel.aggregate([
                    {$match: {
                        userId: user._id,
                        type: "purchase",
                        paymentType: "credit",
                        transactionDate: {$gte: today, $lte: tomorrow}
                    }}, {
                        $group: {
                            _id: null,
                            totalOutstandingCreditAmount: {$sum: "$totalAmount"}
                        }
                    }
                ])

                const totalCashReceived = await TransactionModel.aggregate([
                    {$match: {
                        userId: user._id,
                        type: "sale",
                        paymentType: "cash",
                        transactionDate: {$gte: today, $lte: tomorrow}
                    }}, {
                        $group: {
                            _id: null,
                            totalCashReceivedAmount: {$sum: "$totalAmount"}
                        }
                    }
                ])

                const totalInventory = await ProductModel.aggregate([
  {
    $match: {
      user: user._id,
      currentStock: { $gt: 0 }
    }
  },
  {
    $project: {
      inventoryValue: { $multiply: ["$costPrice", "$currentStock"] }
    }
  },
  {
    $group: {
      _id: null,
      totalInventoryAmount: { $sum: "$inventoryValue" }
    }
  },
  {
    $project: {
      _id: 0,
      totalInventoryAmount: 1
    }
  }
]);

                return NextResponse.json({
                    success: true,
                    message: "Stats received successfully",
                    stats: {
                        sales: todaySales[0]?.totalSaleAmount || 0,
                        purchases: todayPurchases[0]?.totalPurchaseAmount || 0,
                        creditSales: totalCreditSales[0]?.totalCreditSaleAmount || 0,
                        outstandingCredit: totalOutstandingCredit[0]?.totalOutstandingCreditAmount || 0,
                        cashReceived: totalCashReceived[0]?.totalCashReceivedAmount || 0,
                        inventoryAmount: totalInventory[0]?.totalInventoryAmount || 0
                    }
                }, {status: 200})

            } catch (error) {
                console.log("Error fetching dashboard stats: ", error)
                return NextResponse.json({
                        success: false,
                        message: "Error fetching dashboard stats"
                    }, {status: 500})
            }

}