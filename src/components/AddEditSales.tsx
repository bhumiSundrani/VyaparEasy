"use client"

import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray} from "react-hook-form";
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
import {PlusCircle, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface SaleFormData {
  _id: string,
  paymentType: 'cash' | "credit";
  customer: {
    name: string,
    phone: string
  },
  items: {
    productId: string,
    productName: string,
    quantity: number,
    pricePerUnit: number
  }[],
  totalAmount: number,
  transactionDate?: Date
}

const SalesForm = ({sale}: {sale: SaleFormData | null}) => {
  const [adding, setAdding] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const [submitErrors, setSubmitErrors] = useState<string[]>([])
  const router = useRouter()
  
  // Debug logging for the SelectParties issue
  console.log('Sale data:', sale);
  console.log('Customer name from sale:', sale?.customer?.name);
  
  const form = useForm<SaleFormData>({
    defaultValues: {
      paymentType: sale ? sale.paymentType : "cash",
      customer: {
        name: sale?.customer?.name ?? "",
        phone: sale?.customer?.phone ?? ""
      },
      items: sale ?
      sale.items.length > 0 ?
      sale.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit
      })) : [{
        productId: "",
        productName: "",
        quantity: 1,
        pricePerUnit: 0
      }]
      : [{
        productId: "",
        productName: "",
        quantity: 1,
        pricePerUnit: 0
      }],
      totalAmount: sale?.totalAmount ?? 0,
      transactionDate: sale?.transactionDate
        ? new Date(sale.transactionDate)
        : new Date(),
    },
    mode: 'onChange',
  });

  const {
    control,
    watch,
    formState: { errors },
    setError,
    clearErrors
  } = form;

  const {fields: itemFields, append: appendItem, remove: removeItem} = useFieldArray({
    control,
    name: "items",
  })

  const items = watch("items");

  const calculateItemsTotal = useCallback(() => {
    return items.reduce((acc, item) => acc + (item.quantity * item.pricePerUnit || 0), 0);
  }, [items]);

  const customerName = form.watch("customer.name");

  // Client-side validation function
  const validateForm = (data: SaleFormData): string[] => {
    const errors: string[] = [];
    
    // Validate customer name
    if (!data.customer.name.trim()) {
      errors.push("Customer name is required");
    }
    
    // Validate customer phone
    if (!data.customer.phone.trim()) {
      errors.push("Customer phone number is required");
    }
    
    // Validate items
    if (!data.items || data.items.length === 0) {
      errors.push("At least one item is required");
    } else {
      data.items.forEach((item, index) => {
        if (!item.productId) {
          errors.push(`Product is required for item ${index + 1}`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Valid quantity is required for item ${index + 1}`);
        }
        if (!item.pricePerUnit || item.pricePerUnit <= 0) {
          errors.push(`Valid price is required for item ${index + 1}`);
        }
      });
    }
    
    // Validate total amount
    const calculatedTotal = data.items.reduce((acc, item) => acc + (item.quantity * item.pricePerUnit || 0), 0);
    if (calculatedTotal <= 0) {
      errors.push("Total amount must be greater than 0");
    }
    
    return errors;
  };

  const onSubmit = async (data: SaleFormData) => {
    console.log("Submitting data:", data);
    
    // Clear previous errors
    setSubmitErrors([]);
    clearErrors();
    
    // Client-side validation
    const validationErrors = validateForm(data);
    if (validationErrors.length > 0) {
      setSubmitErrors(validationErrors);
      toast.error("Please fix the validation errors", {
        icon: '❌',
      });
      return;
    }
    
    setAdding(true);
    
    try {
      const endpoint = sale ? `/api/sales/edit-sales/${sale._id}` : "/api/sales/add-sales";
      const method = sale ? "put" : "post";

      let phone = data.customer.phone;
      if(phone.startsWith('+91')){
        phone = phone.split('+91')[1];
      }
      
      const response = await axios[method](endpoint, {
        ...data,
        totalAmount: calculateItemsTotal(),
        customer: {  // Fixed: was sending 'supplier' instead of 'customer'
          name: data.customer.name,
          phone: phone
        }
      });

      if (response.data.success) {
        toast.success(sale ? "Sale updated successfully!" : "Sale created successfully!", {
          icon: "✅",
        });
         
        router.push("/sales");
        setPageLoading(true)
      }
    } catch (error) {
      console.error("Submit error:", error);
      const axiosError = error as AxiosError<ApiResponse>;
      
      // Handle validation errors from server
      if (axiosError.response?.data?.errors) {
        const serverErrors = axiosError.response.data.errors;
        const errorMessages: string[] = [];
        
        Object.entries(serverErrors).forEach(([field, message]) => {
          errorMessages.push(`${field}: ${message}`);
          // Set individual field errors
          setError(field as keyof SaleFormData, {
            type: "server",
            message: message as string,
          });
        });
        
        setSubmitErrors(errorMessages);
        toast.error("Please fix the validation errors", {
          icon: '❌',
        });
      } else {
        // Handle general errors
        const errorMessage = axiosError.response?.data?.message || "Something went wrong while saving the sale.";
        setSubmitErrors([errorMessage]);
        toast.error(errorMessage, {
          icon: '❌',
        });
      }
    } finally {
      setAdding(false);
    }
  }

  // Effect to clear submit errors when form data changes
  useEffect(() => {
    if (submitErrors.length > 0) {
      setSubmitErrors([]);
    }
  }, [submitErrors, customerName, items]);

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
                alt="Sales"
                width={48}
                height={48}
                className="object-contain w-10 h-10 sm:w-12 sm:h-12"
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Sales Management
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm font-medium -mt-1">
                {sale ? "Edit existing sales details" : "Create a new sale entry"}
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {submitErrors.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="font-medium mb-2">Please fix the following errors:</div>
              <ul className="list-disc list-inside space-y-1">
                {submitErrors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

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
                  Sales Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* First Row - Payment Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="paymentType"
                    rules={{ required: "Payment type is required" }}
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

                {/* Second Row - Customer Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                      Customer <span className="text-red-500">*</span>
                    </FormLabel>
                    <SelectParties
                      defaultPartyType="customer"
                      value={customerName}
                      onChange={(val) => {
                        console.log('Customer name changed to:', val);
                        form.setValue("customer.name", val, { shouldValidate: true });
                      }}
                      onSelect={(customer) => {
                        console.log('Customer selected:', customer);
                        form.setValue("customer.name", customer.name, { shouldValidate: true });
                        form.setValue("customer.phone", customer.phone, { shouldValidate: true });
                      }}
                      placeholder="Search customers..."
                    />
                    {errors.customer?.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.customer.name.message}</p>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="customer.phone"
                    rules={{ 
                      required: "Customer phone is required",
                      pattern: {
                        value: /^[\+]?[0-9\s\-\(\)]{10,}$/,
                        message: "Please enter a valid phone number"
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Customer Phone <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter customer phone number" 
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
                    {/* Product Selection */}
                    <div className="lg:col-span-5">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        rules={{
                          required: "Please select a product",
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium mb-2 text-gray-700">
                              Product <span className="text-red-600">*</span>
                            </FormLabel>
                            <FormControl>
                              <SelectProducts
                                value={field.value || ""}
                                displayValue={watch(`items.${index}.productName`) || ""}
                                onChange={(productId) => {
                                  field.onChange(productId);
                                }}
                                onSelect={(product) => {
                                  form.setValue(`items.${index}.productId`, product._id, {
                                    shouldValidate: true,
                                  });
                                  form.setValue(`items.${index}.productName`, product.name, {
                                    shouldValidate: true,
                                  });
                                  form.setValue(`items.${index}.quantity`, 1, {
                                    shouldValidate: true,
                                  });
                                  form.setValue(`items.${index}.pricePerUnit`, product.sellingPrice || 0, {
                                    shouldValidate: true,
                                  });
                                }}
                                className="text-sm border-gray-200"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Quantity */}
                    <div className="lg:col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        rules={{
                          required: "Quantity is required",
                          min: { value: 1, message: "Quantity must be at least 1" }
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Quantity <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Quantity" 
                                type="number"
                                min="1"
                                step="1"
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
                        rules={{
                          required: "Price is required",
                          min: { value: 0.01, message: "Price must be greater than 0" }
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
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
                      <FormLabel className="text-sm font-medium text-gray-700">
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
                    appendItem({ productId: "", productName: "", quantity: 1, pricePerUnit: 0 })
                  }
                  className="w-full h-12 border-dashed border-2 border-green-300 text-green-600 hover:bg-green-50"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Another Item
                </Button>
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
                    </div>
                    
                    <div className="sm:text-right">
                      <Separator className="mb-3 sm:hidden" />
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{calculateItemsTotal().toFixed(2)}
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
                  value={calculateItemsTotal()}
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
                      sale ? "Update Sales" : "Create Sales"
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

export default SalesForm;