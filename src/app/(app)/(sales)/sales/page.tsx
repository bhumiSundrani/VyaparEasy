"use client"

import { DataTable } from '@/components/DataTable'
import React, { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import PurchaseFilterOptions from '@/components/PurchaseFilters' // Import the filter component
import { SaleColumn, SaleColumnData } from '@/tanstackColumns/saleColumn'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

// Filter state interface
interface PurchaseFilters {
  searchTerm: string
  dateRange: {
    from: string
    to: string
  }
  priceRange: {
    min: string
    max: string
  }
  status: string
  supplier: string
  paymentMethod: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

function PurchasePage() {
    const router = useRouter()
    const [sale, setSale] = useState<SaleColumnData[]>([])
    const [loading, setLoading] = useState(true)
    const [customers, setCustomers] = useState<string[]>([])
    const [redirecting, setRedirecting] = useState(false)
    
    // Filter state
    const [filters, setFilters] = useState<PurchaseFilters>({
        searchTerm: '',
        dateRange: { from: '', to: '' },
        priceRange: { min: '', max: '' },
        status: '',
        supplier: '',
        paymentMethod: '',
        sortBy: 'date',
        sortOrder: 'desc'
    })

    // Fetch purchases
    useEffect(() => {
        const fetchSale = async () => {
            setLoading(true)
            try {
                const res = await axios.get('/api/sales')
                const saleResponse = res.data.sales as SaleColumnData[]
                setSale(saleResponse)
                
                // Extract unique suppliers for filter dropdown
                const uniqueCustomers = [...new Set(
                    saleResponse
                        .map(p => p.customer?.name)
                        .filter(Boolean)
                )] as string[]
                setCustomers(uniqueCustomers)
                
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>
                console.error("Error fetching sale: ", axiosError.response?.data.message)
            } finally {
                setLoading(false)
            }
        }
        fetchSale()
    }, [])

    // Filter and sort logic
    const filteredAndSortedPurchases = useMemo(() => {
        let filtered = [...sale]

        // Apply search filter
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase()
            filtered = filtered.filter(p => 
                p.customer?.name?.toLowerCase().includes(searchLower) ||
                p.items?.some(item => 
                    item.productName?.toLowerCase().includes(searchLower)
                )
            )
        }

        // Apply date range filter
        if (filters.dateRange.from || filters.dateRange.to) {
            filtered = filtered.filter(p => {
                const purchaseDate = new Date(p.transactionDate)
                const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from) : null
                const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : null
                
                if (fromDate && purchaseDate < fromDate) return false
                if (toDate && purchaseDate > toDate) return false
                return true
            })
        }

        // Apply price range filter
        if (filters.priceRange.min || filters.priceRange.max) {
            filtered = filtered.filter(p => {
                const amount = p.totalAmount || 0
                const min = filters.priceRange.min ? parseFloat(filters.priceRange.min) : 0
                const max = filters.priceRange.max ? parseFloat(filters.priceRange.max) : Infinity
                
                return amount >= min && amount <= max
            })
        }

        

        // Apply supplier filter
        if (filters.supplier) {
            filtered = filtered.filter(p => 
                p.customer?.name === filters.supplier
            )
        }

        // Apply payment method filter
        if (filters.paymentMethod) {
            filtered = filtered.filter(p => p.paymentType === filters.paymentMethod)
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: any
            let bValue: any

            switch (filters.sortBy) {
                case 'date':
                    aValue = new Date(a.transactionDate)
                    bValue = new Date(b.transactionDate)
                    break
                case 'amount':
                    aValue = a.totalAmount || 0
                    bValue = b.totalAmount || 0
                    break
                case 'supplier':
                    aValue = a.customer?.name || ''
                    bValue = b.customer?.name || ''
                    break
                default:
                    aValue = new Date(a.transactionDate)
                    bValue = new Date(b.transactionDate)
            }

            if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1
            if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1
            return 0
        })

        return filtered
    }, [sale, filters])

    // Handle filter changes
    const handleFiltersChange = (newFilters: PurchaseFilters) => {
        setFilters(newFilters)
    }

    // Clear all filters
    const handleClearFilters = () => {
        setFilters({
            searchTerm: '',
            dateRange: { from: '', to: '' },
            priceRange: { min: '', max: '' },
            status: '',
            supplier: '',
            paymentMethod: '',
            sortBy: 'date',
            sortOrder: 'desc'
        })
    }

    // Handle purchase deletion
    const handleSaleDeleted = () => {
        const fetchSale = async () => {
            setLoading(true)
            try {
                const res = await axios.get('/api/sales')
                const saleResponse = res.data.sales as SaleColumnData[]
                setSale(saleResponse)
                
                // Update suppliers list
                const uniqueCustomers = [...new Set(
                    saleResponse
                        .map(p => p.customer?.name)
                        .filter(Boolean)
                )] as string[]
                setCustomers(uniqueCustomers)
                
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>
                console.error("Error fetching purchase: ", axiosError.response?.data.message)
            } finally {
                setLoading(false)
            }
        }
        fetchSale()
    }

    return (
        <div className="min-h-screen bg-[#f5f7fa] px-2 py-4 sm:px-6 lg:px-12">
            {/* Header */}
            <div className="mb-3 sm:mb-6 ml-2 flex flex-col sm:flex-row justify-between sm:w-full space-y-3.5 my-auto">
                <div className="flex items-center space-x-1 sm:space-x-2">
                    <Image
                        src="/4064925.png"
                        alt="Purchase Management"
                        width={30}
                        height={30}
                        className="object-contain sm:h-[40px] sm:w-[40px]"
                    />              
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Sale Management</h1>
                </div>
                
                <div className='space-y-2'>
                <Button 
                    className='cursor-pointer bg-[#ff9900] hover:bg-[rgb(255,128,0)] text-white sm:px-7 w-35 text-base sm:py-5 transition-all duration-300' 
                    disabled={redirecting}
                    onClick={() =>{
                        setRedirecting(true)
                        router.push('/add-sale')}}
                >
                    {redirecting ? <Loader2 height={60} width={60} className='animate-spin'/> : "Add Sale"}
                </Button>

                {/* Results count */}
                <div className="flex items-center text-sm text-gray-600">
                    Showing {filteredAndSortedPurchases.length} of {sale.length} sales
                </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-4">
                <PurchaseFilterOptions
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={handleClearFilters}
                    suppliers={customers}
                    loading={loading}
                    label="Customer"
                />
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm">
                <DataTable 
                    columns={SaleColumn(handleSaleDeleted)} 
                    data={filteredAndSortedPurchases}
                    loading={loading}
                />
            </div>
        </div>
    )
}

export default PurchasePage