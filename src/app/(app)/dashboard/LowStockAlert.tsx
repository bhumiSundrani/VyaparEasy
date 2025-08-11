import Loader from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import axios, { AxiosError } from 'axios';
import { Bell, Loader2 } from 'lucide-react';
import { Types } from 'mongoose';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

interface ProductData {
    _id: string;
       name: string;
       brand: string;
       category: string;
       unit: 'kg' | 'gm' | 'liter' | 'ml' | 'pcs'
       costPrice: number;
       sellingPrice: number;
       lowStockThreshold: number;
       currentStock: number;
       imageUrl: string | null;
       user: string;
}

const LowStockAlert = () => {
    const [products, setProducts] = useState<ProductData[] | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    useEffect(() => {
        const fetchProducts = async () => {
            try {
            const res = await axios.get("/api/dashboard/low-stock-alerts");
            if(res.data && res.data.lowStockProducts){
                setProducts(res.data.lowStockProducts)
            }
            } catch (error) {
                const axiosError = error as AxiosError
                console.log("Error fetching low stock product data: ", axiosError)
            }finally{
                setLoading(false)
            }
        }
        fetchProducts()
        
    }, [])


  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
  {/* Header */}
  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
    Products Low in Stock
  </div>

  {/* Table */}
  {loading ? (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
    </div>
  ) : products && products.length === 0 ? (
    <div className="text-center text-gray-500">No Products Found</div>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto text-xs sm:text-sm rounded-xl">
        <thead className="bg-gray-100 text-left text-gray-700">
          <tr>
            <th className='px-2 sm:px-4 py-2'>#</th>
            <th className='px-2 sm:px-4 py-2'>Image</th>
            <th className="px-2 sm:px-4 py-2">Name</th>
            <th className="px-2 sm:px-4 py-2">Brand</th>
            <th className="px-2 sm:px-4 py-2">Current Stock</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((product, index) => (
            <tr key={product._id} className="border-t hover:bg-gray-50">
            <td className="px-2 sm:px-4 py-3 text-muted-foreground">{index + 1}</td>
            <td className="px-2 sm:px-4 py-3 relative rounded-xl my-2 overflow-hidden inline-block bg-gray-100 border border-gray-200 shadow-sm">
                <img
                alt={product.name}
                src={product.imageUrl || "/product-icon-png-19.jpg"}
                className="object-cover h-8 sm:h-10 transition-transform hover:scale-105" 
                onError={(e) => {
                e.currentTarget.src = '/product-icon-png-19.jpg';
                }}
                loading="lazy"
                />
            </td>
            <td className="px-2 sm:px-4 py-3 font-medium">{product.name}</td>              
            <td className="px-2 sm:px-4 py-3 text-muted-foreground">{product.brand}</td>
              <td className="px-2 sm:px-4 py-3 text-muted-foreground">
  {new Intl.NumberFormat("en-IN").format(product.currentStock)} {product.unit}
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

  )
}

export default LowStockAlert 
