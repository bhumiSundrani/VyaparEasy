import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from '@/components/DataTable'
import { SaleColumn, SaleColumnData } from '@/tanstackColumns/saleColumn'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { PurchaseColumnData, PurchaseColumns } from '@/tanstackColumns/purchaseColumn'

const RecentActivities = () => {
    const [sales, setSales] = useState<SaleColumnData[]>([])
    const [purchases, setPurchases] = useState<PurchaseColumnData[]>([])
    const [saleLoading, setSaleLoading] = useState(true)
    const [purchaseLoading, setPurchaseLoading] = useState(true)
    
    const fetchSale = async () => {
            setSaleLoading(true)
            try {
                const res = await axios.get('/api/dashboard/recent-sales')
                const saleResponse = res.data.recentSales as SaleColumnData[]
                setSales(saleResponse)
                
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>
                console.error("Error fetching purchase: ", axiosError.response?.data.message)
            } finally {
                setSaleLoading(false)
            }
        }

    const fetchPurchase = async () => {
                setPurchaseLoading(true)
                try {
                    const res = await axios.get('/api/dashboard/recent-purchases')
                    const purchaseResponse = res.data.recentPurchases as PurchaseColumnData[]
                    setPurchases(purchaseResponse)
                    
                } catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>
                    console.error("Error fetching purchase: ", axiosError.response?.data.message)
                } finally {
                    setPurchaseLoading(false)
                }
            }

        useEffect(() => {
            fetchSale()
            fetchPurchase()
    }, [])
    const handleSaleDeleted = () => {        
        fetchSale()
    }
    const handlePurchaseDeleted = () => {
        fetchPurchase()
    }
  return (
    <div>
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        {/* Header */}
        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          Recent Activities
        </div>
    <Tabs defaultValue="sales" className="">
            <TabsList>
    <TabsTrigger value="sales">Sales</TabsTrigger>
    <TabsTrigger value="purchases">Purchases</TabsTrigger>
  </TabsList>
  
  <TabsContent value="sales">
    <DataTable 
    data={sales}
    columns={SaleColumn(handleSaleDeleted, setSales)}
    loading={saleLoading}
    />
  </TabsContent>
  <TabsContent value="purchases">
    <DataTable 
    data={purchases}
    columns={PurchaseColumns(handlePurchaseDeleted, setPurchases)}
    loading={purchaseLoading}
    />
  </TabsContent>
</Tabs>
</div>
</div>
  )
}

export default RecentActivities