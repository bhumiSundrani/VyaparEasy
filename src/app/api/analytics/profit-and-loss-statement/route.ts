import { setCache } from "@/app/middlewares/cacheMiddleware";
import dbConnect from "@/lib/dbConnect";
import { verifyToken } from "@/lib/jwtTokenManagement";
import TransactionModel from "@/models/Transaction.Model";
import UserModel from "@/models/User.model";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
      await dbConnect()
  
  const { searchParams } = new URL(req.url);

  try {
    // 1. Authenticate
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

    // 2. Get Date Range
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    let from = fromParam ? new Date(fromParam) : null;
    let to = toParam ? new Date(toParam) : null;


    const today = new Date();

    if (!to) {
            to = new Date(today);
            }

            if (!from) {
            from = new Date(today); // base it on `to`
            
            }

            
            to.setHours(23, 59, 59, 999); // End of today
            from.setHours(0, 0, 0, 0); // Start of day

    const matchRange = {
      userId: user._id,
      createdAt: { $gte: from, $lte: to },
    };

    // 3. Revenue & COGS
    const salesAgg = await TransactionModel.aggregate([
      { $match: { ...matchRange, type: "sale" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
          cogs: { $sum: { $multiply: ["$items.costPrice", "$items.quantity"] } }
        }
      }
    ]);

    const revenue = salesAgg[0]?.revenue || 0;
    const cogs = salesAgg[0]?.cogs || 0;

    // 4. Expenses
    const expensesAgg = await TransactionModel.aggregate([
      { $match: { ...matchRange, type: "purchase" } },
      {$unwind: "$otherExpenses"},
      {
        $group: {
          _id: null,
          expenses: { $sum: "$otherExpenses.amount" }
        }
      }
    ]);

    const expenses = expensesAgg[0]?.expenses || 0;
    const netProfit = revenue - cogs - expenses;

    const responseData = {
      success: true,
      message: "Profit and Loss statement sent successfully",
      from,
      to,
      summary: {
        revenue,
        cogs,
        expenses,
        netProfit
      }
    }

          await setCache(`${req.nextUrl.pathname}:${token}`, responseData, 300)
    

    // 5. Response
    return NextResponse.json(responseData, {status: 200});

  } catch (error) {
    console.error("Error fetching profit/loss summary:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
