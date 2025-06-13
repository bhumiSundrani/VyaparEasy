import dbConnect from "@/lib/dbConnect";
import ProductModel from "@/models/Product.model";
import { verifyToken } from "@/lib/jwtTokenManagement";
import TransactionModel from "@/models/Transaction.Model";
import UserModel from "@/models/User.model";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(){
    try {
        await dbConnect();
        
        // Ensure Product model is registered
        if (!mongoose.models.Product) {
            mongoose.model('Product', ProductModel.schema);
        }
        
        const cookieHeader = await cookies()
        const token = cookieHeader.get('token')?.value
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

      const purchases = await TransactionModel.find({userId: user._id, type: "purchase"})
        // Select all fields except for the nested item.productName which we will handle conditionally
        .select('-items.productName') // Exclude productName initially
        .sort({"transactionDate": -1})

      if(purchases.length === 0){
        return NextResponse.json({
            success: false,
            message: "No purchase found",
            purchases
        }, {status: 200})
      }

      // Conditionally populate productName for items where it's missing
      for (const purchase of purchases) {
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

      return NextResponse.json({
        success: true,
        message: "Purchases found successfully",
        purchases
      }, {status: 200})
    } catch (error) {
        console.error("Error finding purchases:", error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Error fetching purchases"
        }, {status: 500})
    }
}