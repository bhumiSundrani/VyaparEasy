import dbConnect from "@/lib/dbConnect";
import { verifyToken } from "@/lib/jwtTokenManagement";
import PartyModel from "@/models/Party.model";
import ProductModel from "@/models/Product.model";
import TransactionModel from "@/models/Transaction.Model";
import UserModel from "@/models/User.model";
import { salesVerificationSchema } from "@/schemas/salesVerificationSchema"
import { Types } from "mongoose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const parsedBody = salesVerificationSchema.safeParse(body);
  
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
      customer,
      items,
      totalAmount,
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
            if(exists.currentStock < item.quantity){
                return NextResponse.json({
                  success: false,
                  message: `Product out of stock`
              }, { status: 400 });
            }
            await ProductModel.updateOne({_id: exists._id}, {currentStock: exists.currentStock - item.quantity})
          }
      }

      // Convert items to proper format with ObjectIds
      const convertedItems = items.map(item => ({
          productId: new Types.ObjectId(item.productId),
          productName: item.productName,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
          costPrice: item.costPrice
      }));

      // Format supplier phone with +91 prefix
      const formattedCustomer = {
          name: customer.name,
          phone: `+91${customer.phone}`
      };

      
      let dueDate: Date | undefined = undefined;
      if (paymentType === 'credit') {
          const transDate = transactionDate || new Date();
          dueDate = new Date(transDate);
          dueDate.setDate(dueDate.getDate() + 10);
      }


      const transaction = await TransactionModel.create({
          userId: user._id,
          type: 'sale',
          paymentType,
          customer: formattedCustomer,
          items: convertedItems,
          totalAmount,
          transactionDate: transactionDate || new Date(),
          dueDate: dueDate,
          paid: paymentType === 'credit' ? false : true
      });

      let productCustomer = await PartyModel.findOne({ 
          phone: formattedCustomer.phone, 
          type: 'customer', 
          user: user._id 
      });

      if (!productCustomer) {
          productCustomer = await PartyModel.create({
              name: formattedCustomer.name,
              transactionId: [transaction._id],
              phone: formattedCustomer.phone,
              type: 'customer',
              user: user._id
          });
      } else {
          productCustomer.transactionId.push(transaction._id as Types.ObjectId);
          await productCustomer.save();
      }

      return NextResponse.json({
          success: true,
          message: "Sale recorded successfully",
          transactionId: transaction._id
      }, { status: 201 });

  } catch (error) {
      console.error("Error creating sales: ", error);
      return NextResponse.json({
          success: false,
          message: "Error creating sales"
      }, { status: 500 });
  }
}