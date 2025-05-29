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
    
    const category = categories.find(cat => cat._id.toString() === id.toString())
    if (!category) return 'Select Category'
    
    // If it's a subcategory, show "Parent > Child" format in the trigger value
    if (category.parentCategory) {
      const parent = categories.find(cat => cat._id.toString() === category.parentCategory?.toString())
      return parent ? `${parent.name} > ${category.name}` : category.name
    }
    
    return category.name
  }

  // Separate parent and child categories and sort them
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
        
        {/* Render parent categories and their children immediately after */}
        {parentCategories.map((parent) => (
          <React.Fragment key={parent._id}>
            {/* Parent Item */}
            <SelectItem value={parent._id}>
              {parent.name}
            </SelectItem>

            {/* Children of this parent */}
            {childCategories
              .filter((child) => child.parentCategory === parent._id)
              .map((child) => (
                <SelectItem
                  key={child._id}
                  value={child._id}
                  className="pl-6 text-muted-foreground border-l-2 border-gray-200"
                >
                  {`${parent.name} > ${child.name}`}
                </SelectItem>
              ))}
          </React.Fragment>
        ))}

         {/* Render childless categories as top level if needed (though they should be in parentCategories) */}
         {/* This section might be redundant if all childless cats are in parentCategories, but keeping for safety */}
         {/* categories.filter(cat => !cat.parentCategory && !parentCategories.find(p => p._id === cat._id)).map(cat => (
            <SelectItem key={cat._id} value={cat._id}> {cat.name} </SelectItem>
         )) */}

      </SelectContent>
    </Select>
  )
}

export default SelectGroupedCategory
