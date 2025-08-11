import { setCache } from "@/app/middlewares/cacheMiddleware";
import { verifyToken } from "@/lib/jwtTokenManagement";
import TransactionModel from "@/models/Transaction.Model";
import UserModel from "@/models/User.model";
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
                const otherExpensesTrend = await TransactionModel.aggregate([
  {
    $match: {
      userId: user._id,
      type: "purchase",
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - Number(days)))
      }
    }
  },
  {
    $unwind: "$otherExpenses"
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" }
      },
      totalOtherExpenses: { $sum: "$otherExpenses.amount" }
    }
  },
  {
    $sort: {
      "_id.year": 1,
      "_id.month": 1,
      "_id.day": 1
    }
  },
  {
    $project: {
      _id: 0,
      date: {
        $dateFromParts: {
          year: "$_id.year",
          month: "$_id.month",
          day: "$_id.day"
        }
      },
      totalOtherExpenses: 1
    }
  }
]);
const responseData = {
        success: true,
        message: "Expenses trend data received",
        otherExpensesTrend
    }

    await setCache(`${req.nextUrl.pathname}:${token}`, responseData, 300)


    return NextResponse.json(responseData, {status: 200})


            } catch (error) {
                console.log("Error fetching expenses trens ", error)
                return NextResponse.json({
                        success: false,
                        message: "Error fetching expenses trens"
                    }, {status: 500})
            }

}