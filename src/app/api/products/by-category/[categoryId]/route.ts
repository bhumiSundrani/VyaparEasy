import dbConnect from "@/lib/dbConnect";
import ProductModel from "@/models/Product.model";
import { objectIdSchema } from "@/schemas/categoryVerificationSchema";
import { NextResponse } from "next/server";

export async function GET({params}: {params: {categoryId: string}}) {
    await dbConnect();
    try {
        const categoryId = params
        const parsedId = objectIdSchema.safeParse(categoryId)
        if(!parsedId.success){
            return NextResponse.json({
                success: false,
                message: "Invalid Input"
            }, {status: 400})
        }
        const products = await ProductModel.find({category: categoryId})
        return NextResponse.json({
            success: true,
            message: "Products found successfully",
            products
        }, {status: 200})
    } catch (error) {
        console.log("Error fetching products: ", error)
        return NextResponse.json({
            success: true,
            message: "Error fetching products"
        }, {status: 500})
    }
}