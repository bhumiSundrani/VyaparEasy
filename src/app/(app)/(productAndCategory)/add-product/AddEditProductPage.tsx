"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useEffect, useState } from "react";
import SelectUnit from "@/components/SelectUnit";
import SelectGroupedCategory from "@/components/SelectGroupedCategory";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

export interface ProductFormData {
  _id?: string;
  name: string;
  brand: string;
  category: string;
  unit: "kg" | "gm" | "liter" | "ml" | "pcs";
  costPrice: number;
  sellingPrice: number;
  lowStockThreshold: number;
  currentStock: number;
  imageUrl?: string
}

const ProductForm = ({product}: {product: ProductFormData | null}) => {
  console.log("From product form: ", product)
  const [adding, setAdding] = useState(false)
  const [close, setClosing] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const router = useRouter()
  const form = useForm<ProductFormData>({
    defaultValues: {
      _id: product?._id || undefined,
      name: product ? product.name : "",
      brand: product ? product.brand : "",
      category: product ? product.category : "",
      unit: product ? product.unit : "pcs",
      costPrice: product ? product.costPrice : 0,
      sellingPrice: product ? product.sellingPrice : 0, 
      lowStockThreshold: product ? product.lowStockThreshold : 10,
      currentStock: product ? product.currentStock : 0,
      imageUrl: product ? product.imageUrl : ""
    },
  });

  useEffect(() => {
  if (product) {
    form.reset(product);
  }
}, [product, form]);

  const onSubmit = async (data: ProductFormData) => {
    setAdding(true)
    try {      
        const res = await axios.post("/api/products", data);
        if (res.data.success) {
          toast.success(product ? "Product updated successfully" : "Product saved successfully", {
            icon: '✅',
          });          
            router.push('/all-products');
            setPageLoading(true)
          }       
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      if (axiosError.response?.data?.errors) {
        const errors = axiosError.response.data.errors;
        Object.entries(errors).forEach(([field, message]) => {
          form.setError(field as keyof ProductFormData, {
            type: "server",
            message: message as string,
          });
        });
      } else {
        toast.error(axiosError.response?.data.message || "Something went wrong.", {
          icon: '❌',
        });
      }
    } finally {
      setAdding(false)
    }
  };

  if(pageLoading) return <Loader/>

  return (
    <div className="min-h-screen bg-[#f5f7fa] px-2 py-4 sm:px-6 lg:px-12">
      <div className="mb-6 ml-2">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Image
            src="/8552125.png"
            alt="Add-product"
            width={30}
            height={30}
            className="object-contain sm:h-[40px] sm:w-[40px]"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Products</h1>
            <p className="text-gray-600 text-xs sm:text-sm font-medium -mt-1">
              { product ? "Edit Product" : "Add New Product"}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white shadow-xl rounded-2xl p-5 sm:p-8 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Product" {...field} className='text-sm sm:text-base'/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input placeholder="Brand" {...field} className='text-sm sm:text-base'/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4 sm:space-y-6">
              <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Category*</FormLabel>
                  <FormControl>
                    <SelectGroupedCategory
                      value={field.value}
                      onChange={(value: string) => field.onChange(value)}
                      includeAllOption={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit*</FormLabel>
                  <FormControl>
                    <SelectUnit
                      value={field.value}
                      onChange={(value: string) => field.onChange(value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
            

            {product?.imageUrl && (
            <div className="space-y-2">
              <FormLabel>Product Image</FormLabel>
              <img src={product.imageUrl} className="h-[120px] border p-4 rounded-xl" alt="product image"/>
            </div>
          )}

            <FormField
              control={form.control}
              name="costPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Price*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Cost Price"
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className='text-sm sm:text-base'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sellingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Selling Price"
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className='text-sm sm:text-base'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lowStockThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Low Stock Threshold*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Low Stock Threshold"
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className='text-sm sm:text-base'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Stock*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Current Stock"
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className='text-sm sm:text-base'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          

          <div className="sm:flex items-center justify-center sm:space-x-4 space-y-2 sm:space-y-0">
            <Button type="submit" className="cursor-pointer bg-green-500 border-green-500 border-solid border-2 hover:bg-green-100 text-white hover:text-green-600 transition-colors duration-200 text-base sm:py-5 w-full sm:w-[200px]" disabled={adding}>
              {product ? (adding ? "Updating Changes..." : "Update Product") : (adding ? "Adding Product..." : "Add Product")}
            </Button>
            <Button onClick={() => {
              setClosing(true)
              router.back()
              }} type="button" className="cursor-pointer bg-red-100 hover:bg-red-500 border-red-500 border-solid border-2 text-red-600 hover:text-white text-base sm:py-5 w-full sm:w-[200px]  disabled:bg-red-400 disabled:text-white" disabled={close}>{close ? "Closing..." : "Close"}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProductForm;
