import { setCache } from "@/app/middlewares/cacheMiddleware";
import dbConnect from "@/lib/dbConnect";
import { verifyToken } from "@/lib/jwtTokenManagement";
import NotificationModel from "@/models/Notification.model";
import ProductModel from "@/models/Product.model";
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
               const lowStockProducts = await ProductModel.find({
                    user: user._id,
                    $expr: {
                        $lte: ["$currentStock", "$lowStockThreshold"]
                    }   
                });

                const responseData = {
        success: true,
        message: "Low stock products received",
        lowStockProducts
    }

    await setCache(`${req.nextUrl.pathname}:${token}`, responseData, 300);

    return NextResponse.json(responseData, {status: 200})


            } catch (error) {
                console.log("Error fetching low stock products: ", error)
                return NextResponse.json({
                        success: false,
                        message: "Error fetching low stock products"
                    }, {status: 500})
            }

}