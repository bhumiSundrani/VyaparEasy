"use client"

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import SelectCategory from '@/components/SelectCategory'
import Image from "next/image";
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { CategoryColumnData } from '@/tanstackColumns/categoryColumn';
import Loader from '@/components/Loader'

export interface CategoryFormData {
  _id?: string;
  name: string;
  parentCategory: string | null;
  imageUrl?: string
}

const AddEditCategoryPage = ({category}: {category: CategoryFormData | null}) => {
  const router = useRouter();
  const params = useParams();
  const [pageLoading, setPageLoading] = useState(false)
  const { categoryId } = params;
  const isEditing = !!categoryId;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CategoryFormData>({
    defaultValues: {
      name: category ? category.name : '',
      parentCategory: category ? category.parentCategory : null,
      imageUrl: category ? category.imageUrl : ""
    },
  });

  // Fetch category data if editing
  useEffect(() => {
    if (isEditing && categoryId) {
      const fetchCategory = async () => {
        try {
          const res = await axios.get(`/api/categories/${categoryId}`);
          if (res.data.success) {
            const categoryData = res.data.category as CategoryColumnData;
            form.reset({
              _id: categoryData._id,
              name: categoryData.name,
              parentCategory: categoryData.parentCategory?._id || null,
            });
          } else {
            toast.error(res.data.message || "Failed to fetch category data");
            // Optionally redirect if category not found
            // router.push('/all-categories');
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          toast.error(axiosError.response?.data.message || "Error fetching category data");
        } finally {
          setLoading(false);
        }
      };
      fetchCategory();
    }
  }, [isEditing, categoryId, form]);

  const onSubmit = async (data: CategoryFormData) => {
    setSubmitting(true);
    try {
      let res;
      if (isEditing && data._id) {
        // Edit existing category
        res = await axios.put(`/api/categories/${data._id}`, data);
      } else {
        // Add new category
        res = await axios.post('/api/categories', data);
      }

      if (res.data.success) {
        toast.success(res.data.message || `Category ${isEditing ? 'updated' : 'added'} successfully`, {
          icon: '✅',
        });
        setLoading(true)
        router.push('/all-categories');
      } else {
        // Handle server-side validation errors
        if (res.data.errors) {
          Object.entries(res.data.errors).forEach(([field, message]) => {
            form.setError(field as keyof CategoryFormData, {
              type: "server",
              message: message as string,
            });
          });
        } else {
            toast.error(res.data.message || `Failed to ${isEditing ? 'update' : 'add'} category`, {
              icon: '❌',
            });
        }
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      // Handle network errors or other unhandled errors
      toast.error(axiosError.response?.data.message || `Error ${isEditing ? 'updating' : 'adding'} category`, {
        icon: '❌',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
        <Loader/>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] px-2 py-4 sm:px-6 lg:px-12">
          <div className="mb-6 ml-2">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Image
                src="/category-icon-png-4.jpg"
                alt={isEditing ? "Edit-category" : "Add-category"}
                width={30}
                height={30}
                className="object-contain sm:h-[50px] sm:w-[50px]"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Categories</h1>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">
                  {isEditing ? "Edit Category" : "Add New Category"}
                </p>
              </div>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white shadow-xl rounded-2xl p-5 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 gap-5">
              {/* Name field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Category" {...field} className='text-sm sm:text-base'/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Parent Category field */}
              <FormField
                control={form.control}
                name="parentCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <FormControl>
                      <SelectCategory
                        value={field.value} // This should be managed by react-hook-form
                        onChange={(value: string) => field.onChange(value)} // And react-hook-form will manage the onChange
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

                {category?.imageUrl && 
               <div className="space-y-2">
                <FormLabel>Category Image</FormLabel>
                <img src={category.imageUrl} className="h-[120px] border p-4 rounded-xl" alt="product image"/>
              </div>
                }

              </div>
              <div className="sm:flex items-center justify-center sm:space-x-4 space-y-2 sm:space-y-0">
              <Button type="submit" className="cursor-pointer bg-green-500 border-green-500 border-solid border-2 hover:bg-green-100 text-white hover:text-green-600 transition-colors duration-200 text-base sm:py-5 w-full sm:w-[200px]" disabled={submitting}>
                {submitting ? <Loader2 height={20} width={20} className='animate-spin'/> : (isEditing ? "Update Category" : "Add Category")}
              </Button>
              <Button onClick={() => {
                // setClosing(true) // No longer needed
                router.back()
                }} type="button" className="cursor-pointer bg-red-100 hover:bg-red-500 border-red-500 border-solid border-2 text-red-600 hover:text-white text-base sm:py-5 w-full sm:w-[200px] disabled:bg-red-400 disabled:text-white">Close</Button>
          </div>
            </form>
          </Form>
    </div>
  )
}

export default AddEditCategoryPage;
