'use client'
import { Button } from '@/components/ui/button'
import { ApiResponse } from '@/types/ApiResponse'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'

const Dashboard = () => {
    const router = useRouter()
    const handleLogout = async () => {
        try {
            const res = await axios.post('/api/auth/logout')
            if(res){
                toast.success("User logged out")
                router.replace('/verify-user')
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            console.log("Error logging out user: ", axiosError)
        }
    }
  return (
    <div>
        <nav className='p-7 text-right'>
            <Button onClick={() => router.replace('/admin')}>Admin</Button>
            <Button onClick={handleLogout}>Logout</Button>
        </nav>
        <div>Dashboard
        </div>
    </div>
  )
}

export default Dashboard