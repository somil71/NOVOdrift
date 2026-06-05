'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import type { Product } from '@/lib/supabase/types'
import { PRODUCT_CATEGORIES } from '@/lib/validations/product'
import ProductCard from './ProductCard'
import SearchBar from './SearchBar'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

const LIMIT = 20

async function fetchProducts({
  pageParam = 0,
  search,
  category,
  sort,
}: {
  pageParam?: number
  search: string
  category: string
  sort: string
}): Promise<{ data: Product[]; total: number; offset: number }> {
  const params = new URLSearchParams({
    limit: String(LIMIT),
    offset: String(pageParam),
    sort,
  })
  if (search) params.set('search', search)
  if (category) params.set('category', category)
  const res = await fetch(`/api/products?${params}`)
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

export default function ProductGrid() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const category = searchParams.get('category') ?? ''
  const sort = searchParams.get('sort') ?? 'newest'

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, router, pathname]
  )

  useEffect(() => {
    updateParam('q', debouncedSearch)
  }, [debouncedSearch, updateParam])

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['products', debouncedSearch, category, sort],
    queryFn: ({ pageParam }) =>
      fetchProducts({ pageParam: pageParam as number, search: debouncedSearch, category, sort }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + LIMIT
      return nextOffset < lastPage.total ? nextOffset : undefined
    },
    staleTime: 30_000,
  })

  const products = data?.pages.flatMap((p) => p.data) ?? []

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
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar filters */}
      <aside className="w-full lg:w-56 flex-shrink-0">
        <div className="bg-bg-card border border-border rounded-card p-4 sticky top-32">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Category</h3>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => updateParam('category', '')}
              className={cn(
                'text-left text-sm px-2 py-1.5 rounded transition-colors',
                !category ? 'text-accent-gold' : 'text-text-muted hover:text-text-primary'
              )}
            >
              All
            </button>
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => updateParam('category', category === cat ? '' : cat)}
                className={cn(
                  'text-left text-sm px-2 py-1.5 rounded transition-colors',
                  category === cat ? 'text-accent-gold' : 'text-text-muted hover:text-text-primary'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-text-primary mb-3 mt-6">Sort</h3>
          <div className="flex flex-col gap-1.5">
            {[
              { value: 'newest', label: 'Newest' },
              { value: 'price_asc', label: 'Price: Low to High' },
              { value: 'price_desc', label: 'Price: High to Low' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => updateParam('sort', option.value)}
                className={cn(
                  'text-left text-sm px-2 py-1.5 rounded transition-colors',
                  sort === option.value ? 'text-accent-gold' : 'text-text-muted hover:text-text-primary'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search products..."
          className="mb-6"
        />

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-text-muted">
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div ref={sentinelRef} className="h-8" />

        {isFetchingNextPage && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
