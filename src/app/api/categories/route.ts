import dbConnect from "@/lib/dbConnect";
import { fetchImageForCategory } from "@/lib/fetchImages/fetchImageForCategory";
import CategoryModel from "@/models/Category.model";
import { categoryVerificationSchema } from "@/schemas/categoryVerificationSchema";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const fetchImage = async (name: string) => {
        try {
            const response = await axios.post(`${process.env.NEXT_BASE_URL}/api/get-images/by-category`, {name: name})
            if(response.data.imageUrl){
                const imageUrl = response.data.imageUrl
                return imageUrl
            }
        } catch (error) {
            console.log("Error fetching image: ", error)
        }
        return null
}

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
        const imageUrl = await fetchImageForCategory(name)
        
        await CategoryModel.create({name, parentCategory, slug, imageUrl})
        return NextResponse.json({
            success: true,
            message: "New category created"
        }, {
            status: 200
        })

    } catch (error) {
        console.log("Error creating new category",  error)
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