'use client'
import React from 'react'
import Navbar from './NavBar'
import SideBar from './SideBar';
import { usePathname } from 'next/navigation';

const LayoutWrapper = ({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) => {
    const pathname = usePathname()
    const noLayoutRoute = "/verify-user"
    if(pathname.startsWith(noLayoutRoute)) return <>{children}</>
  return (
    <div className='flex h-screen'>
        <SideBar/>
        <div className='flex flex-col flex-1'>
            <Navbar/>
            <main className="p-4 overflow-auto">
            {children}
        </main>
        </div>
    </div>
  )
}

export default LayoutWrapper