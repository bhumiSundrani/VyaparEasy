'use client'

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command"
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useDebounce } from "@uidotdev/usehooks"
import axios from "axios"
import { Search, User, Building2, Phone, Loader2, AlertCircle, Calendar } from "lucide-react"

interface Party {
  _id: string
  name: string
  transactionId?: string
  phone: string
  type: 'customer' | 'vendor'
}

interface SelectPartiesProps {
  value: string
  onChange: (val: string) => void
  onSelect: (party: Party) => void
  placeholder?: string
  className?: string
  defaultPartyType?: 'customer' | 'vendor'
  clearInputOnSelect?: boolean
}

export const SelectParties: React.FC<SelectPartiesProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = "Search parties...",
  className = "",
  defaultPartyType = 'customer',
  clearInputOnSelect = false
}) => {
  const [results, setResults] = useState<Party[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cache, setCache] = useState<Map<string, Party[]>>(new Map())
  
  // Use useRef to track the current search term to avoid stale closures
  const currentSearchRef = useRef<string>('')
  
  const debouncedSearchTerm = useDebounce(value, 250)

  // Memoized search function with caching
  const searchParties = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([])
      currentSearchRef.current = ''
      return
    }

    // Update current search term
    currentSearchRef.current = searchTerm

    // Check cache first
    if (cache.has(searchTerm)) {
      const cachedResults = cache.get(searchTerm) || []
      setResults(cachedResults)
      return
    }

    setIsLoading(true)
    setError(null)
    // Clear results immediately when starting a new search
    setResults([])

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const res = await axios.post(`/api/parties?q=${encodeURIComponent(searchTerm)}`, 
        { type: defaultPartyType }, 
        {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
          }
        }
      )

      clearTimeout(timeoutId)
      
      // Only update results if this is still the current search
      if (searchTerm === currentSearchRef.current) {
        const parties = res.data.parties || []
        setResults(parties)
        
        // Cache the results
        setCache(prev => new Map(prev).set(searchTerm, parties))
      }
      
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Search request cancelled')
      } else {
        // Only show error if this is still the current search
        if (searchTerm === currentSearchRef.current) {
          setError('Failed to search parties. Please try again.')
          setResults([])
        }
        console.error('Search error:', err)
      }
    } finally {
      // Only update loading state if this is still the current search
      if (searchTerm === currentSearchRef.current) {
        setIsLoading(false)
      }
    }
  }, [cache, defaultPartyType])

  useEffect(() => {
    searchParties(debouncedSearchTerm)
  }, [debouncedSearchTerm, searchParties])

  // Handle party selection
  const handlePartySelect = useCallback((party: Party) => {
    // Validate party data
    if (!party || !party.name) {
      setError('Invalid party data')
      return
    }

    // Call the onSelect callback first
    onSelect(party)
    
    // Handle input clearing or setting based on preference
    if (clearInputOnSelect) {
      onChange('')
    } else {
      onChange(party.name)
    }
  }, [onSelect, onChange, clearInputOnSelect])

  // Memoized party items for better performance
  const partyItems = useMemo(() => {
    return results.map((party) => (
      <CommandItem
        key={party._id}
        value={party.name}
        onSelect={() => handlePartySelect(party)}
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm ${
            party.type === 'customer' 
              ? 'bg-blue-500' 
              : party.type === 'vendor'
              ? 'bg-green-500'
              : 'bg-gray-500'
          }`}>
            {party.type === 'customer' ? (
              <User size={16} />
            ) : party.type === 'vendor' ? (
              <Building2 size={16} />
            ) : (
              <User size={16} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                {party.name || 'Unknown Party'}
              </p>
              {party.type && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  party.type === 'customer'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : party.type === 'vendor'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {party.type}
                </span>
              )}
            </div>
            
                {party.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone size={12} />
                    <span>{party.phone}</span>
                  </div>
                )}
              </div>
        </div>

      </CommandItem>
    ))
  }, [results, handlePartySelect])

  // Calculate if we should show the results count badge
  const shouldShowResultsCount = useMemo(() => {
    return results.length > 0 && 
           !isLoading && 
           currentSearchRef.current.trim() !== '' &&
           currentSearchRef.current === debouncedSearchTerm
  }, [results.length, isLoading, debouncedSearchTerm])

  return (
    <div className={`relative ${className}`}>
      <Command className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all duration-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-500" size={16} />
          <CommandInput
            placeholder={placeholder}
            value={value}
            onValueChange={onChange}
            className="py-4 text-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 animate-spin" size={16} />
          )}
        </div>

        {/* Only show CommandList when there's content to display */}
        {(value.trim() || results.length > 0 || error) && (
          <CommandList className="max-h-64 overflow-y-auto">
            {error && (
              <div className="flex items-center space-x-2 p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            {!error && (
              <>
                {/* Show loading state */}
                {isLoading && (
                  <div className="flex items-center justify-center space-x-2 p-4 text-slate-500 dark:text-slate-400">
                    <Loader2 className="animate-spin" size={16} />
                    <span className="text-sm">Searching...</span>
                  </div>
                )}

                {/* Show results when available */}
                {results.length > 0 && !isLoading && partyItems}

                {/* Show "no results" message */}
                {!isLoading && results.length === 0 && value.trim() && (
                  <div className="flex flex-col items-center space-y-2 p-4 text-slate-500 dark:text-slate-400">
                    <Search size={20} className="text-slate-300 dark:text-slate-600" />
                    <span className="text-sm">No parties found for &quot;{value.trim()}&quot;</span>
                  </div>
                )}
              </>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  )
}