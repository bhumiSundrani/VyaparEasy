"use client"
import axios from "axios";
import { useEffect, useState, use } from "react";
import { AddEditCategoryPage, CategoryFormData } from "../../../add-category/AddEditCategoryPage";

// Fix: params should be a Promise
type PageProps = {
  params: Promise<{
    categoryId: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const { categoryId } = use(params);
  const [category, setCategory] = useState<CategoryFormData | null>(null)
  useEffect(() => {
    const fetchCategory = async (categoryId: string): Promise<CategoryFormData | null> => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/${categoryId}`);
    return res.data.category as CategoryFormData;
  } catch (error) {
    console.log(error)
    return null;
  }
};

    const loadCategory = async () => {
      const fetchedCategory = await fetchCategory(categoryId);
      if (fetchedCategory) {
        setCategory(fetchedCategory);
      }
    };

    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  return <AddEditCategoryPage category={category} />; // Pass the category data as a prop
}