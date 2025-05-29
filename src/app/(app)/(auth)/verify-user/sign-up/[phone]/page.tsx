'use client'

import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import SelectLanguage from '@/components/SelectLanguage'
import { useDispatch } from 'react-redux'
import { setUser } from '@/app/store/slices/authSlice'
import { useState } from 'react'

export interface SignUpFormData {
  name: string
  shopName: string
  preferredLanguage: string
}

export default function SignUpPage() {
  const [loading, setLoading] = useState(false)
  const { phone } = useParams() as { phone: string }
  const router = useRouter()
  const dispatch = useDispatch()

  const form = useForm<SignUpFormData>({
    defaultValues: {
      name: '',
      shopName: '',
      preferredLanguage: 'en',
    },
  })

  const {setError, formState: {errors}} = form

  const onSubmit = async (data: SignUpFormData) => {
    if (!phone) {
      toast.error('Phone number missing.')
      return
    }

    if(!data.name || !data.shopName){
      if(!data.name)
        setError('name', {
        type: 'manual',
        message: 'Please enter your name',
      })
      if(!data.shopName){
        setError('shopName', {
          type: 'manual',
          message: 'Please enter your shop name',
        })
      }
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('/api/auth/sign-up', {
        phone,
        ...data,
      })

      if (response.data.success) {
        toast.success('Account created successfully!', {
          icon: '✅',
        })
        try {
          const res = await axios.get('/api/auth/get-user')
          if (res.data && res.data.user) {
            dispatch(setUser(res.data.user))
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>
          console.log("Error fetching user: ", axiosError)
        }
        router.replace('/dashboard')
      } else {
        toast.error(response.data.message || 'Signup failed.', {
          icon: '❌',
        })
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || 'Something went wrong.', {
        icon: '❌',
      })
    }finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e293b] px-4">
      <Card className="w-full max-w-md p-6 rounded-2xl shadow-xl bg-white">
        <CardHeader>
        <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-center">Create Your Account</CardTitle>
          <div className="flex flex-col items-center -mt-4 sm:mt-0">
            <img
              src="/online-registration-or-sign-up-login-for-account-on-smartphone-app-user-interface-with-secure-password-mobile-application-for-ui-web-banner-access-cartoon-people-illustration-vector.jpg" // Make sure this illustration exists in your public folder
              alt="Sign up illustration"
              className="h-40 sm:h-40 md:h-56 lg:h-45 w-auto object-contain mx-auto"
            />            
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm sm:text-base text-muted-foreground -mt-9 sm:mt-0 mb-4">
            Enter your details to set up your account
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input value={phone} disabled className='h-9 sm:h-11 font-semibold text-sm sm:text-base px-2 placeholder:text-gray-500 border-gray-300'/>
                </FormControl>
              </FormItem>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} className={`h-9 sm:h-11 text-sm sm:text-base px-2 placeholder:text-gray-500 border-gray-300 ${errors.name ? 'border-red-500' : ''}` }/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shopName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your shop name" {...field} className={`h-9 sm:h-11 text-sm sm:text-base px-2 placeholder:text-gray-500 border-gray-300 ${errors.shopName ? 'border-red-500' : ''}`}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredLanguage"
                render={() => (
                  <FormItem>
                    <FormLabel>Preferred Language</FormLabel>
                    <FormControl>
                      <SelectLanguage
                        control={form.control}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <Button
              type="submit"
              className={`w-full text-sm transition-all sm:mt-3 duration-300 ${
                loading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white font-medium py-2 px-4 rounded-lg`}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
