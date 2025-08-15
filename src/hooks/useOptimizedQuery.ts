import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useOptimizedQuery<T>(
  key: string,
  query: string,
  options?: { 
    enabled?: boolean
    limit?: number
    staleTime?: number
    gcTime?: number
  }
) {
  return useQuery({
    queryKey: [key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(query)
        .select('*')
        .limit(options?.limit || 100) // Pagination için limit
      
      if (error) throw error
      return data as T
    },
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 dakika cache
    gcTime: options?.gcTime || 10 * 60 * 1000, // 10 dakika cache (eski cacheTime)
    enabled: options?.enabled !== false,
    retry: 3,
    refetchOnWindowFocus: false
  })
}

// Pagination için optimize edilmiş hook
export function usePaginatedQuery<T>(
  key: string,
  query: string,
  page: number = 1,
  pageSize: number = 20,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [key, page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      
      const { data, error, count } = await supabase
        .from(query)
        .select('*', { count: 'exact' })
        .range(from, to)
      
      if (error) throw error
      return { data: data as T[], count: count || 0 }
    },
    staleTime: 2 * 60 * 1000, // 2 dakika cache
    gcTime: 5 * 60 * 1000, // 5 dakika cache
    enabled: options?.enabled !== false
  })
}
