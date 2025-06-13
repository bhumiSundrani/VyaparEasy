'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Phone, 
  CreditCard, 
  Edit,
  Download,
  Clock,
  IndianRupee,
  ShoppingCart,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import axios from 'axios';
import { DeleteButton } from '@/components/DeleteButton';

interface SaleTransaction {
  _id: string;
  paymentType: 'cash' | 'credit';
  customer: {
    name: string;
    phone: string;
  };
  items: {
    productId: string;
    productName: string;
    quantity: number;
    pricePerUnit: number;
  }[];
  totalAmount: number;
  transactionDate: Date;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default function SaleViewPage() {
  const params = useParams();
  const router = useRouter();
  const saleId = params?.id as string;
  
  const [sale, setSale] = useState<SaleTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Move fetchPurchase inside useEffect
    const fetchSale = async () => {
      try {
        setLoading(true);
        // Replace with your HTTP client implementation
        // const response = await axios.get(`/api/purchases/${purchaseId}`);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sales/${saleId}`);
        const data = response.data;
        setSale(data.sale);
      } catch (error) {
        console.error('Error fetching sale:', error);
        toast.error('Failed to load sale details');
        router.push('/sales');
      } finally {
        setLoading(false);
      }
    };

    if (saleId) {
      fetchSale();
    }
  }, [saleId, router]); // purchaseId is the only external dependency now

  const handleEdit = () => {
    router.push(`/sales/edit-sale/${saleId}`);
  };

  console.log("Due date: ", sale?.dueDate)

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      // Replace with your HTTP client implementation
      // await axios.delete(`/api/purchases/${purchaseId}`);
      await axios.delete(`/api/sales/delete-sales/${saleId}`);
      toast.success('Sale deleted successfully', {
        icon: '✅',
      });
      router.push('/sales');
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast.error('Failed to delete sale', {
        icon: '❌',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sale details...</p>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sale Not Found</h2>
          <p className="text-gray-600 mb-4">The sale transaction you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/sales')} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sales
          </Button>
        </div>
      </div>
    );
  }

  const baseAmount = sale.items.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);
  const totalQuantity = baseAmount
  const isPaid = sale.paymentType === 'cash';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto sm:w-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="sm:text-xl text-base font-semibold text-gray-900">Sale Details</h1>
                <p className="text-sm text-gray-600 hidden sm:block">
                  Transaction ID: {sale._id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                disabled={actionLoading}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <DeleteButton
              onDelete={handleDelete}
              type='sale'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Supplier Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-blue-600" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Customer Name</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {sale.customer.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone Number</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <p className="text-lg text-gray-900">{sale.customer.phone}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items Purchased */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                  Items Sold ({sale.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sale.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                    
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {item.quantity} × ₹{item.pricePerUnit.toLocaleString('en-IN')}
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          ₹{(item.quantity * item.pricePerUnit).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="font-semibold text-gray-900">{totalQuantity} items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-xl font-bold text-blue-600">
                      ₹{baseAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Items Subtotal</span>
                  <span className="font-semibold">₹{baseAmount.toLocaleString('en-IN')}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{sale.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="mt-4">
                  <Badge 
                    className={`${
                      isPaid 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-orange-100 text-orange-800 border-orange-200'
                    } px-3 py-1`}
                  >
                    <CreditCard className="h-3 w-3 mr-1" />
                    {isPaid ? 'Paid (Cash)' : 'Credit Payment'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Details */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-gray-600" />
                  Transaction Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Transaction Date</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <p className="text-gray-900">
                      {new Date(sale.transactionDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                {sale.paymentType === 'credit' && 
                <div>
                  <label className="text-sm font-medium text-gray-600">Due Date</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <p className="text-gray-900">
                      {new Date(sale.dueDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                }
                

                {sale.updatedAt !== sale.createdAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(sale.updatedAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                  <p className="text-gray-900 mt-1 font-mono text-sm">
                    {sale._id}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleEdit}
                  className="w-full justify-start"
                  variant="outline"
                  disabled={actionLoading}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Sale
                </Button>
                
                <Button
                  onClick={() => window.print()}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Print/Save
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}