import dbConnect from "@/lib/dbConnect";
import { verifyToken } from "@/lib/jwtTokenManagement";
import NotificationModel from "@/models/Notification.model";
import UserModel from "@/models/User.model";
import { User } from "lucide-react";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET (){

    await dbConnect()
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
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(today.getMonth() - 1);

                const notifications = await NotificationModel.find({
                    user: user._id,
                    isRead: false,
                    createdAt: {
                        $gte: oneMonthAgo,
                        $lte: today,
                    },
                    }).sort({ createdAt: -1 });
                    return NextResponse.json({
                        success: true,
                        message: notifications.length > 0 ? "Notifications fetched successfully" : "No notifications found",
                        notifications
                    }, {status: 200})
            } catch (error) {
                console.log("Error fetching notifications: ", error)
                return NextResponse.json({
                        success: false,
                        message: "Error fetching notifications"
                    }, {status: 500})
            }

}