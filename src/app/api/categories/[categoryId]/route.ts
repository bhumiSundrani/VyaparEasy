import dbConnect from "@/lib/dbConnect";
import CategoryModel from "@/models/Category.model";
import { objectIdSchema } from "@/schemas/categoryVerificationSchema";
import { NextResponse } from "next/server";
import { categoryVerificationSchema } from "@/schemas/categoryVerificationSchema";
import { NextRequest } from "next/server";
import { fetchImageForCategory } from "@/lib/fetchImages/fetchImageForCategory";
import { verifyToken } from "@/lib/jwtTokenManagement";
import { cookies } from "next/headers";
import UserModel from "@/models/User.model";
import { invalidateCache } from "@/app/middlewares/cacheMiddleware";
export async function DELETE(request: Request, {params}: {params: Promise<{categoryId: string}>}) {
    await dbConnect();
    try {
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
        const { categoryId } = await params;
        console.log("Category ID:", categoryId); // Debug log
        
        const parsedId = objectIdSchema.safeParse(categoryId);
        
        if(!parsedId.success){
            return NextResponse.json({
                success: false,
                message: "Invalid category ID"
            }, {status: 400});
        }        
        
        // Check if category exists
        const category = await CategoryModel.findById(categoryId);
        if (!category) {
            return NextResponse.json({
                success: false,
                message: "Category not found"
            }, {status: 404});
        }

        // Check if category has any subcategories
        const hasSubcategories = await CategoryModel.exists({ parentCategory: categoryId });
        if (hasSubcategories) {
            return NextResponse.json({
                success: false,
                message: "Cannot delete category with subcategories. Please delete all subcategories first."
            }, {status: 400});
        }

        // Delete the category
        const deletedCategory = await CategoryModel.findByIdAndDelete(categoryId);
        
        if (!deletedCategory) {
            return NextResponse.json({
                success: false,
                message: "Failed to delete category"
            }, {status: 500});
        }

                await invalidateCache(`/api/categories:${token}`)
        
        return NextResponse.json({
            success: true,
            message: "Category deleted successfully"
        }, {status: 200});
        
    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, {status: 500});
    }
}

export async function GET(req: NextRequest, {params}: {params: Promise<{categoryId: string}>}) {
    await dbConnect();
    try {
        const { categoryId } = await params;
        const parsedId = objectIdSchema.safeParse(categoryId);

        if(!parsedId.success){
            return NextResponse.json({
                success: false,
                message: "Invalid category ID"
            }, {status: 400});
        }

        const category = await CategoryModel.findById(categoryId).populate("parentCategory", "name");
        if(!category){
            return NextResponse.json({
                success: false,
                message: "Category not found"
            }, {status: 404});
        }

        return NextResponse.json({
            success: true,
            message: "Category found",
            category
        }, {status: 200});
    } catch (error) {
        console.error("Error fetching category:", error);
        return NextResponse.json({
            success: false,
            message: "Error fetching category"
        }, {status: 500});
    }
}

export async function PUT(req: NextRequest, {params}: {params: Promise<{categoryId: string}>}) {
    await dbConnect();
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
        const { categoryId } = await params;
        const body = await req.json();
        const parsedBody = categoryVerificationSchema.safeParse(body);

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

        const {name, parentCategory} = parsedBody.data;

        const existingCategory = await CategoryModel.findById(categoryId)

        if(!existingCategory){
            return NextResponse.json({
                success: false,
                message: "Category not found"
            }, { status: 404 });
        }

        if(name !== existingCategory.name){
            const duplicateCategory = await CategoryModel.findOne({name: existingCategory.name, _id: { $ne: categoryId }, user: user._id})
            if(duplicateCategory){
                return NextResponse.json({
                    success: true,
                    message: "Category already exists"
                }, {status: 400})
            }
        }

        const imageUrl = name !== existingCategory.name ? await fetchImageForCategory(name) : existingCategory.imageUrl

        const updatedCategory = await CategoryModel.findByIdAndUpdate(categoryId, 
            { $set: {name, parentCategory, imageUrl} },
            { new: true, runValidators: true }
        );

                await invalidateCache(`/api/categories:${token}`)


        return NextResponse.json({
            success: true,
            message: "Category updated successfully",
            category: updatedCategory
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating category:", error);
        return NextResponse.json({
            success: false,
            message: "Error updating category"
        }, { status: 500 });
    }
}