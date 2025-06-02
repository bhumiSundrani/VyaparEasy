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
import { useDispatch } from 'react-redux';
import { setUser } from '@/app/store/slices/authSlice';
import { useEffect } from 'react';

export default function Navbar() {
  const dispatch = useDispatch()
  const router = useRouter();
  const user = useSelector((state : RootState) => state.auth.user)
  const [pageLoading, setPageLoading] = useState(true)

  const handleLogout = () => {
    try {
      axios.post('/api/auth/logout')
      setPageLoading(true)
      router.push('/verify-user');
    } catch (error) {
      console.log("Error logging out user", error)
    }
  };

  useEffect(()=>{
      async function getUser(){
        const res = await axios.get('/api/auth/get-user')
        const user = res.data?.user || null
        return user
      }

      const fetchUserData = async () => {
        const userData = await getUser()
        dispatch(setUser(userData))
        setPageLoading(false)
      }
      fetchUserData()
  }, [dispatch])

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
          {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full"></span> */}
        </button>

        {/* User Info / Logout */}
        <div className="flex items-center gap-2">
          <span className="font-medium">Hi, {user?.name}</span>
          <abbr title="Logout" onClick={handleLogout} className="text-red-600 hover:bg-red-100 transition-all rounded-full p-2 cursor-pointer">
            <FiLogOut />
          </abbr>
        </div>
      </div>
    </header>
  );
}
