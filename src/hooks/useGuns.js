import { useQuery, keepPreviousData } from '@tanstack/react-query'
import gunService from '../services/gunService'

// ---------------------------------------------------------------------------
// useGuns — paginated / filtered product list, CACHED with TanStack Query.
//
// queryKey ['guns', params] => every page/search/filter combination is cached
// separately. Going back to a page you already visited is instant (no request).
// keepPreviousData keeps the old page visible while the next one loads.
//
// Returns { guns, loading, fetching, error, pagination, refetch }.
// ---------------------------------------------------------------------------
export function useGuns(params = {}) {
  const q = useQuery({
    queryKey: ['guns', params],
    queryFn: async () => {
      const response = await gunService.getGuns(params)
      if (!response.success) throw new Error(response.message || 'Failed to fetch products.')
      return response
    },
    placeholderData: keepPreviousData,
  })

  return {
    guns: q.data?.data ?? [],
    pagination: q.data?.pagination ?? null,
    loading: q.isLoading,
    fetching: q.isFetching,
    error: q.error?.message ?? null,
    refetch: q.refetch,
  }
}

// ---------------------------------------------------------------------------
// useGunById — single product (used by the Share Link deep-link too). Cached.
// ---------------------------------------------------------------------------
export function useGunById(id) {
  const q = useQuery({
    queryKey: ['gun', String(id)],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await gunService.getGunById(id)
      if (!response.success) throw new Error(response.message || 'Product not found.')
      return response.data
    },
  })

  return {
    gun: q.data ?? null,
    loading: q.isLoading,
    error: q.error?.message ?? null,
    refetch: q.refetch,
  }
}
