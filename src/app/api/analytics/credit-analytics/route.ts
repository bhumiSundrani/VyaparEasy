import { setCache } from "@/app/middlewares/cacheMiddleware";
import { verifyToken } from "@/lib/jwtTokenManagement";
import NotificationModel from "@/models/Notification.model";
import TransactionModel from "@/models/Transaction.Model";
import UserModel from "@/models/User.model";
import { User } from "lucide-react";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET (req: NextRequest){
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
               const creditAnalysis = await TransactionModel.aggregate([
                {$match: {
                    userId: user._id,
                    type: "sale",
                    paymentType: "credit",
                    paid: false
                }}, 
                {
    $group: {
      _id: "$customer.phone", // or name if phone not available
      customerName: { $first: "$customer.name" },
      firstCreditDate: {$first: "$transactionDate"},
      totalOutstanding: { $sum: "$totalAmount" }
    }
  },
  {
    $sort: {
      totalOutstanding: -1
    }
  }
               ])

    const responseData = {
        success: true,
        message: "Credit analytics data received",
        creditAnalysis
    }
    
    await setCache(`${req.nextUrl.pathname}:${token}`, responseData, 300)

    return NextResponse.json(responseData, {status: 200})


            } catch (error) {
                console.log("Error fetching credit analytics data: ", error)
                return NextResponse.json({
                        success: false,
                        message: "Error fetching credit analytics data"
                    }, {status: 500})
            }

}