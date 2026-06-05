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
  const params = new URLSearchParams({ limit: String(LIMIT), offset: String(pageParam) })
  if (vibe !== 'All') params.set('vibe', vibe)
  const res = await fetch(`/api/fits?${params}`)
  if (!res.ok) throw new Error('Failed to fetch fits')
  return res.json()
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

interface FitGridProps {
  initialFits?: Fit[]
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
      ? { pages: [{ data: initialFits, total: initialFits.length, offset: 0 }], pageParams: [0] }
      : undefined,
    staleTime: 60_000,
  })

  const fits = data?.pages.flatMap((p) => p.data) ?? []

  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
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
      <div className="masonry-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="masonry-item">
            <FitCardSkeleton />
          </div>
        ))}
      </div>
    )
  }

  if (!isLoading && fits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-xxl text-on-surface-variant">
        <p className="font-headline-sm text-headline-sm">No fits found</p>
        <p className="font-body-md text-body-md mt-xs">Try a different vibe filter</p>
      </div>
    )
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="masonry-grid"
      >
        {fits.map((fit, i) => (
          <FitCard key={fit.id} fit={fit} index={i} />
        ))}
      </motion.div>

      <div ref={sentinelRef} className="h-md" />

      {isFetchingNextPage && (
        <div className="masonry-grid mt-md">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="masonry-item">
              <FitCardSkeleton />
            </div>
          ))}
        </div>
      )}
    </>
  )
}
