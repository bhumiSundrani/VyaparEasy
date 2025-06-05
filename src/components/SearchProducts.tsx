'use client'

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command"
import React, { useEffect, useState, useCallback, useMemo } from "react"
import { useDebounce } from "@uidotdev/usehooks"
import axios from "axios"
import { ProductColumnData } from "@/tanstackColumns/productColumn"
import { 
  Search, 
  Package, 
  Loader2, 
  AlertCircle, 
  Tag,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react"

interface SelectProductsProps {
  value: string // This will be the product ID
  displayValue?: string // This will be the product name for display (used in edit mode)
  onChange: (val: string) => void // This will set the product ID
  onSelect: (product: ProductColumnData) => void
  placeholder?: string
  className?: string
}

export const SelectProducts: React.FC<SelectProductsProps> = ({
  value,
  displayValue,
  onChange,
  onSelect,
  placeholder = "Search products...",
  className = ""
}) => {
  const [results, setResults] = useState<ProductColumnData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cache, setCache] = useState<Map<string, ProductColumnData[]>>(new Map())
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<ProductColumnData | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const debouncedSearchTerm = useDebounce(searchTerm, 250)

  // Initialize with displayValue when editing
  useEffect(() => {
    if (displayValue && !isInitialized) {
      setSearchTerm(displayValue)
      setIsInitialized(true)
      
      // If we have both value (ID) and displayValue (name), create a mock selected product
      if (value) {
        setSelectedProduct({
          _id: value,
          name: displayValue,
          // Add other default properties as needed
        } as ProductColumnData)
      }
    }
  }, [displayValue, value, isInitialized])

  useEffect(() => {
    const fetchProductForEdit = async () => {
      if (value && displayValue && !isInitialized && !selectedProduct) {
        setIsLoading(true)
        try {
          // Fetch complete product data by ID
          const response = await axios.get(`/api/products/${value}`)
          const product = response.data
          
          if (product) {
            setSelectedProduct(product)
            setSearchTerm(product.name || displayValue)
          } else {
            // Fallback to mock object if API call fails
            setSelectedProduct({
              _id: value,
              name: displayValue,
            } as ProductColumnData)
            setSearchTerm(displayValue)
          }
        } catch (error) {
          console.error('Error fetching product for edit:', error)
          // Fallback to mock object
          setSelectedProduct({
            _id: value,
            name: displayValue,
          } as ProductColumnData)
          setSearchTerm(displayValue)
        } finally {
          setIsLoading(false)
          setIsInitialized(true)
        }
      }
    }
  
    fetchProductForEdit()
  }, [value, displayValue, isInitialized, selectedProduct])

  // Find selected product by ID when value changes (for new selections)
  useEffect(() => {
    if (value && results.length > 0 && !selectedProduct) {
      const product = results.find(p => p._id === value)
      if (product) {
        setSelectedProduct(product)
        setSearchTerm(product.name || "")
      }
    }
  }, [value, results, selectedProduct])

  // Clear selection when search term changes significantly
  useEffect(() => {
    if (selectedProduct && searchTerm !== selectedProduct.name && searchTerm.length > 0) {
      // Only clear if the search term is significantly different
      const similarity = searchTerm.toLowerCase().includes(selectedProduct.name?.toLowerCase() || '') ||
                        (selectedProduct.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      
      if (!similarity) {
        setSelectedProduct(null)
        onChange("") // Clear the ID
      }
    }
  }, [searchTerm, selectedProduct, onChange])

  // Memoized search function with caching
  const searchProducts = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([])
      return
    }

    // Check cache first
    if (cache.has(searchTerm)) {
      setResults(cache.get(searchTerm) || [])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

      const res = await axios.get(`/api/products/search?q=${encodeURIComponent(searchTerm)}`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        }
      })

      console.log(res)

      clearTimeout(timeoutId)
      
      const products = res.data.products || []
      setResults(products)
      
      // Cache the results
      setCache(prev => new Map(prev).set(searchTerm, products))
      
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Search request cancelled')
      } else {
        setError('Failed to search products. Please try again.')
        console.error('Search error:', err)
      }
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [cache])

  useEffect(() => {
    if (debouncedSearchTerm && !selectedProduct) {
      searchProducts(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm, searchProducts, selectedProduct])

  // Helper function to get stock status
  const getStockStatus = useCallback((product: ProductColumnData) => {
    const stock = product.currentStock || 0
    const threshold = product.lowStockThreshold || 10
    if (stock === 0) return { status: 'out', color: 'text-red-600', icon: Minus }
    if (stock <= threshold) return { status: 'low', color: 'text-amber-600', icon: TrendingDown }
    return { status: 'good', color: 'text-green-600', icon: TrendingUp }
  }, [])

  // Helper function to format price
  const formatPrice = useCallback((price: number | undefined) => {
    if (price === undefined || price === null) return 'N/A'
    return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }, [])

  // Handle input change
  const handleInputChange = useCallback((newValue: string) => {
    setSearchTerm(newValue)
    
    // If user clears the input, also clear the selection
    if (!newValue.trim()) {
      setSelectedProduct(null)
      onChange("")
    }
  }, [onChange])

  // Handle product selection
  const handleProductSelect = useCallback((product: ProductColumnData) => {
    setSelectedProduct(product)
    setSearchTerm(product.name || "")
    onChange(product._id) // Set the product ID
    onSelect(product)
    setResults([]) // Clear results after selection
  }, [onChange, onSelect])

  // Handle input focus - show dropdown if we have a search term but no selection
  const handleInputFocus = useCallback(() => {
    if (searchTerm && !selectedProduct && results.length === 0) {
      searchProducts(searchTerm)
    }
  }, [searchTerm, selectedProduct, results.length, searchProducts])

  const getPlaceholder = () => {
  if (selectedProduct?.name) {
    return selectedProduct.name
  }
  if (displayValue && displayValue.trim()) {
    return displayValue
  }
  return placeholder
}

  // Memoized product items for better performance
  const productItems = useMemo(() => {
    return results.map((product) => {
      const stockInfo = getStockStatus(product)
      const StockIcon = stockInfo.icon

      return (
        <CommandItem
          key={product._id}
          value={`${product.name} ${product.brand || ''} ${product.category?.name || ''}`}
          onSelect={() => handleProductSelect(product)}
          className="flex items-center justify-between p-3 sm:p-4 cursor-pointer bg-accent-foreground dark:hover:bg-slate-800 transition-colors duration-150 border-b border-gray-100 rounded-xl"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Product Image/Icon */}
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white overflow-hidden">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement!.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 7L12 3L4 7V17L12 21L20 17V7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
                  }}
                />
              ) : (
                <Package size={20} />
              )}
            </div>
            
            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 truncate text-sm sm:text-base">
                  {product.name || 'Unnamed Product'}
                </h3>
                {product.brand && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {product.brand}
                  </span>
                )}
              </div>
              
              <div className="flex items-center flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                {product.category?.name && (
                  <div className="flex items-center space-x-1">
                    <Tag size={12} className="flex-shrink-0" />
                    <span className="truncate">{product.category.name}</span>
                  </div>
                )}
                
                {product.unit && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400">
                    {product.unit}
                  </span>
                )}
                
                <div className={`flex items-center space-x-1 ${stockInfo.color}`}>
                  <StockIcon size={12} className="flex-shrink-0" />
                  <span className="font-medium truncate">
                    {product.currentStock !== undefined ? `${product.currentStock} in stock` : 'Stock unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Price and Stock Status */}
          <div className="flex-shrink-0 ml-3 flex flex-col items-end space-y-1 text-right">
            {product.sellingPrice !== undefined && (
              <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-slate-100">
                {formatPrice(product.sellingPrice)}
              </div>
            )}
            
            {product.costPrice !== undefined && product.sellingPrice !== undefined && (
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Cost: {formatPrice(product.costPrice)}
              </div>
            )}
            
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              stockInfo.status === 'good' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : stockInfo.status === 'low'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              <StockIcon size={10} className="mr-1 flex-shrink-0" />
              <span className="whitespace-nowrap">
                {stockInfo.status === 'out' ? 'Out of Stock' : 
                 stockInfo.status === 'low' ? 'Low Stock' : 'In Stock'}
              </span>
            </div>
          </div>
        </CommandItem>
      )
    })
  }, [results, getStockStatus, formatPrice, handleProductSelect])

  // Show dropdown condition - only show if we're searching and don't have a clear selection
  const shouldShowDropdown = results.length > 0 && searchTerm.length > 0 && 
    (!selectedProduct || selectedProduct.name !== searchTerm)

  return (
    <div className={`relative ${className}`}>
      <Command className="rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:bg-slate-900 w-full min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-500 flex-shrink-0" size={16} />
          <CommandInput
            placeholder={getPlaceholder()}
            value={searchTerm}
            onValueChange={handleInputChange}
            onFocus={handleInputFocus}
            className="h-11 text-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-inherit"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin flex-shrink-0" size={16} />
          )}
          {selectedProduct && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          )}
        </div>

        {/* Show dropdown based on search state */}
        {shouldShowDropdown && (
          <CommandList className="max-h-80 overflow-y-auto">
            {error && (
              <div className="flex items-center space-x-2 p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            {!error && (
              <>
                <CommandEmpty className="py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Searching products...</span>
                    </div>
                  ) : searchTerm.trim() ? (
                    <div className="flex flex-col items-center space-y-3 px-4">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                        <Search size={24} className="text-gray-400 dark:text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium">No products found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try searching by name
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-3 px-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Package size={24} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Search for products</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Start typing to find products by name
                        </p>
                      </div>
                    </div>
                  )}
                </CommandEmpty>
                
                {productItems}
              </>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  )
}