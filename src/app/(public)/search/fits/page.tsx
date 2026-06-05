'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import type { Fit } from '@/lib/supabase/types'
import SearchBar from '@/components/search/SearchBar'
import FitCard from '@/components/feed/FitCard'
import { FitCardSkeleton } from '@/components/ui/Skeleton'

const LIMIT = 12

async function searchFits({
  pageParam = 0,
  search,
}: {
  pageParam?: number
  search: string
}): Promise<{ data: Fit[]; total: number; offset: number }> {
  const params = new URLSearchParams({
    limit: String(LIMIT),
    offset: String(pageParam),
  })
  if (search) params.set('search', search)
  const res = await fetch(`/api/fits?${params}`)
  if (!res.ok) throw new Error('Failed to search fits')
  return res.json()
}

export default function SearchFitsPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['fits', 'search', debouncedSearch],
    queryFn: ({ pageParam }) =>
      searchFits({ pageParam: pageParam as number, search: debouncedSearch }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + LIMIT
      return nextOffset < lastPage.total ? nextOffset : undefined
    },
    staleTime: 10_000,
    gcTime: 120_000,
    enabled: debouncedSearch.length > 0,
  })

  const fits = data?.pages.flatMap((p) => p.data) ?? []

  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(onIntersect, { rootMargin: '200px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [onIntersect])

  return (
    <>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-on-surface mb-6">Search Fits</h1>

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by outfit name, vibe, or product..."
          className="mb-8"
        />

        {!debouncedSearch && (
          <p className="text-on-surface-variant text-sm text-center py-12">
            Type something to search across all fits and their products
          </p>
        )}

        {isLoading && debouncedSearch && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <FitCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && debouncedSearch && fits.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <p className="text-lg font-medium">No fits found for &quot;{debouncedSearch}&quot;</p>
          </div>
        )}

        {fits.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fits.map((fit, i) => (
              <FitCard key={fit.id} fit={fit} index={i} />
            ))}
          </div>
        )}

        <div ref={sentinelRef} className="h-8" />

        {isFetchingNextPage && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <FitCardSkeleton key={i} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
