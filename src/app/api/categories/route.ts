import dbConnect from "@/lib/dbConnect";
import { fetchImageForCategory } from "@/lib/fetchImages/fetchImageForCategory";
import CategoryModel from "@/models/Category.model";
import { categoryVerificationSchema } from "@/schemas/categoryVerificationSchema";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { verifyToken } from "@/lib/jwtTokenManagement";
import UserModel from "@/models/User.model";
import { invalidateCache, setCache } from "@/app/middlewares/cacheMiddleware";

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

            return NextResponse.json({ success: false, errors }, { status: 400 });
        }

        // Get user from token
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

        const {name, parentCategory} = parsedBody.data
        const slug = name.toLowerCase().replace(/\s+/g, '-')

        // Check if category with same name exists for this user
        const existingCategory = await CategoryModel.findOne({ 
            name,
            user: user._id
        });
        if (existingCategory) {
            return NextResponse.json({
                success: false,
                message: "A category with this name already exists",
            }, { status: 409 });
        }

        // Fetch image from Pexels
        const imageUrl = await fetchImageForCategory(name);

        const category = await CategoryModel.create({
            name, 
            parentCategory, 
            slug,
            imageUrl,
            user: user._id
        });

        await invalidateCache(`${req.nextUrl.pathname}:${token}`)

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

export async function GET(req: NextRequest){
    await dbConnect()
    try {
        // Get user from token
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized access",
                categories: []
            }, { status: 401 });
        }

        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return NextResponse.json({
                success: false,
                message: "Invalid token",
                categories: []
            }, { status: 401 });
        }

        const user = await UserModel.findOne({ phone: decodedToken.phone });
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found",
                categories: []
            }, { status: 401 });
        }

        const categories = await CategoryModel.find({ user: user._id }).populate("parentCategory", "name") .sort({updatedAt: -1, createdAt: -1 }); ;
        
        if(!categories || categories.length === 0){
            return NextResponse.json({
                success: false,
                message: "No categories found",
                categories: []
            }, {status: 200})
        }

        const responseData = {
            success: true,
            message: "Categories found successfully",
            categories
        }

        await setCache(`${req.nextUrl.pathname}:${token}`, responseData, 3600)

        return NextResponse.json(responseData, {status: 200})
    } catch (error) {
        console.error("Error fetching categories:", error)
        return NextResponse.json({
            success: false,
            message: "Error fetching categories",
            categories: []
        }, {status: 500})
    }
}