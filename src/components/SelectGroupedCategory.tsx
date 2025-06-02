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
  parentCategory?: {
    _id: string
    name: string
  } | null
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
        console.log('Fetched categories:', res.data.categories)
        console.log('Sample category with parent:', res.data.categories.find(cat => cat.parentCategory))
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
      return `${category.parentCategory.name} > ${category.name}`
    }
    
    return category.name
  }

  // Separate parent and child categories and sort them
  const parentCategories = categories.filter(cat => !cat.parentCategory)
  const childCategories = categories.filter(cat => cat.parentCategory)

  // Helper function to get children of a specific parent
  const getChildrenOfParent = (parentId: string) => {
    return childCategories.filter((child) => {
      if (!child.parentCategory) return false
      return child.parentCategory._id.toString() === parentId.toString()
    })
  }

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
        {parentCategories.map((parent) => {
          const children = getChildrenOfParent(parent._id)
          
          return (
            <React.Fragment key={parent._id}>
              {/* Parent Item */}
              <SelectItem value={parent._id}>
                {parent.name}
              </SelectItem>

              {/* Children of this parent */}
              {children.map((child) => (
                <div className='ml-4' key={child._id}>
                <SelectItem
                  key={child._id}
                  value={child._id}
                  className="text-muted-foreground border-l-2 border-gray-200"
                >
                  {child.name}
                </SelectItem>
                </div>
              ))}
            </React.Fragment>
          )
        })}

        {/* Render orphaned categories (categories that have parentCategory but parent doesn't exist) */}
        {childCategories
          .filter(child => {
            if (!child.parentCategory) return false
            return !parentCategories.find(parent => parent._id.toString() === child.parentCategory!._id.toString())
          })
          .map(orphan => (
            <SelectItem key={orphan._id} value={orphan._id}>
              {orphan.name}
            </SelectItem>
          ))}

      </SelectContent>
    </Select>
  )
}

export default SelectGroupedCategory