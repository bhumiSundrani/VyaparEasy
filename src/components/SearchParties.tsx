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
import { Search, User, Building2, Phone, Calendar, DollarSign, Loader2, AlertCircle, Plus, UserPlus } from "lucide-react"

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
  onCreateParty?: (name: string) => Promise<Party> | Party
  placeholder?: string
  className?: string
  allowCreate?: boolean
  defaultPartyType?: 'customer' | 'vendor'
}

export const SelectParties: React.FC<SelectPartiesProps> = ({
  value,
  onChange,
  onSelect,
  onCreateParty,
  placeholder = "Search parties...",
  className = "",
  allowCreate = true,
  defaultPartyType = 'customer'
}) => {
  const [results, setResults] = useState<Party[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cache, setCache] = useState<Map<string, Party[]>>(new Map())
  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>('') // Track current search
  
  const debouncedSearchTerm = useDebounce(value, 250)

  // Memoized search function with caching
  const searchParties = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([])
      setCurrentSearchTerm('')
      return
    }

    // Update current search term
    setCurrentSearchTerm(searchTerm)

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

      const res = await axios.get(`/api/parties?q=${encodeURIComponent(searchTerm)}`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        }
      })

      clearTimeout(timeoutId)
      
      // Only update results if this is still the current search
      if (searchTerm === currentSearchTerm) {
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
        if (searchTerm === currentSearchTerm) {
          setError('Failed to search parties. Please try again.')
          setResults([])
        }
        console.error('Search error:', err)
      }
    } finally {
      // Only update loading state if this is still the current search
      if (searchTerm === currentSearchTerm) {
        setIsLoading(false)
      }
    }
  }, [cache, currentSearchTerm])

  useEffect(() => {
    searchParties(debouncedSearchTerm)
  }, [debouncedSearchTerm, searchParties])

  // Default create party function if none provided
  const defaultCreateParty = useCallback(async (name: string): Promise<Party> => {
    try {
      const response = await axios.post('/api/parties', {
        name: name.trim(),
        type: defaultPartyType,
        phone: '',
      })
      return response.data.party
    } catch (error) {
      console.error('Error creating party:', error)
      throw new Error('Failed to create party')
    }
  }, [defaultPartyType])

  // Handle creating a new party
  const handleCreateParty = useCallback(async (name: string) => {
    if (!name.trim() || isCreating) return

    setIsCreating(true)
    setError(null)

    try {
      const createFunction = onCreateParty || defaultCreateParty
      const newParty = await createFunction(name.trim())
      
      // Clear cache to ensure fresh results
      setCache(new Map())
      
      // Select the newly created party
      onSelect(newParty)
      onChange(newParty.name)
      
      // Refresh search results to include the new party
      setTimeout(() => {
        searchParties(debouncedSearchTerm)
      }, 100)
      
    } catch (err) {
      setError('Failed to create party. Please try again.')
      console.error('Create party error:', err)
    } finally {
      setIsCreating(false)
    }
  }, [onCreateParty, defaultCreateParty, onSelect, onChange, debouncedSearchTerm, searchParties, isCreating])

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
            
            {(party.phone || (party.amount !== undefined && party.amount !== null)) && (
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
            )}
          </div>
        </div>

        <div className="flex-shrink-0 ml-2">
          {!party.paid && party.dueDate && (
            <div className="flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
              <Calendar size={12} />
              <span>Due</span>
            </div>
          )}
          {party.paid && (
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
          )}
        </div>
      </CommandItem>
    ))
  }, [results, onSelect, onChange])

  // Calculate if we should show the results count badge
  const shouldShowResultsCount = useMemo(() => {
    return results.length > 0 && 
           !isLoading && 
           !isCreating && 
           currentSearchTerm.trim() !== '' &&
           currentSearchTerm === debouncedSearchTerm // Only show when search is complete
  }, [results.length, isLoading, isCreating, currentSearchTerm, debouncedSearchTerm])

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
            disabled={isCreating}
          />
          {(isLoading || isCreating) && (
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

                {/* Show creating state */}
                {isCreating && (
                  <div className="flex items-center justify-center space-x-2 p-4 text-blue-600 dark:text-blue-400">
                    <Loader2 className="animate-spin" size={16} />
                    <span className="text-sm">Creating party...</span>
                  </div>
                )}

                {/* Show results when available */}
                {results.length > 0 && !isLoading && !isCreating && partyItems}

                {/* Show "no results" message and create option */}
                {!isLoading && !isCreating && results.length === 0 && value.trim() && (
                  <>
                    <div className="flex flex-col items-center space-y-2 p-4 text-slate-500 dark:text-slate-400">
                      <Search size={20} className="text-slate-300 dark:text-slate-600" />
                      <span className="text-sm">No parties found for &quot;{value.trim()}&quot;</span>
                    </div>
                    
                    {/* Create new party option */}
                    {allowCreate && (
                      <CommandItem
                        key="create-new"
                        value={`create-${value}`}
                        onSelect={() => handleCreateParty(value)}
                        className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-blue-25 dark:from-blue-950/30 dark:to-blue-900/20"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm">
                          <Plus size={16} />
                        </div>
                        
                        <UserPlus size={16} className="text-blue-500" />
                      </CommandItem>
                    )}
                  </>
                )}
              </>
            )}
          </CommandList>
        )}
      </Command>
      
      {/* Show results count badge with improved logic */}
      {/* {shouldShowResultsCount && (
        <div className="absolute right-2 top-2 z-10">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-1 text-xs text-slate-600 dark:text-slate-300 shadow-sm">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </div>
        </div>
      )} */}
    </div>
  )
}