import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Package, 
  User, 
  X,
  ChevronDown,
  RefreshCw
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

// Types for filter state
interface PurchaseFilters {
  searchTerm: string
  dateRange: {
    from: string
    to: string
  }
  priceRange: {
    min: string
    max: string
  }
  status: string
  supplier: string
  paymentMethod: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface FilterComponentProps {
  filters: PurchaseFilters
  onFiltersChange: (filters: PurchaseFilters) => void
  onClearFilters: () => void
  suppliers?: string[]
  loading?: boolean,
  label: string
}

const PurchaseFilters: React.FC<FilterComponentProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  suppliers = [],
  loading = false,
  label
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Count active filters
  useEffect(() => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.dateRange.from || filters.dateRange.to) count++
    if (filters.priceRange.min || filters.priceRange.max) count++
    if (filters.status) count++
    if (filters.supplier) count++
    if (filters.paymentMethod) count++
    setActiveFiltersCount(count)
  }, [filters])

  const updateFilter = (key: keyof PurchaseFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }



  const paymentMethodOptions = [
    { value: "all", label: 'All' },
    { value: 'cash', label: 'Cash' },
    { value: 'credit', label: 'Credit' }
  ]

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'amount', label: 'Amount' },
    { value: 'supplier', label: label },
  ]

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      {/* Search and Quick Actions Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            placeholder="Search purchases by invoice, supplier, or notes..."
            className="pl-10 text-sm"
            disabled={loading}
          />
        </div>
        <div className="flex items-center gap-2">

          <div className='flex items-center gap-2'>
            <Select value={filters.paymentMethod} onValueChange={(value) => {
              if( value === 'all' ) value=""
              updateFilter('paymentMethod', value)}
            }>
              <SelectTrigger className='w-32 text-sm'>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethodOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                )) }
              </SelectContent>
            </Select>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
              <SelectTrigger className="w-32 text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3"
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PurchaseFilters