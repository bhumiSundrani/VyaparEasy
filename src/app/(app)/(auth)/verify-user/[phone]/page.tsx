'use client'

import OTPVerificationForm from '@/components/OTPInput'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiResponse } from '@/types/ApiResponse'
import axios, { AxiosError } from 'axios'
import { useParams, useRouter  } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { MdEdit } from "react-icons/md";
import Loader from '@/components/Loader'

export default function Page() {
  const [mounted, setMounted] = useState(false)
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const [seconds, setSeconds] = useState(30)

  const phone : string = params.phone as string

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if(seconds === 0) return

    const timer = setInterval(() => {
      setSeconds(prev => prev-1);
    }, 1000)

    return () => clearInterval(timer)
  }, [seconds])

  const handleResendOTP = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/auth/send-otp', { phone: phone })
      if (response.data.success) {
        toast.success('OTP Sent Successfully!', {
          icon: '✅',
        })
      }
    }catch(error){
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || 'Something went wrong.', {
        icon: '❌',
      })
    }
  }

  const handleOTPSubmit = async (otp: string) => {
    setLoading(true)
    if(!phone){
      toast.error("Phone number is missing in the URL.", {
        icon: '❌',
      })
      return
    }
    try {
      const response = await axios.post('/api/auth/verify-otp', {phone: phone, otp: otp}, {
        withCredentials: true
      })

      if (response.data.success) {
        toast.success('OTP Verified Successfully!', {
          icon: '✅',
        })
        // Add a small delay to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const userResponse = await axios.get('/api/auth/get-user', {withCredentials: true})
          console.log('User Response:', userResponse.data) // Debug log
          
          // Check if we have a valid user object
          if (userResponse.data.success && userResponse.data.user && Object.keys(userResponse.data.user).length > 0) {
            console.log("User already exists with data:", userResponse.data.user)
            setPageLoading(true)
            router.replace('/')
          } else {
            console.log("No existing user found, redirecting to signup")
            setPageLoading(true)
            router.replace(`/verify-user/sign-up/${phone}`)
          }
        } catch (error) {
          const axiosError = error as AxiosError
          console.log('Error details:', axiosError.response?.data) // Debug log
          if (axiosError.response?.status === 401 || axiosError.response?.status === 404) {
            console.log("Unauthorized - No token found")
            setPageLoading(true)
            router.replace(`/verify-user/sign-up/${phone}`)
          } else {
            toast.error("Something went wrong while fetching user data", {
              icon: '❌',
            })
            setPageLoading(true)
            router.replace(`/verify-user/sign-up/${phone}`)
          }
        }
      } else {
        toast.error(response.data.message || 'Failed to verify OTP', {
          icon: '❌',
        })
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || 'Something went wrong', {
        icon: '❌',
      })
    }finally{
      setLoading(false)
    }
  }

  const handleEdit = () => {
    router.replace(`/verify-user?phone=${phone}`);
  }

  if(!mounted) return null

  if(pageLoading) return <Loader/>

  return (
    <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] min-h-screen flex items-center justify-center px-2 py-4 overflow-hidden">
      <Card className="w-full max-w-md shadow-xl sm:py-6 rounded-2xl sm:px-4">
      <CardHeader className="px-4 pt-4">
      <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-center">
            Verify OTP
      </CardTitle>
      <img
        src="/assets_task_01jt6am4ktfekbsdndykym2w3t_1746116748_img_0.webp"
        alt="Verify Illustration"
        className="h-40 sm:h-48 md:h-56 lg:h-64 w-auto object-contain mx-auto"
      />
        </CardHeader>
      <CardDescription className="text-xs sm:text-sm text-center mt-2 px-4">
        Enter the 6-digit OTP sent to{' '}
        <span className="inline-flex items-center gap-1 font-semibold">
          {phone}
          <span className="cursor-pointer text-indigo-600 hover:underline" onClick={handleEdit}>
            <MdEdit size={14} />
          </span>
        </span>

       </CardDescription>
        <CardContent>
          <OTPVerificationForm onSubmit={handleOTPSubmit} loading={loading}/>
        </CardContent>

        <CardDescription className="text-xs sm:text-sm text-center mt-2 px-4">{seconds > 0 ? `Request new OTP in ${seconds} seconds.` : <span onClick={handleResendOTP} className='text-blue-500 hover:text-blue-700 hover:underline cursor-pointer'>Resend OTP</span> }</CardDescription>
      </Card>
    </div>
  )
}
