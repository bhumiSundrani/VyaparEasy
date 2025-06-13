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

        const sales = await TransactionModel.findById(id)
        if(!sales){
            return NextResponse.json({
                success: false,
                message: "Transaction not found"
            }, {status: 404})
        }
        
        const items = sales.items

        for (const item of items) {
            const exists = await ProductModel.findById(item.productId);
            if (!exists) {
                return NextResponse.json({
                    success: false,
                    message: `Product with id ${item.productId} does not exist`
                }, { status: 400 });
            }else{
              await ProductModel.updateOne({_id: exists._id}, {currentStock: exists.currentStock + item.quantity})
            }
        }

        const party = await PartyModel.findOne({phone: sales.customer?.phone, user: user})

        if(!party){
            return NextResponse.json({
                success: false,
                message: "Party doesn't exist"
            }, {status: 404})
        }

        party.transactionId = party.transactionId.filter(
            t => t.toString() !== sales._id.toString()
        );

        await party.save()

        await TransactionModel.deleteOne({_id: sales._id})

        return NextResponse.json({
            success: true,
            message: "Transaction deleted successfully"
        }, {status: 200})
    }catch (error){
        console.error("Error deleting sales: ", error)
        return NextResponse.json({
            success: false,
            message: "Error deleting transaction"
        }, {status: 500})
    }

}