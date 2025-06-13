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

      const sale = await TransactionModel.findById(id)
        // Exclude productName initially
        .select('-items.productName')
        .lean()

      if (!sale) {
        return NextResponse.json({
          success: false,
          message: "Sale not found"
        }, { status: 404 });
      }

      // Conditionally populate productName for items where it's missing
      if (sale && sale.items) {
        for (const item of sale.items) {
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
      const formattedSale = {
        _id: sale._id.toString(),
        paymentType: sale.paymentType,
        customer: {
          name: sale.customer?.name,
          phone: sale.customer?.phone
        },
        items: sale.items.map(item => ({
          productId: item.productId.toString(),
          productName: item.productName,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit
        })),
        totalAmount: sale.totalAmount,
        transactionDate: sale.transactionDate,
        dueDate: sale.dueDate
      };

      return NextResponse.json({
        success: true,
        message: "Sale found successfully",
        sale: formattedSale
      }, {status: 200})
    } catch (error) {
        console.error("Error finding sale:", error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : "Error fetching sale"
        }, {status: 500})
    }
}