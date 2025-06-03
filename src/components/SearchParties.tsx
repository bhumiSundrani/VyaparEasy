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
import { Search, User, Building2, Phone, Calendar, DollarSign, Loader2, AlertCircle } from "lucide-react"

interface Party {
  _id: string
  name: string
  transactionId?: string
  phone: string
  type: 'customer' | 'vendor'
  amount?: number
  dueDate?: Date
  paid?: boolean
  remindersSent?: number
  lastReminderDate?: Date | null
}

interface SelectPartiesProps {
  value: string
  onChange: (val: string) => void
  onSelect: (party: Party) => void
  placeholder?: string
  className?: string
}

export const SelectParties: React.FC<SelectPartiesProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = "Search parties...",
  className = ""
}) => {
  const [results, setResults] = useState<Party[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cache, setCache] = useState<Map<string, Party[]>>(new Map())
  
  const debouncedSearchTerm = useDebounce(value, 250)

  // Memoized search function with caching
  const searchParties = useCallback(async (searchTerm: string) => {
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

      const res = await axios.get(`/api/parties?q=${encodeURIComponent(searchTerm)}`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        }
      })

      clearTimeout(timeoutId)
      
      const parties = res.data.parties || []
      setResults(parties)
      
      // Cache the results
      setCache(prev => new Map(prev).set(searchTerm, parties))
      
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Search request cancelled')
      } else {
        setError('Failed to search parties. Please try again.')
        console.error('Search error:', err)
      }
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [cache])

  useEffect(() => {
    searchParties(debouncedSearchTerm)
  }, [debouncedSearchTerm, searchParties])

  // Memoized party items for better performance
  const partyItems = useMemo(() => {
    return results.map((party) => (
      <CommandItem
        key={party._id}
        value={party.name}
        onSelect={() => {
          onSelect(party)
          onChange(party.name)
        }}
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
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
            
            <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
              {party.phone && (
                <div className="flex items-center space-x-1">
                  <Phone size={12} />
                  <span>{party.phone}</span>
                </div>
              )}
              
              {party.amount !== undefined && party.amount !== null && (
                <div className="flex items-center space-x-1">
                  <DollarSign size={12} />
                  <span className={party.paid ? 'text-green-600' : 'text-red-600'}>
                    ${party.amount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 ml-2">
          {!party.paid && party.dueDate && (
            <div className="flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400">
              <Calendar size={12} />
              <span>Due</span>
            </div>
          )}
          {party.paid && (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          )}
        </div>
      </CommandItem>
    ))
  }, [results, onSelect, onChange])

  return (
    <div className={`relative ${className}`}>
      <Command className="rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
          <CommandInput
            placeholder={placeholder}
            value={value}
            onValueChange={onChange}
            className="pl-10 pr-10 py-3 text-sm border-0 focus:ring-0 bg-transparent"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 animate-spin" size={16} />
          )}
        </div>

        <CommandList className="max-h-64 overflow-y-auto">
          {error && (
            <div className="flex items-center space-x-2 p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {!error && (
            <>
              <CommandEmpty className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="animate-spin" size={16} />
                    <span>Searching...</span>
                  </div>
                ) : value.trim() ? (
                  <div className="flex flex-col items-center space-y-2">
                    <Search size={24} className="text-slate-300 dark:text-slate-600" />
                    <span>No parties found for "{value}"</span>
                    <span className="text-xs text-slate-400">Try a different search term</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <User size={24} className="text-slate-300 dark:text-slate-600" />
                    <span>Start typing to search parties</span>
                  </div>
                )}
              </CommandEmpty>
              
              {partyItems}
            </>
          )}
        </CommandList>
      </Command>
      
      {results.length > 0 && (
        <div className="absolute right-2 top-2 z-10">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-1 text-xs text-slate-600 dark:text-slate-300">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}