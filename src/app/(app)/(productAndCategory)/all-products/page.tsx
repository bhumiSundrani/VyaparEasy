"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import SelectGroupedCategory from '@/components/SelectGroupedCategory'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import SelectStatus from '@/components/SelectStatus'
import { Input } from '@/components/ui/input'
import { Loader2, Search } from 'lucide-react'
import { ProductColumnData, productColumns } from '@/tanstackColumns/productColumn'
import { DataTable } from '@/components/DataTable'

const page = () => {
    const router = useRouter()
    const [selectedCategory, setSelectedCategory] = useState<string>("All categories")
    const [products, setProducts] = useState<ProductColumnData[]>([])
    const [loading, setLoading] = useState(true)
    const [filteredProducts, setFilteredProducts] = useState<ProductColumnData[]>([])
    const [status, setStatus] = useState<string>("all")
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [newProductPage, setNewProductPage] = useState(false)

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {
                const res = await axios.get('/api/products')
                const productsResponse = res.data.products as ProductColumnData[]
                setProducts(productsResponse)
                setFilteredProducts(productsResponse)
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>
                console.error("Error fetching products: ", axiosError.response?.data.message)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [setProducts])

    useEffect(() => {
        let filtered = [...products];

        // Apply category filter
        if (selectedCategory && selectedCategory !== "All categories") {
            filtered = filtered.filter(product => product.category._id === selectedCategory)
        }

        // Apply status filter
        if (status !== "all") {
            filtered = filtered.filter(product => {
                switch (status) {
                    case "in-stock":
                        return product.currentStock > 0;
                    case "low-stock":
                        return product.currentStock > 0 && product.currentStock <= product.lowStockThreshold;
                    case "out-of-stock":
                        return product.currentStock === 0;
                    default:
                        return true;
                }
            });
        }

        // Apply search filter
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(product => {
                const categoryName = typeof product.category === 'string' 
                    ? product.category 
                    : product.category?.name;
                
                return (
                    product.name.toLowerCase().includes(searchLower) ||
                    (product.brand?.toLowerCase().includes(searchLower) ?? false) ||
                    (categoryName?.toLowerCase().includes(searchLower) ?? false)
                );
            });
        }

        setFilteredProducts(filtered);
    }, [selectedCategory, status, searchTerm, products]);

    const handleProductDeleted = () => {
        // Refresh the products list by refetching
        const fetchProducts = async () => {
            setLoading(true)
            try {
                const res = await axios.get('/api/products')
                const productsResponse = res.data.products as ProductColumnData[]
                setProducts(productsResponse)
                setFilteredProducts(productsResponse)
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>
                console.error("Error fetching products: ", axiosError.response?.data.message)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }

    return (
        <div className="min-h-screen bg-[#f5f7fa] px-2 py-4 sm:px-6 lg:px-12">
            <div className="mb-3 sm:mb-6 ml-2 flex flex-col sm:flex-row justify-between sm:w-full space-y-3.5 my-auto">
                <div className="flex items-center space-x-1 sm:space-x-2">
                    <Image
                        src="/8552125.png"
                        alt="Add-product"
                        width={30}
                        height={30}
                        className="object-contain sm:h-[40px] sm:w-[40px]"
                    />              
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Products</h1>
                </div>
                <Button 
                    className='cursor-pointer bg-[#ff9900] hover:bg-[rgb(255,128,0)] text-white sm:px-7 w-35 text-base sm:py-5 transition-all duration-300' 
                    disabled={newProductPage}
                    onClick={() =>{
                        setNewProductPage(true)
                        router.push('/add-product')}}
                >
                    {newProductPage ? <Loader2 height={60} width={60} className='animate-spin'/> : "New Product"}
                </Button>
            </div>

            <div className='w-full flex flex-wrap bg-white space-x-3 space-y-2 p-2 sm:p-4 sm:space-y-0 rounded-lg shadow-xl'>
                <div className='relative flex-1'>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 text-sm" />
                    <Input
                        type='text'
                        value={searchTerm}
                        className='pl-10 text-sm sm:text-base'
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search Products..."
                    />
                </div>
                <div className='flex space-x-1 sm:space-x-3'>
                    <div>
                        <SelectGroupedCategory 
                            value={selectedCategory} 
                            onChange={setSelectedCategory} 
                            includeAllOption={true}
                        />
                    </div>
                    <div>
                        <SelectStatus value={status} onChange={setStatus}/>
                    </div>
                </div>            
            </div>

            <div className="mt-4">
                <DataTable 
                    columns={productColumns(handleProductDeleted)} 
                    data={filteredProducts}
                    loading={loading}
                />
            </div>
        </div>
    )
}

export default page