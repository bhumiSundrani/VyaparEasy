"use client"
import { Button } from '@/components/ui/button'
import React from 'react'
import { useRouter } from 'next/navigation'

const AdminPage = () => {
    const router = useRouter()
  return (
    <div className='p-6'>
        <h1>Admin page</h1>
        <div className='space-x-2.5 p-5'>
            <Button onClick={() => router.replace('/add-category')}>Add Category</Button>
            <Button onClick={() => router.replace('/add-product')}>Add Product</Button>
        </div>
    </div>
  )
}

export default AdminPage