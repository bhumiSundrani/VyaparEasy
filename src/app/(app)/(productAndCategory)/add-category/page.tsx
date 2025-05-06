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

interface CategoryFormData {
  name: string
  parentCategory: string | null
}

const page = () => {
  const form = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      parentCategory: null
    },
  })

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const res = await axios.post('/api/categories', data)
      if (res.data.success) {
        toast.success("Category Added successfully")
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
        toast.error(axiosError.response?.data.message || "Something went wrong.");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Add New Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Name field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Category" {...field} />
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
              <Button type="submit" className="w-full">
                Add Category
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default page
