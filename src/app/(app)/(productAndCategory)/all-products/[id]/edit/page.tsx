import { notFound } from "next/navigation";
import ProductForm from "../../../add-product/page";
import { ProductFormData } from "../../../add-product/page";
import axios from "axios";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const fetchProduct = async (id: string): Promise<ProductFormData | null> => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${id}`);
    return res.data.product;
  } catch (error) {
    console.log(error)
    return null;
  }
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  let product: ProductFormData | null = null;

  if (id !== "new") {
    product = await fetchProduct(id);
    if (!product) return notFound(); // show 404 if product doesn't exist
  }

  return <ProductForm product={product} />; // Pass the product data as a prop
} 