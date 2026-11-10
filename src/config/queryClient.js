import { QueryClient } from '@tanstack/react-query'

// ---------------------------------------------------------------------------
// QUERY CACHING
// - staleTime : for 5 minutes cached data is "fresh" -> no network request.
// - gcTime    : unused cache entries stay in memory for 30 minutes.
// - Each distinct queryKey (e.g. ['guns', {page:2,...}]) has its own cache entry.
// - After create / edit / delete we call invalidateQueries(['guns']) so the
//   list is refetched and never shows stale data.
// ---------------------------------------------------------------------------
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
