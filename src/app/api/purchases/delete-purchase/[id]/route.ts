import { invalidateCache } from "@/app/middlewares/cacheMiddleware";
import dbConnect from "@/lib/dbConnect";
import { verifyToken } from "@/lib/jwtTokenManagement";
import PartyModel from "@/models/Party.model";
import ProductModel from "@/models/Product.model";
import TransactionModel from "@/models/Transaction.Model";
import UserModel from "@/models/User.model";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string } >}) {
    await dbConnect()
  const {id} = await params

  try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
  
        if (!token) {
            return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 });
        }
  
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
        }
  
        const user = await UserModel.findOne({ phone: decodedToken.phone });
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 401 });

        }

        const purchase = await TransactionModel.findById(id)
        if(!purchase){
            return NextResponse.json({
                success: false,
                message: "Transaction not found"
            }, {status: 404})
        }
        
        const items = purchase.items

        for (const item of items) {
            const exists = await ProductModel.findById(item.productId);
            if (!exists) {
                return NextResponse.json({
                    success: false,
                    message: `Product with id ${item.productId} does not exist`
                }, { status: 400 });
            }else{
              await ProductModel.updateOne({_id: exists._id}, {currentStock: exists.currentStock - item.quantity})
            }
        }

        const party = await PartyModel.findOne({phone: purchase.supplier?.phone, user: purchase.userId})

        if(!party){
            return NextResponse.json({
                success: false,
                message: "Party doesn't exist"
            }, {status: 404})
        }

        party.transactionId = party.transactionId.filter(
            t => t.toString() !== purchase._id.toString()
        );
        await party.save()

        await TransactionModel.deleteOne({_id: purchase._id})

                await invalidateCache(`/api/products:${token}`)
                            await invalidateCache(`/api/dashboard/get-stats:${token}`)
                                    await invalidateCache(`/api/dashboard/recent-purchases:${token}`)
await invalidateCache(`/api/analytics/profit-and-loss-statement:${token}`)
                          await invalidateCache(`/api/analytics/profit-and-loss-trend:${token}`)
                        await invalidateCache(`/api/analytics/expenses-trend:${token}`)
                                                await invalidateCache(`/api/analytics/purchases-trend:${token}`)

        return NextResponse.json({
            success: true,
            message: "Transaction deleted successfully"
        }, {status: 200})
    }catch (error){
        console.error("Error deleting purchase: ", error)
        return NextResponse.json({
            success: false,
            message: "Error deleting transaction"
        }, {status: 500})
    }

}