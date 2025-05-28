import dbConnect from "@/lib/dbConnect";
import CategoryModel from "@/models/Category.model";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST() {
    await dbConnect();
    try {
        const categories = await CategoryModel.find();
        
        for (const category of categories) {
            if (category.imageUrl && category.imageUrl.includes('pexels.com/photo/')) {
                try {
                    const response = await axios.get('https://api.pexels.com/v1/search', {
                        headers: {"Authorization": process.env.PEXELS_API_KEY},
                        params: {query: category.name, per_page: 1}
                    });
                    
                    const photo = response.data.photos?.[0];
                    if (photo) {
                        category.imageUrl = photo.src.large2x;
                        await category.save();
                        console.log(`Updated image for category: ${category.name}`);
                    }
                } catch (error) {
                    console.error(`Error updating image for category ${category.name}:`, error);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "Category images updated successfully"
        }, { status: 200 });
    } catch (error) {
        console.error("Error updating category images:", error);
        return NextResponse.json({
            success: false,
            message: "Error updating category images"
        }, { status: 500 });
    }
} 