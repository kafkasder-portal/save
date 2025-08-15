import { useState, useCallback, useRef, useEffect } from 'react'
import { useErrorHandler } from './useErrorHandler'
import { log } from '@/utils/logger'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

interface ApiOptions {
  immediate?: boolean
  cacheTime?: number
  retryCount?: number
  retryDelay?: number
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

interface CacheEntry<T> {
  data: T
  timestamp: Date
  expiresAt: Date
}

/**
 * Custom hook for API operations with caching, retry logic, and error handling
 */
export const useApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: ApiOptions = {}
) => {
  const {
    immediate = false,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    retryCount = 3,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  })

  const cache = useRef<Map<string, CacheEntry<T>>>(new Map())
  const abortController = useRef<AbortController | null>(null)
  const retryTimeout = useRef<NodeJS.Timeout | null>(null)

  const { handleApiError } = useErrorHandler({
    context: 'useApi',
    showToast: false // Let the component decide
  })

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort()
      abortController.current = null
    }
    if (retryTimeout.current) {
      clearTimeout(retryTimeout.current)
      retryTimeout.current = null
    }
  }, [])

  // Generate cache key
  const getCacheKey = useCallback((...args: any[]): string => {
    return JSON.stringify(args)
  }, [])

  // Check if cache is valid
  const isCacheValid = useCallback((entry: CacheEntry<T>): boolean => {
    return new Date() < entry.expiresAt
  }, [])

  // Execute API call with retry logic
  const executeApiCall = useCallback(async (
    ...args: any[]
  ): Promise<T> => {
    let lastError: any
    let attempt = 0

    while (attempt <= retryCount) {
      try {
        // Create new abort controller for this attempt
        abortController.current = new AbortController()
        
        // Add signal to args if the API function supports it
        const apiArgs = args.length > 0 && typeof args[args.length - 1] === 'object' && 'signal' in args[args.length - 1]
          ? args
          : [...args, { signal: abortController.current.signal }]

        log.api.call(apiFunction.name || 'unknown', 'GET', args)
        
        const result = await apiFunction(...apiArgs)
        
        log.info(`API call successful: ${apiFunction.name || 'unknown'}`, { args, result })
        
        return result
      } catch (error: any) {
        lastError = error
        
        // Don't retry if aborted
        if (error.name === 'AbortError') {
          throw error
        }

        // Don't retry on client errors (4xx)
        if (error.status >= 400 && error.status < 500) {
          throw error
        }

        attempt++
        
        if (attempt <= retryCount) {
          log.warn(`API call failed, retrying (${attempt}/${retryCount}): ${apiFunction.name || 'unknown'}`, {
            error: error.message,
            attempt,
            retryDelay
          })
          
          // Wait before retry
          await new Promise(resolve => {
            retryTimeout.current = setTimeout(resolve, retryDelay * attempt)
          })
        }
      }
    }

    throw lastError
  }, [apiFunction, retryCount, retryDelay])

  // Main execute function
  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    const cacheKey = getCacheKey(...args)
    
    // Check cache first
    const cachedEntry = cache.current.get(cacheKey)
    if (cachedEntry && isCacheValid(cachedEntry)) {
      setState(prev => ({
        ...prev,
        data: cachedEntry.data,
        lastUpdated: cachedEntry.timestamp
      }))
      return cachedEntry.data
    }

    // Clear previous state
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }))

    try {
      const result = await executeApiCall(...args)
      
      // Cache the result
      const expiresAt = new Date(Date.now() + cacheTime)
      cache.current.set(cacheKey, {
        data: result,
        timestamp: new Date(),
        expiresAt
      })

      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        error: null,
        lastUpdated: new Date()
      }))

      onSuccess?.(result)
      return result
    } catch (error: any) {
      const errorMessage = error.message || 'API call failed'
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))

      handleApiError(error, apiFunction.name || 'unknown', 'GET', errorMessage)
      onError?.(error)
      return null
    }
  }, [apiFunction, cacheTime, getCacheKey, isCacheValid, executeApiCall, onSuccess, onError, handleApiError])

  // Mutate function for POST/PUT/DELETE operations
  const mutate = useCallback(async (
    data: any,
    options: {
      method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH'
      invalidateCache?: boolean
      optimisticUpdate?: (oldData: T | null) => T
    } = {}
  ): Promise<T | null> => {
    const {
      method = 'POST',
      invalidateCache = true,
      optimisticUpdate
    } = options

    // Optimistic update
    if (optimisticUpdate) {
      setState(prev => ({
        ...prev,
        data: optimisticUpdate(prev.data)
      }))
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }))

    try {
      log.api.call(apiFunction.name || 'unknown', method, data)
      
      const result = await apiFunction(data)
      
      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        error: null,
        lastUpdated: new Date()
      }))

      // Invalidate cache if requested
      if (invalidateCache) {
        cache.current.clear()
      }

      onSuccess?.(result)
      return result
    } catch (error: any) {
      const errorMessage = error.message || 'Mutation failed'
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))

      handleApiError(error, apiFunction.name || 'unknown', method, errorMessage)
      onError?.(error)
      return null
    }
  }, [apiFunction, onSuccess, onError, handleApiError])

  // Clear cache
  const clearCache = useCallback(() => {
    cache.current.clear()
  }, [])

  // Refresh data
  const refresh = useCallback(async (...args: any[]): Promise<T | null> => {
    const cacheKey = getCacheKey(...args)
    cache.current.delete(cacheKey)
    return execute(...args)
  }, [execute, getCacheKey])

  // Reset state
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null
    })
    clearCache()
  }, [clearCache])

  // Abort current request
  const abort = useCallback(() => {
    cleanup()
    setState(prev => ({
      ...prev,
      loading: false
    }))
  }, [cleanup])

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute()
    }

    return cleanup
  }, [immediate, execute, cleanup])

  return {
    ...state,
    execute,
    mutate,
    refresh,
    reset,
    abort,
    clearCache
  }
}

/**
 * Hook for simple API calls without caching
 */
export const useSimpleApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<T>
) => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  })

  const { handleApiError } = useErrorHandler({
    context: 'useSimpleApi'
  })

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }))

    try {
      const result = await apiFunction(...args)
      
      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        error: null,
        lastUpdated: new Date()
      }))

      return result
    } catch (error: any) {
      const errorMessage = error.message || 'API call failed'
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))

      handleApiError(error, apiFunction.name || 'unknown', 'GET', errorMessage)
      return null
    }
  }, [apiFunction, handleApiError])

  return {
    ...state,
    execute
  }
}

export default useApi
