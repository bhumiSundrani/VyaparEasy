import dbConnect from "@/lib/dbConnect";
import { verifyToken } from "@/lib/jwtTokenManagement";
import PartyModel from "@/models/Party.model";
import ProductModel from "@/models/Product.model";
import TransactionModel from "@/models/Transaction.Model";
import UserModel from "@/models/User.model";
import { purchaseVerificationSchema } from "@/schemas/purchaseVerificationSchema";
import { Types } from "mongoose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const parsedBody = purchaseVerificationSchema.safeParse(body);
  
  if (!parsedBody.success) {
      const errors: Record<string, string> = {};
      parsedBody.error.errors.forEach((error) => {
          errors[error.path[0]] = error.message;
      });
      console.log(errors)
      return NextResponse.json({
          success: false,
          errors
      }, { status: 400 });
  }

  const {
      paymentType,
      supplier,
      items,
      totalAmount,
      otherExpenses,
      transactionDate
  } = parsedBody.data;

  try {
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

      // Validate all products exist
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

      // Convert items to proper format with ObjectIds
      const convertedItems = items.map(item => ({
          productId: new Types.ObjectId(item.productId),
          productName: item.productName,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
      }));

      // Format supplier phone with +91 prefix
      const formattedSupplier = {
          name: supplier.name,
          phone: `+91${supplier.phone}`
      };

      const transaction = await TransactionModel.create({
          userId: user._id,
          type: 'purchase',
          paymentType,
          supplier: formattedSupplier,
          items: convertedItems,
          totalAmount,
          otherExpenses,
          transactionDate: transactionDate || new Date()
      });

      let dueDate: Date | undefined = undefined;
      if (paymentType === 'credit') {
          const transDate = transactionDate || new Date();
          dueDate = new Date(transDate);
          dueDate.setDate(dueDate.getDate() + 10);
      }

      let productSupplier = await PartyModel.findOne({ 
          phone: formattedSupplier.phone, 
          type: 'vendor', 
          user: user._id 
      });

      if (!productSupplier) {
          productSupplier = await PartyModel.create({
              name: formattedSupplier.name,
              transactionId: [transaction._id],
              phone: formattedSupplier.phone,
              type: 'vendor',
              amount: paymentType === 'credit' ? totalAmount : 0,
              dueDate: dueDate,
              paid: paymentType === 'cash',
              remindersSent: 0,
              lastReminderDate: null,
              user: user._id
          });
      } else {
          productSupplier.transactionId.push(transaction._id as Types.ObjectId);
          if (paymentType === 'credit') {
              productSupplier.amount += totalAmount;
              productSupplier.paid = false;
              productSupplier.dueDate = dueDate;
          }
          await productSupplier.save();
      }

      return NextResponse.json({
          success: true,
          message: "Purchase recorded successfully",
          transactionId: transaction._id
      }, { status: 201 });

  } catch (error) {
      console.error("Error creating purchase: ", error);
      return NextResponse.json({
          success: false,
          message: "Error creating purchase"
      }, { status: 500 });
  }
}