import dbConnect from "@/lib/dbConnect";
import { fetchImageForCategory } from "@/lib/fetchImages/fetchImageForCategory";
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
                errors[err.path[0]] = err.message;
            });

            return NextResponse.json({
                success: false,
                errors: errors
            }, { status: 400 });
        }

        const {name, parentCategory} = parsedBody.data
        const slug = name.toLowerCase().replace(" ", "-")
        
        // Fetch image from Pexels
        console.log("Fetching image for category:", name);
        const imageUrl = await fetchImageForCategory(name);
        console.log("Fetched image URL:", imageUrl);
        
        const category = await CategoryModel.create({
            name, 
            parentCategory, 
            slug, 
            imageUrl
        });

        console.log("Created category:", category);

        return NextResponse.json({
            success: true,
            message: "New category created",
            category
        }, {
            status: 200
        })

    } catch (error) {
        console.error("Error creating new category:", error)
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
        const categories = await CategoryModel.find().populate("parentCategory", "name");
        if(!categories || categories.length === 0){
            return NextResponse.json({
                success: false,
                message: "No categories found"
            }, {status: 404})
        }
        return NextResponse.json({
            success: true,
            message: "Categories found successfully",
            categories
        }, {status: 200})
    } catch (error) {
        console.error("Error fetching categories:", error)
        return NextResponse.json({
            success: false,
            message: "Error fetching categories"
        }, {status: 500})
    }
}