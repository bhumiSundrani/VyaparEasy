'use client'
import React from 'react'
import StatsCards from './StatsCards'
import Image from 'next/image'
import RecentActivities from './RecentActivities'
import TopCreditors from './TopCreditors'
import TopProducts from './TopProducts'
import LowStockAlert from './LowStockAlert'

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-[#f5f7fa] px-3 py-4 sm:px-6 lg:px-8 xl:px-12 overflow-auto">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
                <Image
                    src="/7936592.png"
                    alt="Dashboard"
                    width={30}
                    height={30}
                    className="object-contain w-8 h-8 sm:w-10 sm:h-10"
                />              
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Dashboard</h1>
            </div>
        </div>
        <div className='space-y-4 sm:space-y-6'>
            <StatsCards/>
            <RecentActivities/>
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6'>
                <TopCreditors/>
                <TopProducts/>
            </div>
            <LowStockAlert/>
        </div>
    </div>
  )
}

export default Dashboard