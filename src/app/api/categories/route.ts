import dbConnect from "@/lib/dbConnect";
import CategoryModel from "@/models/Category.model";
import { categoryVerificationSchema } from "@/schemas/categoryVerificationSchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    await dbConnect();
    try {
        const body = await req.json()
        const parsedBody = categoryVerificationSchema.safeParse(body)
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

        const {name, parentCategory} = parsedBody.data
        const slug = name.toLowerCase().replace(" ", "-")
        await CategoryModel.create({name, parentCategory, slug})
        return NextResponse.json({
            success: true,
            message: "New category created"
        }, {
            status: 200
        })

    } catch (error) {
        console.log("Error creating new category")
        return NextResponse.json({
            success: false,
            message: "Error creating new category"
        }, {
            status: 500
        })
    }
}

export async function GET(){
    await dbConnect()
    try {
        const categories = await CategoryModel.find()
        if(!categories){
            return NextResponse.json({
                success: false,
                message: "Categories not found"
            }, {status: 404})
        }
        return NextResponse.json({
            success: true,
            message: "Categories found successfully",
            categories
        }, {status: 200})
    } catch (error) {
        console.log("Error fetching categories: ", error)
        return NextResponse.json({
            success: false,
            message: "Error fetching categories"
        }, {status: 500})
    }
}