"use client"

import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import SelectCategory from '@/components/SelectCategory'
import Image from "next/image";
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CategoryFormData {
  name: string
  parentCategory: string | null
}

const page = () => {
  const [adding, setAdding] = useState(false)
  const [close, setClosing] = useState(false)
  const router = useRouter()
  const form = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      parentCategory: null
    },
  })

  const onSubmit = async (data: CategoryFormData) => {
    setAdding(true)
    try {
      const res = await axios.post('/api/categories', data)
      if (res.data.success) {
        toast.success("Category Added successfully", {
          icon: '✅',
        })
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      if (axiosError.response?.data?.errors) {
        const errors = axiosError.response.data.errors;
        Object.entries(errors).forEach(([field, message]) => {
          form.setError(field as keyof CategoryFormData, {
            type: "server",
            message: message as string,
          });
        });
      } else {
        // fallback toast for unknown error
        toast.error(axiosError.response?.data.message || "Something went wrong.", {
          icon: '❌',
        });
      }
    }finally{
      setAdding(false)
    }
  }

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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Categories</h1>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">
                  Add New Category
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
              </div>
              <div className="sm:flex items-center justify-center sm:space-x-4 space-y-2 sm:space-y-0">
              <Button type="submit" className="cursor-pointer bg-green-500 border-green-500 border-solid border-2 hover:bg-green-100 text-white hover:text-green-600 transition-colors duration-200 text-base sm:py-5 w-full sm:w-[200px]" disabled={adding}>
                {!adding ? "Add Category" : "Adding Category..."}
              </Button>
              <Button onClick={() => {
                setClosing(true)
                router.back()
                }} type="button" className="cursor-pointer bg-red-100 hover:bg-red-500 border-red-500 border-solid border-2 text-red-600 hover:text-white text-base sm:py-5 w-full sm:w-[200px] disabled:bg-red-400 disabled:text-white" disabled={close}>{close ? "Closing..." : "Close"}</Button>
          </div>
            </form>
          </Form>
    </div>
  )
}

export default page
