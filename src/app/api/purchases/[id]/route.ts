import dbConnect from "@/lib/dbConnect";
import ProductModel from "@/models/Product.model";
import { verifyToken } from "@/lib/jwtTokenManagement";
import TransactionModel from "@/models/Transaction.Model";
import UserModel from "@/models/User.model";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import mongoose, { ObjectId } from "mongoose";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: ObjectId }> }){
    try {
        await dbConnect();
        const { id } = await params;
        
        // Ensure Product model is registered
        if (!mongoose.models.Product) {
            mongoose.model('Product', ProductModel.schema);
        }
        
        const cookieHeader = await cookies()
        const token = cookieHeader.get('token')?.value
        if (!token) {
          console.log("No token found in cookies");
          return NextResponse.json({
              success: false,
              message: "Unauthorized access"
          }, { status: 401 });
      }

      const decodedToken = await verifyToken(token);
      if (!decodedToken) {
          console.log("Invalid token");
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

      const purchase = await TransactionModel.findById(id)
        // Exclude productName initially
        .select('-items.productName')
        .lean()

      if (!purchase) {
        return NextResponse.json({
          success: false,
          message: "Purchase not found"
        }, { status: 404 });
      }

      // Conditionally populate productName for items where it's missing
      if (purchase && purchase.items) {
        for (const item of purchase.items) {
          // Check if productName is missing or null/undefined
          if (!item.productName && item.productId) {
            // Populate only this item's productId to get the name
            const product = await ProductModel.findById(item.productId).select('name').lean();
            if (product) {
              item.productName = product.name; // Assign the name to the item
            }
          }
        }
      }

      // Format the purchase data to match PurchaseFormData interface
      const formattedPurchase = {
        _id: purchase._id.toString(),
        paymentType: purchase.paymentType,
        supplier: {
          name: purchase.supplier?.name,
          phone: purchase.supplier?.phone
        },
        items: purchase.items.map(item => ({
          productId: item.productId.toString(),
          productName: item.productName,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit
        })),
        totalAmount: purchase.totalAmount,
        otherExpenses: purchase.otherExpenses || [],
        transactionDate: purchase.transactionDate
      };

      return NextResponse.json({
        success: true,
        message: "Purchase found successfully",
        purchase: formattedPurchase
      }, {status: 200})
    } catch (error) {
        console.error("Error finding purchase:", error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Error fetching purchase"
        }, {status: 500})
    }
}