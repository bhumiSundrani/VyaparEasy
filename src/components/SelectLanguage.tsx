import React from 'react'
import { Controller } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'


const getLanguageLabel = (value: string) => {
  const labels: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    bn: "Bengali",
    ta: "Tamil",
    mr: "Marathi",
    te: "Telugu",
    gu: "Gujarati",
    kn: "Kannada"
  }
  return labels[value] || "Select your language"
}


const SelectLanguage = ({control}: any) => {
  return (
    <Controller 
        name='preferredLanguage'
        control={control}
        defaultValue={"en"}
        render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue>{getLanguageLabel(field.value)}</SelectValue> 
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="bn">Bengali</SelectItem>
                <SelectItem value="ta">Tamil</SelectItem>
                <SelectItem value="mr">Marathi</SelectItem>
                <SelectItem value="te">Telugu</SelectItem>
                <SelectItem value="gu">Gujarati</SelectItem>
                <SelectItem value="kn">Kannada</SelectItem>
              </SelectContent>
            </Select>
        )}
    />
  )
}

export default SelectLanguage