"use client"

import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import axios from 'axios'

export interface Category {
  _id: string
  name: string
  parentCategory?: string | null
}

const SelectCategory = ({ value, onChange }: { value: string | null, onChange: (value: string) => void }) => {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get<{ categories: Category[] }>('/api/categories')
        const allCategories = res.data.categories
        const parentCategories = allCategories.filter(cat => cat.parentCategory === null)
        setCategories(parentCategories)
      } catch (error) {
        console.log("Error fetching categories: ", error)
      }
    }
    fetchCategories()
  }, [])

  const getCategoryLabel = (value: string) => {
    const category = categories.find(cat => cat._id === value)
    return category?.name || "Select Category"
  }

  // Log value and onChange to debug
  console.log('Selected Value:', value)

  return (
    <Select onValueChange={(val) => onChange(val)} value={value || undefined}>
      <SelectTrigger>
        <SelectValue placeholder="Select Category">
          {value ? getCategoryLabel(value) : "Select Category"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
      <SelectItem value="none">Select Category</SelectItem>
        {categories.map((cat) => (
          <SelectItem value={cat._id} key={cat._id}>{cat.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default SelectCategory
