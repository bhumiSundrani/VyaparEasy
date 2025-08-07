import React, { useState, useEffect } from 'react'
import { 
  Search, 
  X
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

// Types for filter state
interface PurchaseFilters {
  searchTerm: string;
  status: string;
  paymentMethod: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
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
  loading = false,
  label
}) => {
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Count active filters
  useEffect(() => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.status) count++
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

  const statusOptions = [
    {value: 'all', label: "All"},
    {value: 'paid', label: "Paid"},
    {value: 'unpaid', label: "Unpaid"}
  ]

  return (
    <div className="w-full bg-white p-2 sm:p-4 rounded-lg shadow-xl">
  {/* Container: stack vertically on mobile, flex row on sm+ */}
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">

    {/* Left side: Search input */}
    <div className="w-full sm:flex-1 relative">
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

    {/* Right side: Filters, sort, and clear */}
    <div className="w-full sm:w-auto flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-3">

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(value) => updateFilter('status', value === 'all' ? '' : value)}
      >
        <SelectTrigger className="w-full sm:w-32 text-sm">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Payment Method Filter */}
      <Select
        value={filters.paymentMethod}
        onValueChange={(value) => updateFilter('paymentMethod', value === 'all' ? '' : value)}
      >
        <SelectTrigger className="w-full sm:w-32 text-sm">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          {paymentMethodOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort Options */}
      <div className="flex gap-2">
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

      {/* Clear Filters Button */}
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