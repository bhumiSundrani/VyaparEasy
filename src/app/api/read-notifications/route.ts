import { invalidateCache } from "@/app/middlewares/cacheMiddleware";
import { verifyToken } from "@/lib/jwtTokenManagement";
import NotificationModel from "@/models/Notification.model";
import UserModel from "@/models/User.model";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH() {
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
                await NotificationModel.updateMany({
                    user: user._id,
                    isRead: false,
                }, {
                    isRead: true
                })
                await invalidateCache(`/api/get-notifications:${token}`)
                
                return NextResponse.json({
                    success: true,
                    message: "All notifications marked as read"
                }, {status: 200})
            } catch (error) {
                console.log("Cannot mark notifications as read: ", error)
                return NextResponse.json({
                    success: false,
                    message: "Error marking notifications as read"
                }, {status: 500})
            }
}