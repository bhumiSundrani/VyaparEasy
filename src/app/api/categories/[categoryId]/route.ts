import dbConnect from "@/lib/dbConnect";
import CategoryModel from "@/models/Category.model";
import { objectIdSchema } from "@/schemas/categoryVerificationSchema";
import { NextResponse } from "next/server";
import { categoryVerificationSchema } from "@/schemas/categoryVerificationSchema";
import { NextRequest } from "next/server";
export async function DELETE(request: Request, {params}: {params: Promise<{categoryId: string}>}) {
    await dbConnect();
    try {
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

        const updatedCategory = await CategoryModel.findByIdAndUpdate(categoryId, 
            { name, parentCategory },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return NextResponse.json({
                success: false,
                message: "Category not found"
            }, { status: 404 });
        }

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