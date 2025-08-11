import { setCache } from "@/app/middlewares/cacheMiddleware";
import { verifyToken } from "@/lib/jwtTokenManagement";
import TransactionModel from "@/models/Transaction.Model";
import UserModel from "@/models/User.model";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET (req: NextRequest){
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
            
            const { searchParams } = new URL(req.url);
            const fromParam = searchParams.get("from");
            const toParam = searchParams.get("to");
            const customer = searchParams.get("customer");
            const product = searchParams.get("product");
            const paymentType = searchParams.get("payment-type")
            let from = fromParam ? new Date(fromParam) : null
            let to = toParam ? new Date(toParam) : null
            const today = new Date();

            if (!to) {
            to = new Date(today);
            }

            if (!from) {
            from = new Date(to); // base it on `to`
            from.setDate(to.getDate() - 6); // Last 7 days = today + 6 before
            }

             to.setHours(23, 59, 59, 999); // End of today
            from.setHours(0, 0, 0, 0); // Start of day

            const query : any = {
                userId: user._id,
                type: "sale",
                createdAt: {$gte: from, $lte: to}
            }

            if(customer){
                query["customer.name"] = { $regex: customer, $options: "i" };
            }

            if(paymentType){
                query["paymentType"] = paymentType
            }

            if (product) {
                query["items.productName"] = { $regex: product, $options: "i" }; // case-insensitive match
            }

                
            try {
                const totalSales = await TransactionModel.aggregate([
                { $match: query },
                { $unwind: "$items" },
                {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          totalSales: { $sum: "$totalAmount" }
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
          totalSales: 1
        }
      }
    ]);

    const responseData = {
                    success: true,
                    message: "Sales analytics sent successfully: ",
                    totalSales
                }

            await setCache(`${req.nextUrl.pathname}:${token}`, responseData, 300)
    

                return NextResponse.json(responseData, {status: 200})
            } catch (error) {
                console.log("Error fetching sales analytics data: ", error)
                return NextResponse.json({
                        success: false,
                        message: "Error fetching sales analytics data"
                    }, {status: 500})
            }

}