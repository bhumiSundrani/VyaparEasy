import { notFound } from "next/navigation";
import axios from "axios";
import AddEditCategoryPage, { CategoryFormData } from "../../../add-category/page";

interface PageProps {
  params: {
    categoryId: string;
  };
}

const fetchCategory = async (categoryId: string): Promise<CategoryFormData | null> => {
  try {
    const res = await axios.get(`${process.env.NEXT_BASE_URL}/api/categories/${categoryId}`);
    return res.data.category;
  } catch (error) {
    console.log(error)
    return null;
  }
};

export default async function Page({ params }: PageProps) {
  const { categoryId } = params;

  let category : CategoryFormData | null = null;

  if (categoryId !== "new") {
    category = await fetchCategory(categoryId);
    if (!category) return notFound(); // show 404 if product doesn't exist
  }

  return <AddEditCategoryPage category={category} />; // Pass the product data as a prop
} 