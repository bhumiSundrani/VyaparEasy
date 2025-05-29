// components/Navbar.tsx
'use client';

import { FiLogOut, FiBell } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import SideBar from './SideBar';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store/store';
import { useState } from 'react';
import Loader from './Loader';

export default function Navbar() {
  const router = useRouter();
  const user = useSelector((state : RootState) => state.auth.user)
  const [pageLoading, setPageLoading] = useState(false)

  const handleLogout = () => {
    try {
      axios.post('/api/auth/logout')
      setPageLoading(true)
      router.push('/verify-user');
    } catch (error) {
      console.log("Error logging out user", error)
    }
  };

  if(pageLoading) return <Loader/>

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-white shadow-sm">
      <div className='relative md:hidden'>
        <SideBar setPageLoading={() => setPageLoading(true)}/>
      </div>

      <div className="flex items-center gap-4">
        {/* Optional: Notifications */}
        <button className="relative">
          <FiBell className="text-xl" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">3</span>
        </button>

        {/* User Info / Logout */}
        <div className="flex items-center gap-2">
          <span className="font-medium">Hi, {user?.name}</span>
          <button onClick={handleLogout} className="text-red-600 hover:underline">
            <FiLogOut />
          </button>
        </div>
      </div>
    </header>
  );
}
