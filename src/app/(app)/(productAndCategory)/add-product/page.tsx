"use client"

import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { useState } from 'react'
import SelectUnit from '@/components/SelectUnit'
import SelectGroupedCategory from '@/components/SelectGroupedCategory'

interface ProductFormData {
  name: string, 
  category: string,
  unit: 'kg' | 'gm' | 'liter' | 'ml' | 'pcs',
  costPrice: number, 
  sellingPrice: number, 
  lowStockThreshold: number,
  currentStock: number
}

const page = () => {
  const [errorMessage, setErrorMessage] = useState("")
  const form = useForm<ProductFormData>(
    {
      defaultValues: {
        unit: "pcs",
        lowStockThreshold: 10
      }
    }
  )

  const onSubmit = async (data: ProductFormData) => {
    try {
      const res = await axios.post('/api/products', data)
      if (res.data.success) {
        toast.success("Product Added successfully")
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      if (axiosError.response?.data?.errors) {
        const errors = axiosError.response.data.errors;
        Object.entries(errors).forEach(([field, message]) => {
          form.setError(field as keyof ProductFormData, {
            type: "server",
            message: message as string,
          });
        });
      } else {
        // fallback toast for unknown error
        toast.error(axiosError.response?.data.message || "Something went wrong.");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Add New Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Product" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Category</FormLabel>
                    <FormControl>
                      <SelectGroupedCategory
                        value={field.value} // This should be managed by react-hook-form
                        onChange={(value: string) => field.onChange(value)} // And react-hook-form will manage the onChange
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
                    <FormLabel>Product Unit</FormLabel>
                    <FormControl>
                      <SelectUnit
                        value={field.value} // This should be managed by react-hook-form
                        onChange={(value: string) => field.onChange(value)} // And react-hook-form will manage the onChange
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price</FormLabel>
                    <FormControl>
                      <Input placeholder="Cost Price" {...field} type='number' onChange={(e) => field.onChange(Number(e.target.value))}/>
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
                    <FormLabel>Selling Price</FormLabel>
                    <FormControl>
                      <Input placeholder="Selling Price" {...field} type='number'onChange={(e) => field.onChange(Number(e.target.value))}/>
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
                    <FormLabel>Low Stock Threshold</FormLabel>
                    <FormControl>
                      <Input placeholder="Low Stock Threshold" {...field} type='number' onChange={(e) => field.onChange(Number(e.target.value))}/>
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
                    <FormLabel>Current Stock</FormLabel>
                    <FormControl>
                      <Input placeholder="Current Stock" {...field} type='number' onChange={(e) => field.onChange(Number(e.target.value))}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Add Product
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default page