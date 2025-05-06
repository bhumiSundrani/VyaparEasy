'use client'

import { useForm, Controller } from 'react-hook-form'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRef } from 'react'

type OTPForm = {
  otp: string[]
}

export default function OTPVerificationForm({
  onSubmit,
  loading,
}: {
  onSubmit: (otp: string) => void
  loading: boolean
}) {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    setError,
    formState: { errors },
    clearErrors
  } = useForm<OTPForm>({
    defaultValues: { otp: Array(6).fill('') }
  })

  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return
    setValue(`otp.${index}`, value, { shouldValidate: true })
    clearErrors('otp') // clear any existing errors on valid input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const value = getValues(`otp.${index}`)
  
    if (e.key === 'Backspace' && !value && index > 0) {
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }
  

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData('text').slice(0, 6)
    pasteData.split('').forEach((char, idx) => {
      if (/^\d$/.test(char)) {
        setValue(`otp.${idx}`, char, { shouldValidate: true })
      }
    })
    inputsRef.current[Math.min(pasteData.length, 5)]?.focus()
    clearErrors('otp')
  }

  const submitOTP = (data: OTPForm) => {
    const otp = data.otp.join('')
    if (otp.length < 6 || data.otp.some(digit => digit === '')) {
      setError('otp', {
        type: 'manual',
        message: 'Please enter the complete 6-digit OTP',
      })
      return
    }
    onSubmit(otp)
  }

  return (
    <form onSubmit={handleSubmit(submitOTP)} className="flex flex-col gap-4">
      <div className="flex gap-2 justify-center">
        {[...Array(6)].map((_, i) => (
          <Controller
            key={i}
            name={`otp.${i}` as const}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                maxLength={1}
                inputMode="numeric"
                className={`w-12 p-0 h-12 text-center sm:text-lg text-black bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.otp ? 'border-red-500' : ''
                }`}
                
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={handlePaste}
                ref={(el) => {
                  inputsRef.current[i] = el
                }}
              />
            )}
          />
        ))}
      </div>

      {/* Show error message if OTP is invalid */}
      {errors.otp && (
        <p className="text-sm text-red-500 text-center -mt-2">{errors.otp.message}</p>
      )}

      <Button
        type="submit"
        className={`w-full text-sm transition-all sm:mt-3 duration-300 ${
          loading
            ? 'bg-indigo-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700'
        } text-white font-medium py-2 px-4 rounded-lg`}
        disabled={loading}
      >
        {loading ? 'Verifying OTP...' : 'Verify OTP'}
      </Button>
    </form>
  )
}
