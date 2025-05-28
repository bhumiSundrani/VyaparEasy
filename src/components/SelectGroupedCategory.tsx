"use client"

import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CategoryOption {
  _id: string
  name: string
  parentCategory?: string
}

interface SelectGroupedCategoryProps {
  value: string
  onChange: (value: string) => void
  includeAllOption?: boolean
}

const SelectGroupedCategory: React.FC<SelectGroupedCategoryProps> = ({
  value,
  onChange,
  includeAllOption = false,
}) => {
  const [categories, setCategories] = useState<CategoryOption[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get<{ categories: CategoryOption[] }>('/api/categories')
        setCategories(res.data.categories)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  const getCategoryLabel = (id: string): string => {
    if (id === 'All categories') return 'All Categories'
    
    const category = categories.find(cat => cat._id === id)
    if (!category) return 'Select Category'
    
    // If it's a subcategory, show "Parent > Child" format
    if (category.parentCategory) {
      const parent = categories.find(cat => cat._id === category.parentCategory)
      return parent ? `${parent.name} > ${category.name}` : category.name
    }
    
    return category.name
  }

  // Separate parent and child categories
  const parentCategories = categories.filter(cat => !cat.parentCategory)
  const childCategories = categories.filter(cat => cat.parentCategory)

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="text-sm">
        <SelectValue placeholder={includeAllOption ? 'All Categories' : 'Select Category'}>
          {getCategoryLabel(value)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {includeAllOption && (
          <SelectItem value="All categories">
            All Categories
          </SelectItem>
        )}
        
        {/* Parent Categories */}
        {parentCategories.map((parent) => (
          <SelectItem key={parent._id} value={parent._id}>
            {parent.name}
          </SelectItem>
        ))}
        
        {/* Child Categories with Parent > Child format */}
        {childCategories.map((child) => {
          const parent = categories.find(cat => cat._id === child.parentCategory)
          return (
            <div className='pl-4'>
            <SelectItem 
              key={child._id} 
              value={child._id} 
              className="pl-2 text-muted-foreground border-l-2 border-gray-200"
            >
              {parent ? `${parent.name} > ${child.name}` : child.name}
            </SelectItem>
            </div>
          )
        })}
      </SelectContent>
    </Select>
  )
}

export default SelectGroupedCategory