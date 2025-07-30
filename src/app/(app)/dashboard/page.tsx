'use client'
import { useRouter } from 'next/navigation'
import React from 'react'
import StatsCards from './StatsCards'
import Image from 'next/image'
import RecentActivities from './RecentActivities'
import TopCreditors from './TopCreditors'
import TopProducts from './TopProducts'
import LowStockAlert from './LowStockAlert'

const Dashboard = () => {
    const router = useRouter()
  return (
    <div className="min-h-screen bg-[#f5f7fa] px-2 py-4 sm:px-6 lg:px-12">
        <div className="mb-3 sm:mb-6 ml-2 flex flex-col sm:flex-row justify-between sm:w-full space-y-3.5 my-auto">
            <div className="flex items-center space-x-1 sm:space-x-2">
                <Image
                    src="/7936592.png"
                    alt="Purchase Management"
                    width={30}
                    height={30}
                    className="object-contain sm:h-[40px] sm:w-[40px]"
                />              
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
                        </div>
        </div>
        <div className='space-y-6'>
            <StatsCards/>
            <RecentActivities/>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                <TopCreditors/>
                <TopProducts/>
            </div>
            <LowStockAlert/>
        </div>
    </div>
  )
}

export default Dashboard