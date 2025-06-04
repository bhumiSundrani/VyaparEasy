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

      const decodedToken = verifyToken(token);
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

      // Validate all products exist
      for (const item of items) {
          const exists = await ProductModel.findById(item.productId);
          if (!exists) {
              return NextResponse.json({
                  success: false,
                  message: `Product with id ${item.productId} does not exist`
              }, { status: 400 });
          }
      }

      // Store original values before updating
      const originalPaymentType = transaction.paymentType;
      const originalAmount = transaction.totalAmount;
      const originalSupplierPhone = transaction.supplier?.phone;

      // Convert items to proper format
      const convertedItems = items.map(item => ({
          productId: new Types.ObjectId(item.productId),
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
      if (transactionDate !== undefined) {
          transaction.transactionDate = transactionDate;
      }
      await transaction.save();

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
              amount: paymentType === "credit" ? totalAmount : 0,
              dueDate: dueDate,
              paid: paymentType === "cash",
              remindersSent: 0,
              lastReminderDate: null,
              user: user._id,
          });
      } else {
          // Update existing party
          if (!party.transactionId.includes(transaction._id as Types.ObjectId)) {
              party.transactionId.push(transaction._id as Types.ObjectId);
          }

          // Calculate amount changes based on original vs new payment types
          if (originalPaymentType === "credit" && paymentType === "credit") {
              // Both credit: adjust amount difference
              party.amount = party.amount - originalAmount + totalAmount;
              party.paid = false;
              party.dueDate = dueDate;
          } else if (originalPaymentType === "credit" && paymentType === "cash") {
              // Credit to cash: subtract original amount
              party.amount -= originalAmount;
              party.paid = party.amount <= 0;
          } else if (originalPaymentType === "cash" && paymentType === "credit") {
              // Cash to credit: add new amount
              party.amount += totalAmount;
              party.paid = false;
              party.dueDate = dueDate;
          } else {
              // Both cash: no amount change
              party.paid = true;
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

              // Adjust amount if it was credit
              if (originalPaymentType === "credit") {
                  oldParty.amount -= originalAmount;
                  oldParty.paid = oldParty.amount <= 0;
              }

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