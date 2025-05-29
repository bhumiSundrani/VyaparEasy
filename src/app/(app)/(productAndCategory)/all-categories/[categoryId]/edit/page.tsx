import { notFound } from "next/navigation";
import axios from "axios";
import AddEditCategoryPage, { CategoryFormData } from "../../../add-category/page";

// Fix: params should be a Promise
type PageProps = {
  params: Promise<{
    categoryId: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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
  const { categoryId } = await params;

  let category: CategoryFormData | null = null;

  if (categoryId !== "new") {
    category = await fetchCategory(categoryId);
    if (!category) return notFound(); // show 404 if category doesn't exist
  }

  return <AddEditCategoryPage category={category} />; // Pass the category data as a prop
}