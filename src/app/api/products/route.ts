import dbConnect from "@/lib/dbConnect";
import ProductModel from "@/models/Product.model";
import { productVerificationSchema } from "@/schemas/productVerificationSchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    await dbConnect()
    try {
        const body = await req.json()
        const parsedBody = productVerificationSchema.safeParse(body)
        if(!parsedBody.success){
            const errors: Record<string, string> = {};
            parsedBody.error.errors.forEach((err) => {
                errors[err.path[0]] = err.message; // path[0] will give us the field name
            });

            // Return errors with specific messages for each field
            return NextResponse.json({
                success: false,
                errors: errors
            }, { status: 400 });
        }
        const {name, category, unit, costPrice, sellingPrice, lowStockThreshold, currentStock} = parsedBody.data
        await ProductModel.create({
            name, 
            category,
            unit,
            costPrice, 
            sellingPrice, 
            lowStockThreshold,
            currentStock
        })
        return NextResponse.json({
            success: true,
            message: "Product created successfully",
        }, { status: 200 });
    } catch (error) {
        console.log("Error creating new product: ", error)
        return NextResponse.json({
            success: false,
            message: "Error creating new product"
        }, {status: 500})
    }
}