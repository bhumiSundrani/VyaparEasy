import { invalidateCache } from "@/app/middlewares/cacheMiddleware";
import dbConnect from "@/lib/dbConnect";
import { verifyToken } from "@/lib/jwtTokenManagement";
import NotificationModel from "@/models/Notification.model";
import UserModel from "@/models/User.model";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
        await dbConnect()
    
    try {
        // Add defensive check for params
        if (!context || !context.params) {
            return NextResponse.json({
                success: false,
                message: "Missing parameters"
            }, { status: 400 });
        }

        const resolvedParams = await context.params;
        
        // Add defensive check for id
        if (!resolvedParams || !resolvedParams.id) {
            return NextResponse.json({
                success: false,
                message: "Missing notification ID"
            }, { status: 400 });
        }

        const id = resolvedParams.id;
        
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

        // Update notification
        await NotificationModel.findByIdAndUpdate(id, {
            isRead: true
        });


        await invalidateCache(`/api/get-notifications:${token}`)
        
        return NextResponse.json({
            success: true,
            message: "Notification marked as read"
        }, { status: 200 });

    } catch (error) {
        console.log("Cannot mark notification as read: ", error);
        return NextResponse.json({
            success: false,
            message: "Error marking notification as read"
        }, { status: 500 });
    }
}