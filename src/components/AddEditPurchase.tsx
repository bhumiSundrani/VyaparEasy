"use client"

import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import Image from "next/image";
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
import { SelectPaymentType } from "@/components/SelectPaymentType";
import { SelectParties } from "@/components/SearchParties";
import { SelectProducts } from "@/components/SearchProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {PlusCircle, Trash2 } from "lucide-react";

export interface PurchaseFormData {
  _id: string,
  paymentType: 'cash' | "credit";
  supplier: {
    name: string,
    phone: string
  },
  items: {
    productId: string,
    quantity: number,
    pricePerUnit: number
  }[],
  totalAmount: number,
  otherExpenses: {
    name: string,
    amount: number
  }[],
  transactionDate?: Date
}

const PurchaseForm = ({purchase}: {purchase: PurchaseFormData | null}) => {
  const [adding, setAdding] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const router = useRouter()
  
  const form = useForm<PurchaseFormData>({
    defaultValues: {
      paymentType: purchase ? purchase.paymentType : "cash",
      supplier: {
        name: purchase?.supplier?.name ?? "",
        phone: purchase?.supplier?.phone ?? ""
      },
      items: purchase?.items ?? [{
        productId: "",
        quantity: 1,
        pricePerUnit: 0
      }],
      totalAmount: purchase?.totalAmount ?? 0,
      otherExpenses: purchase?.otherExpenses ?? [],
      transactionDate: purchase?.transactionDate
        ? new Date(purchase.transactionDate)
        : new Date(),
    }
  })

  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const {fields: itemFields, append: appendItem, remove: removeItem} = useFieldArray({
    control,
    name: "items",
  })

  const { fields: expenseFields, append: appendExpense, remove: removeExpense } = useFieldArray({
    control,
    name: "otherExpenses",
  });

  const items = watch("items");
  const otherExpenses = useMemo(() => {
    return watch("otherExpenses") || [];
  }, [watch]);

  const calculateItemsTotal = useCallback(() => {
    return items.reduce((acc, item) => acc + (item.quantity * item.pricePerUnit || 0), 0);
  }, [items]);

  const calculateExpensesTotal = useCallback(() => {
    return otherExpenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
  }, [otherExpenses]);

  const calculateTotalAmount = useCallback(() => {
    return calculateItemsTotal() + calculateExpensesTotal();
  }, [calculateItemsTotal, calculateExpensesTotal]);

  // Auto-update total amount when items or expenses change
  useEffect(() => {
    const total = calculateTotalAmount();
    setValue("totalAmount", total, { shouldValidate: false });
  }, [items, otherExpenses, calculateTotalAmount, setValue]);

  const supplierName = form.watch("supplier.name");

  const onSubmit = async (data: PurchaseFormData) => {
    console.log("Data", data)
    setAdding(true);
    try {
      const endpoint = purchase ? `/api/purchases/edit-purchase/${purchase._id}` : "/api/purchases/add-purchase";
      const method = purchase ? "put" : "post";
      
      const response = await axios[method](endpoint, {
        ...data,
        totalAmount: calculateTotalAmount(),
        supplier: {
          name: data.supplier.name,
          phone: data.supplier.phone.split('+91')[1]
        }
      });

      if (response.data.success) {
        toast.success(purchase ? "Purchase updated successfully!" : "Purchase created successfully!", {
          icon: "✅",
        });
        // router.push("/all-purchases");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message || "Something went wrong.", {
        icon: "❌",
      });
    } finally {
      setAdding(false);
    }
  }

  if(pageLoading) return <Loader/>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex-shrink-0">
              <Image
                src="/4064925.png"
                alt="Purchase"
                width={48}
                height={48}
                className="object-contain w-10 h-10 sm:w-12 sm:h-12"
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Purchase Management
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm font-medium -mt-1">
                {purchase ? "Edit existing purchase details" : "Create a new purchase entry"}
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 sm:space-y-8"
          >
            {/* Basic Information Card */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
  <CardHeader className="pb-4">
    <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
      <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
      Purchase Information
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-6">
    {/* First Row - Payment Type */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <FormField
        control={form.control}
        name="paymentType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Payment Type <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <SelectPaymentType
                value={field.value}
                onChange={(value: string) => field.onChange(value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

    {/* Second Row - Supplier Information */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div>
        <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
          Supplier <span className="text-red-500">*</span>
        </FormLabel>
        <SelectParties
          value={supplierName}
          onChange={(val) => form.setValue("supplier.name", val)}
          onSelect={(supplier) => {
            form.setValue("supplier.name", supplier.name, { shouldValidate: true })
            form.setValue("supplier.phone", supplier.phone, { shouldValidate: true })
          }}
        />
      </div>

      <FormField
        control={form.control}
        name="supplier.phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Supplier Phone <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter supplier phone number" 
                {...field} 
                className="h-11 text-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

    {/* Third Row - Transaction Date */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <FormField
        control={form.control}
        name="transactionDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Transaction Date
            </FormLabel>
            <FormControl>
              <Input
                type="date"
                value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : new Date())}
                className="h-11 text-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </CardContent>
</Card>
            {/* Items Section */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                    Items <span className="text-red-500">*</span>
                  </div>
                  <div className="text-sm font-normal text-gray-600 bg-green-50 px-3 py-1 rounded-full">
                    Subtotal: ₹{calculateItemsTotal().toFixed(2)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {itemFields.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-5 border border-gray-100 rounded-xl bg-gray-50/50"
                  >
                    {/* Product Selection - Full width on mobile, 5 cols on desktop */}
                    <div className="lg:col-span-5">
                      <FormLabel  className="text-sm font-medium mb-2 text-gray-700">
                        Product <span className="text-red-600">*</span>
                      </FormLabel>
                      <Controller
                        control={control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <SelectProducts
                            value={field.value}
                            onChange={(val) => field.onChange(val)}
                            onSelect={(product) => {
                              setValue(`items.${index}.productId`, product._id)
                              setValue(`items.${index}.pricePerUnit`, product.sellingPrice || 0)
                            }}
                            className=" text-sm border-gray-200 "
                          />
                        )}
                      />
                      {errors.items?.[index]?.productId && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.items[index]?.productId?.message}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="lg:col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel  className="text-sm font-medium text-gray-700">
                              Quantity <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Qty" 
                                type="number"
                                min={1}
                                {...field} 
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="h-10 text-sm border-gray-200 focus:border-blue-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Price per Unit */}
                    <div className="lg:col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.pricePerUnit`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel   className="text-sm font-medium text-gray-700">
                              Price/Unit <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Price" 
                                type="number"
                                min="0"
                                step="0.01"
                                {...field} 
                                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                className="h-10 text-sm border-gray-200 focus:border-blue-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Total */}
                    <div className="lg:col-span-2">
                      <FormLabel  className="text-sm font-medium text-gray-700">
                        Total
                      </FormLabel>
                      <div className="h-10 flex items-center text-sm font-semibold text-green-600 bg-green-50 rounded-md px-3">
                        ₹{((items[index]?.quantity || 0) * (items[index]?.pricePerUnit || 0)).toFixed(2)}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <div className="lg:col-span-1">
                      <FormLabel className="text-xs font-medium text-gray-600 mb-2 block lg:opacity-0">
                        Action
                      </FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={itemFields.length === 1}
                        className="h-10 w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendItem({ productId: "", quantity: 1, pricePerUnit: 0 })
                  }
                  className="w-full h-12 border-dashed border-2 border-green-300 text-green-600 hover:bg-green-50"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Another Item
                </Button>
              </CardContent>
            </Card>

            {/* Other Expenses Section */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                    Other Expenses
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      Optional
                    </span>
                  </div>
                  <div className="text-sm font-normal text-gray-600 bg-orange-50 px-3 py-1 rounded-full">
                    Total: ₹{calculateExpensesTotal().toFixed(2)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {expenseFields.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <PlusCircle className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mb-4">No additional expenses added</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => appendExpense({ name: "", amount: 0 })}
                      className="border-dashed border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add First Expense
                    </Button>
                  </div>
                ) : (
                  <>
                    {expenseFields.map((expense, index) => (
                      <div
                        key={expense.id}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 sm:p-5 border border-gray-100 rounded-xl bg-gray-50/50"
                      >
                        <div className="sm:col-span-7">
                          <FormField
                            control={form.control}
                            name={`otherExpenses.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium text-gray-600">
                                  Expense Name <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., Transportation, Handling charges" 
                                    {...field} 
                                    className="h-10 text-sm border-gray-200 focus:border-blue-400"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <FormField
                            control={form.control}
                            name={`otherExpenses.${index}.amount`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium text-gray-600">
                                  Amount <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="0.00" 
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    {...field} 
                                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                    className="h-10 text-sm border-gray-200 focus:border-blue-400"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="sm:col-span-1">
                          <FormLabel className="text-xs font-medium text-gray-600 mb-2 block sm:opacity-0">
                            Remove
                          </FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeExpense(index)}
                            className="h-10 w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => appendExpense({ name: "", amount: 0 })}
                      className="w-full h-12 border-dashed border-2 border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      <PlusCircle className="h-5 w-5 mr-2" />
                      Add Another Expense
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Total Summary */}
            <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 via-blue-50 to-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800">Payment Summary</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Items Subtotal:</span>
                        <span className="font-medium">₹{calculateItemsTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Other Expenses:</span>
                        <span className="font-medium">₹{calculateExpensesTotal().toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="sm:text-right">
                      <Separator className="mb-3 sm:hidden" />
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{calculateTotalAmount().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hidden total amount field for form submission */}
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <Input 
                  type="hidden"
                  {...field} 
                  value={calculateTotalAmount()}
                />
              )}
            />

            {/* Action Buttons */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={adding}
                    className="h-12 px-8 text-sm font-medium border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={adding}
                    className="h-12 px-8 text-sm font-medium bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
                  >
                    {adding ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      purchase ? "Update Purchase" : "Create Purchase"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default PurchaseForm;