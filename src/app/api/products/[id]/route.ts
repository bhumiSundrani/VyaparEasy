import dbConnect from "@/lib/dbConnect";
import ProductModel from "@/models/Product.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;

  try {
    const product = await ProductModel.findById(id);
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "No product found",
          product: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product found successfully",
        product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching product",
        product: null,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  
  try {
    await ProductModel.findByIdAndDelete(id);
    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting product",
        product: null,
      },
      { status: 500 }
    );
  }
}