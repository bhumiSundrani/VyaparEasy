"use client"
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Category } from './SelectCategory'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
  } from '@/components/ui/select'

const SelectGroupedCategory = ({value, onChange}: {value: string, onChange: (value: string) => void}) => {
    const [categories, setCategories] = useState<Category[]>([])
    useEffect(() => {
        const fetchCategories = async () => {
              try {
                const res = await axios.get<{ categories: Category[] }>('/api/categories')
                const allCategories = res.data.categories
                setCategories(allCategories)
              } catch (error) {
                console.log("Error fetching categories: ", error)
              }
            }
            fetchCategories()
    }, [])
    const grouped = categories.reduce((acc: any, cat) => {
        if (!cat.parentCategory) {
          acc[cat._id] = { ...cat, subcategories: [] };
        } else {
          const parentId = cat.parentCategory.toString();
          if (!acc[parentId]) acc[parentId] = { subcategories: [] };
          acc[parentId].subcategories.push(cat);
        }
        return acc;
      }, {});

      const getCategoryLabel = (value: string) => {
        const category = categories.find(cat => cat._id === value)
        return category?.name || "Select Category"
      }

  return (
    <Select onValueChange={(val) => onChange(val)} value={value || undefined}>
      <SelectTrigger>
        <SelectValue placeholder="Select Category">
          {value ? getCategoryLabel(value) : "Select Category"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
      {Object.values(grouped).map((cat: any) => (
  <SelectGroup key={cat._id}>
    <SelectItem className="px-2 pt-2" value={cat._id}>{cat.name}</SelectItem>
    <div className="pl-4">
      {cat.subcategories.map((sub: any) => (
        <SelectItem
          key={sub._id}
          value={sub._id}
          className="text-sm pl-4 border-l border-gray-200"
        >
          {sub.name}
        </SelectItem>
      ))}
    </div>
  </SelectGroup>
))}
  </SelectContent>
    </Select>
  )
}

export default SelectGroupedCategory