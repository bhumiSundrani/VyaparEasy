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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string } >}) {
  await dbConnect();
  const body = await req.json();
  const {id} = await params
  const parsedBody = purchaseVerificationSchema.safeParse(body);

  if (!parsedBody.success) {
      const errors: Record<string, string> = {};
      parsedBody.error.errors.forEach((error) => {
          errors[error.path[0]] = error.message;
      });
      return NextResponse.json({ success: false, errors }, { status: 400 });
  }

  const {
      paymentType,
      supplier,
      items,
      totalAmount,
      otherExpenses,
      transactionDate,
  } = parsedBody.data;

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

      const transaction = await TransactionModel.findOne({ _id: id, userId: user._id });
      if (!transaction) {
          return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
      }

      // Store original items for stock adjustment
      const originalItems = transaction.items;

      // Validate all products exist and prepare stock changes
      const stockChanges: Map<string, number> = new Map();
      
      for (const item of items) {
          const product = await ProductModel.findById(item.productId);
          if (!product) {
              return NextResponse.json({
                  success: false,
                  message: `Product with id ${item.productId} does not exist`
              }, { status: 400 });
          }
          
          // Find original quantity for this product
          const originalItem = originalItems.find(orig => 
              orig.productId.toString() === item.productId.toString()
          );
          const originalQuantity = originalItem ? originalItem.quantity : 0;
          
          // Calculate stock change (new quantity - old quantity)
          const stockChange = item.quantity - originalQuantity;
          
          if (stockChange !== 0) {
              // Check if we have enough stock for reduction
              if (stockChange < 0 && product.currentStock < Math.abs(stockChange)) {
                  return NextResponse.json({
                      success: false,
                      message: `Insufficient stock for product ${product.name}. Available: ${product.currentStock}, Required: ${Math.abs(stockChange)}`
                  }, { status: 400 });
              }
              
              stockChanges.set(item.productId.toString(), stockChange);
          }
      }

      // Handle removed products (products that were in original but not in new items)
      for (const originalItem of originalItems) {
          const stillExists = items.find(item => 
              item.productId.toString() === originalItem.productId.toString()
          );
          
          if (!stillExists) {
              // Product was removed, reduce stock by original quantity
              const stockChange = -originalItem.quantity;
              stockChanges.set(originalItem.productId.toString(), stockChange);
          }
      }

      // Store original values before updating
      const originalSupplierPhone = transaction.supplier?.phone;

      // Convert items to proper format
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

      // Calculate due date if payment type is credit
      let dueDate: Date | undefined = undefined;
      if (paymentType === "credit") {
          const transDate = transactionDate || new Date();
          dueDate = new Date(transDate);
          dueDate.setDate(dueDate.getDate() + 10);
      }

      // Update transaction
      transaction.paymentType = paymentType;
      transaction.supplier = formattedSupplier;
      transaction.items = convertedItems;
      transaction.totalAmount = totalAmount;
      transaction.otherExpenses = otherExpenses;
      transaction.dueDate = dueDate;
      transaction.paid = paymentType === 'credit' ? false : true
      if (transactionDate !== undefined) {
          transaction.transactionDate = transactionDate;
      }
      await transaction.save();

      // Update product stocks
      for (const [productId, stockChange] of stockChanges) {
          await ProductModel.findByIdAndUpdate(
              productId,
              { $inc: { currentStock: stockChange } },
              { new: true }
          );
      }

      // Handle party updates
      let party = await PartyModel.findOne({ 
          phone: formattedSupplier.phone, 
          type: "vendor", 
          user: user._id 
      });

      if (!party) {
          // Create new party
          party = await PartyModel.create({
              name: formattedSupplier.name,
              transactionId: [transaction._id],
              phone: formattedSupplier.phone,
              type: "vendor",
              user: user._id,
          });
      } else {
          // Update existing party
          if (!party.transactionId.includes(transaction._id as Types.ObjectId)) {
              party.transactionId.push(transaction._id as Types.ObjectId);
          }


          await party.save();
      }

      // Clean up old party if supplier changed
      if (originalSupplierPhone && originalSupplierPhone !== formattedSupplier.phone) {
          const oldParty = await PartyModel.findOne({
              phone: originalSupplierPhone,
              type: "vendor",
              user: user._id
          });

          if (oldParty) {
              // Remove transaction from old party
              oldParty.transactionId = oldParty.transactionId.filter(
                  id => !id.equals(transaction._id as Types.ObjectId)
              );

              // Delete party if no transactions left
              if (oldParty.transactionId.length === 0) {
                  await PartyModel.deleteOne({ _id: oldParty._id });
              } else {
                  await oldParty.save();
              }
          }
      }

      return NextResponse.json({
          success: true,
          message: "Purchase updated successfully",
          transactionId: transaction._id,
      });

  } catch (error) {
      console.error("Error editing purchase: ", error);
      return NextResponse.json({
          success: false,
          message: "Failed to edit purchase",
      }, { status: 500 });
  }
}