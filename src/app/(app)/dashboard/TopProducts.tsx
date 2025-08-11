import { Button } from '@/components/ui/button';
import axios, { AxiosError } from 'axios';
import { Bell, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

interface ProductsData {
    _id: string;
    productName: string;
    totalUnitsSold: number;
    totalSalesValue: number;
}

const TopProducts = () => {
    const [products, setProducts] = useState<ProductsData[] | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    useEffect(() => {
        const fetchProducts = async () => {
            try {
            const res = await axios.get("/api/dashboard/top-products");
            if(res.data && res.data.topProducts){
                setProducts(res.data.topProducts)
            }
            } catch (error) {
                const axiosError = error as AxiosError
                console.log("Error fetching products data: ", axiosError)
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
    Top Selling Products
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
            <th className="px-2 sm:px-4 py-2">Product Name</th>
            <th className="px-2 sm:px-4 py-2">Units Sold</th>
            <th className="px-2 sm:px-4 py-2">Total Sales</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((product, index) => (
            <tr key={product._id} className="border-t hover:bg-gray-50">
                <td className="px-2 sm:px-4 py-3 text-muted-foreground">{index+1}</td>

              <td className="px-2 sm:px-4 py-3 font-medium">{product.productName}</td>
<td className="px-2 sm:px-4 py-3 text-muted-foreground">
  {new Intl.NumberFormat("en-IN").format(product.totalUnitsSold)}
</td>
              <td className="px-2 sm:px-4 py-3 font-semibold text-blue-600">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(product.totalSalesValue || 0)}
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

export default TopProducts