"use client";

import ProductForm, { ProductFormData } from "../../../add-product/AddEditProductPage";
import axios from "axios";
import { useEffect, useState, use } from "react";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function Page({ params }: PageProps) {
  const { id } = use(params); // unwrap params

  const [product, setProduct] = useState<ProductFormData | null>(null);

  useEffect(() => {
    const fetchProduct = async (id: string) => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${id}`
        );
        return res.data.product as ProductFormData;
      } catch (error) {
        console.error("Error fetching product:", error);
        return null;
      }
    };

    const loadProduct = async () => {
      const fetchedProduct = await fetchProduct(id);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
        console.log(fetchedProduct)
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  return <ProductForm product={product} />;
}
