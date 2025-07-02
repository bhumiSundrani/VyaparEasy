import dbConnect from "@/lib/dbConnect";
import { verifyToken } from "@/lib/jwtTokenManagement";
import NotificationModel from "@/models/Notification.model";
import ProductModel from "@/models/Product.model";
import UserModel from "@/models/User.model";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(){
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

        const products = await ProductModel.find({
            user: user._id,
            $expr: { $lte: ["$currentStock", "$lowStockThreshold"] }
        })

        if(products){
            for(const p of products){
                await NotificationModel.create({
                    user: user._id,
                    title: `${p.name} is low in stock`,
                    message: `Only ${p.currentStock} ${p.unit} left of ${p.name}`,
                    type: "stock_alert",
                    isRead: false
                })
                return NextResponse.json({
                    success: true,
                    message: "Stock alert sent successfully"
                }, {status: 200})
            }
        }else{
            return;
        }
}