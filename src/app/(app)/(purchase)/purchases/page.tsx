"use client"

import { DataTable } from '@/components/DataTable'
import React, { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { PurchaseColumnData, PurchaseColumns } from '@/tanstackColumns/purchaseColumn'
import { useRouter } from 'next/navigation'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import PurchaseFilterOptions from '@/components/PurchaseFilters' // Import the filter component
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

// Filter state interface
interface PurchaseFilters {
  searchTerm: string;
  status: string;
  paymentMethod: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc'
}

function PurchasePage() {
    const router = useRouter()
    const [purchase, setPurchase] = useState<PurchaseColumnData[]>([])
    const [loading, setLoading] = useState(true)
    const [suppliers, setSuppliers] = useState<string[]>([])
    const [redirecting, setRedirecting] = useState(false)
    
    // Filter state
    const [filters, setFilters] = useState<PurchaseFilters>({
        searchTerm: '',
        status: "",
        paymentMethod: '',
        sortBy: 'date',
        sortOrder: 'desc'
    })

    const fetchPurchase = async () => {
            setLoading(true)
            try {
                const res = await axios.get('/api/purchases')
                const purchaseResponse = res.data.purchases as PurchaseColumnData[]
                setPurchase(purchaseResponse)
                
                // Extract unique suppliers for filter dropdown
                const uniqueSuppliers = [...new Set(
                    purchaseResponse
                        .map(p => p.supplier?.name)
                        .filter(Boolean)
                )] as string[]
                setSuppliers(uniqueSuppliers)
                
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>
                console.error("Error fetching purchase: ", axiosError.response?.data.message)
            } finally {
                setLoading(false)
            }
        }
    // Fetch purchases
    useEffect(() => {        
        fetchPurchase()
    }, [])

    // Filter and sort logic
    const filteredAndSortedPurchases = useMemo(() => {
        let filtered = [...purchase]

        // Apply search filter
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase()
            filtered = filtered.filter(p => 
                p.supplier?.name?.toLowerCase().includes(searchLower) ||
                p.items?.some(item => 
                    item.productName?.toLowerCase().includes(searchLower)
                )
            )
        }

        if (filters.status) {
            const status = filters.status.trim().toLowerCase(); // "paid" | "unpaid"
            const wantPaid = status === "paid";                 // boolean
            filtered = filtered.filter(p => Boolean(p.paid) === wantPaid);
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
                    aValue = a.supplier?.name || ''
                    bValue = b.supplier?.name || ''
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
    }, [purchase, filters])

    // Handle filter changes
    const handleFiltersChange = (newFilters: PurchaseFilters) => {
        setFilters(newFilters)
    }

    // Clear all filters
    const handleClearFilters = () => {
        setFilters({
            searchTerm: '',
            status: '',
            paymentMethod: '',
            sortBy: 'date',
            sortOrder: 'desc'
        })
    }

    // Handle purchase deletion
    const handlePurchaseDeleted = () => {
        fetchPurchase()
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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Purchase Management</h1>
                </div>
                
                <div className='space-y-2'>
                <Button 
                    className='cursor-pointer bg-[#ff9900] hover:bg-[rgb(255,128,0)] text-white sm:px-7 w-35 text-base sm:py-5 transition-all duration-300' 
                    disabled={redirecting}
                    onClick={() =>{
                        setRedirecting(true)
                        router.push('/add-purchase')}}
                >
                    {redirecting ? <Loader2 height={60} width={60} className='animate-spin'/> : "Add Purchase"}
                </Button>
                
                
                {/* Results count */}
                <div className="flex items-center text-sm text-gray-600">
                    Showing {filteredAndSortedPurchases.length} of {purchase.length} purchases
                </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-4">
                <PurchaseFilterOptions
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={handleClearFilters}
                    suppliers={suppliers}
                    loading={loading}
                    label='Supplier'
                />
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm">
                <DataTable 
                    columns={PurchaseColumns(handlePurchaseDeleted, setPurchase)} 
                    data={filteredAndSortedPurchases}
                    loading={loading}
                />
            </div>
        </div>
    )
}

export default PurchasePage