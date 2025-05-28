import dbConnect from "@/lib/dbConnect";
import { fetchImageForProduct } from "@/lib/fetchImages/fetchImageForProduct";
import ProductModel from "@/models/Product.model";
import { productVerificationSchema } from "@/schemas/productVerificationSchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  const parsedBody = productVerificationSchema.safeParse(body);
  if (!parsedBody.success) {
    const errors: Record<string, string> = {};
    parsedBody.error.errors.forEach((err) => {
      errors[err.path[0]] = err.message;
    });
    return NextResponse.json({ success: false, errors }, { status: 400 });
  }

  const {
    _id,
    name,
    brand,
    category,
    unit,
    costPrice,
    sellingPrice,
    lowStockThreshold,
    currentStock,
  } = parsedBody.data;

  try {
    if (_id) {
      // 🔁 UPDATE MODE
      // First check if the product exists
      const existingProduct = await ProductModel.findById(_id);
      if (!existingProduct) {
        return NextResponse.json({
          success: false,
          message: "Product not found",
        }, { status: 404 });
      }

      // Check for duplicate name only if name is being changed
      if (name !== existingProduct.name) {
        const duplicateName = await ProductModel.findOne({
          name: name,
          _id: { $ne: _id }
        });

        if (duplicateName) {
          return NextResponse.json({
            success: false,
            message: "Another product with this name already exists",
          }, { status: 409 });
        }
      }

      // Get new image URL only if name has changed
      const imageUrl = name !== existingProduct.name 
        ? await fetchImageForProduct(name)
        : existingProduct.imageUrl;

      // Update the product
      const updatedProduct = await ProductModel.findByIdAndUpdate(
        _id,
        {
          $set: {
            name,
            brand,
            category,
            unit,
            costPrice,
            sellingPrice,
            lowStockThreshold,
            currentStock,
            imageUrl,
          }
        },
        { 
          new: true,
          runValidators: true // Ensure validation runs on update
        }
      );

      if (!updatedProduct) {
        return NextResponse.json({
          success: false,
          message: "Failed to update product",
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Product updated successfully",
        product: updatedProduct
      }, { status: 200 });

    } else {
      // 🆕 CREATE MODE
      // Check if product with same name exists
      const existingProduct = await ProductModel.findOne({ name });
      if (existingProduct) {
        return NextResponse.json({
          success: false,
          message: "A product with this name already exists",
        }, { status: 409 });
      }

      const imageUrl = await fetchImageForProduct(name);

      const newProduct = new ProductModel({
        name,
        brand,
        category,
        unit,
        costPrice,
        sellingPrice,
        lowStockThreshold,
        currentStock,
        imageUrl,
      });

      const savedProduct = await newProduct.save();

      return NextResponse.json({
        success: true,
        message: "Product created successfully",
        product: savedProduct
      }, { status: 201 });
    }

  } catch (error) {
    console.error("Error saving product:", error);
    return NextResponse.json({
      success: false,
      message: "Error saving product",
    }, { status: 500 });
  }
}


export async function GET(){
    await dbConnect();
    try {
        const products = await ProductModel.find({}).populate({
            path: 'category',
            select: 'name'
        })
        if(!products){
            return NextResponse.json({
                success: false,
                message: "No product found",
                products: []
            }, {status: 200})
        }
        return NextResponse.json({
            success: true,
            message: "Products found successfully",
            products
        }, {status: 200})
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({
            success: false,
            message: "Error fetching products",
            products: []
        }, {status: 500})
    }
}