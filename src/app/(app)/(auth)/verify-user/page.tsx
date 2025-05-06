'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyUserPage() {
  // All hooks must be called at the top level, before any conditionals
  const [mounted, setMounted] = useState(false)
  const [phoneNo, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Mark component as mounted (client-side)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Set phone number from query params, but only after component is mounted
  useEffect(() => {
    if (mounted) {
      const phoneParam = searchParams.get('phone')
      if (phoneParam) {
        setPhone(phoneParam)
      }
    }
  }, [mounted, searchParams])

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!phoneNo || phoneNo.length !== 10) {
      setError("Please enter a valid 10-digit phone number.")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post<ApiResponse>('/api/auth/send-otp', { phone: phoneNo })

      if (response.data.success) {
        toast.success('OTP sent successfully!', {
          icon: '✅',
        })
        router.push(`/verify-user/${phoneNo}`)
      } else {
        toast.error(response.data.message || 'Failed to send OTP.', {
          icon: '❌',
        })
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || 'Something went wrong.', {
        icon: '❌',
      })
    } finally {
      setLoading(false)
    }
  }

  // If not mounted, show loading state or nothing
  if (!mounted) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] min-h-screen flex items-center justify-center px-2 py-4 overflow-hidden">
      <Card className="w-full max-w-md shadow-xl sm:py-6 rounded-2xl sm:px-4">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-center">
            Let's Verify Your Phone
          </CardTitle>
        </CardHeader>

        <div className="flex justify-center px-4">
          <img
            src="/assets_task_01jt5kgxyhf59svhbkpq1x7j3t_1746092517_img_0.PNG"
            alt="Verify Illustration"
            className="h-40 w-auto object-contain sm:h-48"
          />
        </div>

        <CardDescription className="text-xs sm:text-sm text-center mt-2 px-4">
          Enter your mobile number to receive a verification code.
        </CardDescription>

        <CardContent className="px-4 py-2">
          <form onSubmit={handlePhoneSubmit} className="space-y-3">
            <div className="flex items-center gap-2 w-full">
              <Input
                readOnly
                value="+91"
                className="w-[40px] px-1 text-sm h-9 sm:h-11 text-black dark:text-white bg-gray-100 dark:bg-gray-800"
                aria-label="Country Code"
              />
              <Input
                type="tel"
                placeholder="Phone number"
                value={phoneNo}
                onChange={(e) => {
                  if(error) setError("")
                  setPhone(e.target.value)
                }}
                maxLength={10}
                required
                className={`flex-1 h-9 sm:h-11 text-sm sm:text-base px-2 placeholder:text-gray-500 border-gray-300 ${error && "border-red-500"}`}
                aria-label="Phone Number"
              />
            </div>
            {error && <p className="text-sm text-red-500 -mt-2">{error}</p>}
            <Button
              type="submit"
              className={`w-full text-sm transition-all sm:mt-3 duration-300 ${
                loading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white font-medium py-2 px-4 rounded-lg`}
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}