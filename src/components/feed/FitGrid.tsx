'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useInfiniteQuery } from '@tanstack/react-query'
import type { Fit } from '@/lib/supabase/types'
import { useFilterStore } from '@/store/useFilterStore'
import FitCard from './FitCard'
import { FitCardSkeleton } from '@/components/ui/Skeleton'

const LIMIT = 12

async function fetchFits({
  pageParam = 0,
  vibe,
}: {
  pageParam?: number
  vibe: string
}): Promise<{ data: Fit[]; total: number; offset: number }> {
  const params = new URLSearchParams({
    limit: String(LIMIT),
    offset: String(pageParam),
  })
  if (vibe !== 'All') params.set('vibe', vibe)
  const res = await fetch(`/api/fits?${params}`)
  if (!res.ok) throw new Error('Failed to fetch fits')
  return res.json()
}

interface FitGridProps {
  initialFits?: Fit[]
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

export default function FitGrid({ initialFits }: FitGridProps) {
  const { vibeFilter } = useFilterStore()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['fits', vibeFilter],
    queryFn: ({ pageParam }) => fetchFits({ pageParam: pageParam as number, vibe: vibeFilter }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + LIMIT
      return nextOffset < lastPage.total ? nextOffset : undefined
    },
    initialData: initialFits
      ? {
          pages: [{ data: initialFits, total: initialFits.length, offset: 0 }],
          pageParams: [0],
        }
      : undefined,
    staleTime: 60_000,
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

  if (isLoading && !initialFits) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <FitCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!isLoading && fits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-text-muted">
        <p className="text-lg font-medium">No fits found</p>
        <p className="text-sm mt-1">Try a different vibe filter</p>
      </div>
    )
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {fits.map((fit, i) => (
          <FitCard key={fit.id} fit={fit} index={i} />
        ))}
      </motion.div>

      <div ref={sentinelRef} className="h-8" />

      {isFetchingNextPage && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <FitCardSkeleton key={i} />
          ))}
        </div>
      )}
    </>
  )
}
