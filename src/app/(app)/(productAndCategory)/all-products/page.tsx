"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import SelectGroupedCategory from '@/components/SelectGroupedCategory'
import axios from 'axios'

const page = () => {
    const router = useRouter()
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [products, setProducts] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('/api/products')
                
            } catch (error) {
                
            }
        }
    }, [selectedCategory])
  return (
    <div className="min-h-screen bg-[#f5f7fa] px-2 py-4 sm:px-6 lg:px-12">
        <div className="mb-6 ml-2 flex flex-col sm:flex-row justify-between sm:w-full space-y-3.5 my-auto">
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
            <Button className='cursor-pointer bg-[#ff9900] hover:bg-[rgb(255,128,0)] text-white sm:px-7 w-35 text-base sm:py-5 transition-all duration-300' onClick={() => router.push('/add-product')}>
            New Product</Button>
        </div>

        <div className='w-full'>
            <div>

            </div>
            <div>
                <SelectGroupedCategory value=''/>
            </div>
        </div>
    </div>
  )
}

export default page