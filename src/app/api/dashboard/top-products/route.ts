import dbConnect from "@/lib/dbConnect";
import { verifyToken } from "@/lib/jwtTokenManagement";
import NotificationModel from "@/models/Notification.model";
import TransactionModel from "@/models/Transaction.Model";
import UserModel from "@/models/User.model";
import { User } from "lucide-react";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET (req: NextRequest){
    await dbConnect()
    // Get user from token
            const cookieStore = await cookies();
            const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '7', 10);
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
               const topProducts = await TransactionModel.aggregate([
                {$match: {
                    userId: user._id,
                    type: "sale"
                }}, 
                {$unwind: "$items"},
                {$group: {
                    _id: "$items.productId",
                    productName: { $first: "$items.productName" },
                    totalUnitsSold: { $sum: "$items.quantity" },
                    totalSalesValue: { $sum: { $multiply: ["$items.quantity", "$items.pricePerUnit"] } }
                }},{
                    $sort: {totalUnitsSold: -1}
                },
                {$limit: 5}
               ])

    return NextResponse.json({
        success: true,
        message: "Top products data received",
        topProducts
    }, {status: 200})


            } catch (error) {
                console.log("Error fetching top products data: ", error)
                return NextResponse.json({
                        success: false,
                        message: "Error fetching top products data"
                    }, {status: 500})
            }

}