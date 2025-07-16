import dbConnect from "@/lib/dbConnect";
import { verifyToken } from "@/lib/jwtTokenManagement";
import ProductModel from "@/models/Product.model";
import UserModel from "@/models/User.model";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" }, 
        { status: 401 }
      );
    }

    const decodedToken = await verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json(
        { success: false, message: "Invalid token" }, 
        { status: 401 }
      );
    }

    const user = await UserModel.findOne({ phone: decodedToken.phone }).select('_id');
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query) {
      return NextResponse.json({ 
        success: true, 
        products: [],
        message: "No search query provided"
      });
    }

    if (query.length < 1) {
      return NextResponse.json({ 
        success: true, 
        products: [],
        message: "Search query must be at least 1 character"
      });
    }

    // Enhanced search with multiple fields and user filtering
    const searchRegex = { $regex: query, $options: "i" };
    
    const products = await ProductModel.find({
      $and: [
        { user: user._id }, // Filter by user
        {
          $or: [
            { name: searchRegex }
          ]
        }
      ]
    })
    .select('_id name sellingPrice costPrice currentStock unit category lowStockThreshold imageUrl')
    .limit(20)
    .sort({ name: 1 })
    .lean();

    return NextResponse.json({ 
      success: true, 
      products,
      count: products.length
    });

  } catch (error) {
    console.error("Error searching products:", error);
    
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorMessage = isDevelopment 
      ? `Failed to search products: ${error instanceof Error ? error.message : 'Unknown error'}`
      : "Failed to search products";

    return NextResponse.json(
      { success: false, message: errorMessage }, 
      { status: 500 }
    );
  }
}