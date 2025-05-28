"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { Input } from '@/components/ui/input'
import { Loader2, Search } from 'lucide-react'
import { CategoryColumnData, categoryColumns } from '@/tanstackColumns/categoryColumn'
import { DataTable } from '@/components/DataTable'

const page = () => {
    const router = useRouter()
    const [categories, setCategories] = useState<CategoryColumnData[]>([])
    const [loading, setLoading] = useState(true)
    const [filteredCategories, setFilteredCategories] = useState<CategoryColumnData[]>([])
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [newCategoryPage, setNewCategoryPage] = useState(false)

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true)
            try {
                const res = await axios.get('/api/categories')
                if (res.data.success) {
                    const categoriesResponse = res.data.categories as CategoryColumnData[]
                    setCategories(categoriesResponse)
                    setFilteredCategories(categoriesResponse)
                } else {
                    // Handle case when no categories are found
                    setCategories([])
                    setFilteredCategories([])
                }
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>
                if (axiosError.response?.status === 404) {
                    setCategories([])
                    setFilteredCategories([])
                } else {
                    console.error("Error fetching categories: ", axiosError.response?.data.message)
                }
            } finally {
                setLoading(false)
            }
        }
        fetchCategories()
    }, [])

    useEffect(() => {
        let filtered = [...categories];

        // Apply search filter
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(category => {
                const parentCategoryName = category.parentCategory?.name || '';
                return (
                    category.name.toLowerCase().includes(searchLower) ||
                    parentCategoryName.toLowerCase().includes(searchLower)
                );
            });
        }

        setFilteredCategories(filtered);
    }, [searchTerm, categories]);

    const handleCategoryDeleted = () => {
        // Refresh the categories list by refetching
        const fetchCategories = async () => {
            setLoading(true)
            try {
                const res = await axios.get('/api/categories')
                const categoriesResponse = res.data.categories as CategoryColumnData[]
                setCategories(categoriesResponse)
                setFilteredCategories(categoriesResponse)
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>
                console.error("Error fetching categories: ", axiosError.response?.data.message)
            } finally {
                setLoading(false)
            }
        }
        fetchCategories()
    }

    return (
        <div className="min-h-screen bg-[#f5f7fa] px-2 py-4 sm:px-6 lg:px-12">
            <div className="mb-3 sm:mb-6 ml-2 flex flex-col sm:flex-row justify-between sm:w-full space-y-3.5 my-auto">
                <div className="flex items-center space-x-1 sm:space-x-2">
                    <Image
                        src="/category-icon-png-4.jpg"
                        alt="Add-category"
                        width={30}
                        height={30}
                        className="object-contain sm:h-[40px] sm:w-[40px]"
                    />              
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Categories</h1>
                </div>
                <Button 
                    className='cursor-pointer bg-[#ff9900] hover:bg-[rgb(255,128,0)] text-white sm:px-7 w-35 text-base sm:py-5 transition-all duration-300' 
                    disabled={newCategoryPage}
                    onClick={() =>{
                        setNewCategoryPage(true)
                        router.push('/add-category')}}
                >
                    {newCategoryPage ? <Loader2 height={60} width={60} className='animate-spin'/> : "New Category"}
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
                        placeholder="Search Categories..."
                    />
                </div>
            </div>

            <div className="mt-4">
                <DataTable 
                    columns={categoryColumns(handleCategoryDeleted)} 
                    data={filteredCategories}
                    loading={loading}
                    emptyStateMessage="No categories found"
                    emptyStateSubMessage="Get started by adding your first category."
                />
            </div>
        </div>
    )
}

export default page
