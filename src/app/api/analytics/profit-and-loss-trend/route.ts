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
    // 1. Authenticate user
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

    // 2. Extract query params
    const view = searchParams.get("view") || "yearly";
    const yearParam = searchParams.get("year");

    let groupFields: any;
    let labelFormatter: (id: any) => string;
    const matchBase: any = { userId: user._id };

    // 3. Grouping logic based on view
    if (view === "yearly") {
      groupFields = { year: { $year: "$createdAt" } };
      labelFormatter = (id) => `${id.year}`;
    } else if (view === "monthly") {
      const year = parseInt(yearParam || `${new Date().getFullYear()}`);
      matchBase.createdAt = {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31, 23, 59, 59, 999),
      };
      groupFields = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
      labelFormatter = (id) => `${id.month.toString().padStart(2, "0")}/${id.year}`;
    } else if (view === "daily") {
      const today = new Date();
      const fromDate = new Date(today);
      fromDate.setDate(today.getDate() - 6);
      fromDate.setHours(0, 0, 0, 0);
      matchBase.createdAt = { $gte: fromDate, $lte: today };

      groupFields = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
      labelFormatter = (id) => {
        const date = new Date(id.year, id.month - 1, id.day);
        return date.toISOString().split("T")[0];
      };
    } else {
      return NextResponse.json({ success: false, message: "Invalid view" }, { status: 400 });
    }

    // 4. Sales Aggregation
    const salesAgg = await TransactionModel.aggregate([
      { $match: { ...matchBase, type: "sale" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: groupFields,
          revenue: { $sum: "$totalAmount" },
          cogs: { $sum: { $multiply: ["$items.costPrice", "$items.quantity"] } },
        },
      },
    ]);

    // 5. Expense Aggregation
    const expensesAgg = await TransactionModel.aggregate([
      { $match: { ...matchBase, type: "purchase" } },
      {$unwind: "$otherExpenses"},
      {
        $group: {
          _id: groupFields,
          expenses: { $sum: "$otherExpenses.amount" },
        },
      },
    ]);

    // 6. Merge & compute net profits
    const dataMap = new Map<string, { revenue: number; cogs: number; expenses: number }>();

    for (const s of salesAgg) {
      const label = labelFormatter(s._id);
      const existing = dataMap.get(label) || { revenue: 0, cogs: 0, expenses: 0 };
      dataMap.set(label, { ...existing, revenue: s.revenue, cogs: s.cogs });
    }

    for (const e of expensesAgg) {
      const label = labelFormatter(e._id);
      const existing = dataMap.get(label) || { revenue: 0, cogs: 0, expenses: 0 };
      dataMap.set(label, { ...existing, expenses: e.expenses });
    }

    // 7. Prepare response
    const labels = [...dataMap.keys()].sort();
    const netProfits = labels.map((label) => {
      const { revenue, cogs, expenses } = dataMap.get(label)!;
      return revenue - cogs - expenses;
    });

    const responseData = {
      success: true,
      message: "Profit/Loss data sent successfully",
      view,
      labels,
      netProfits,
    }

    await setCache(`${req.nextUrl.pathname}:${token}`, responseData, 300)
    

    return NextResponse.json(responseData, {status: 200});
  } catch (error) {
    console.error("Error fetching profit/loss data:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
