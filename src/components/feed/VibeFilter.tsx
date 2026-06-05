'use client'

import { useQuery } from '@tanstack/react-query'
import { useFilterStore, type VibeFilter } from '@/store/useFilterStore'
import { cn } from '@/lib/utils'

async function fetchVibes(): Promise<string[]> {
  const res = await fetch('/api/vibes')
  if (!res.ok) return []
  const json = await res.json()
  return json.data ?? []
}

export default function VibeFilter() {
  const { vibeFilter, setVibeFilter } = useFilterStore()

  const { data: vibes = [] } = useQuery({
    queryKey: ['vibes'],
    queryFn: fetchVibes,
    staleTime: 300_000, // 5 min — matches server revalidate
    gcTime: 600_000,
  })

  const allTabs = ['All', ...vibes]

  return (
    <div className="flex items-center justify-center gap-sm overflow-x-auto pb-sm scrollbar-hide">
      {allTabs.map((vibe) => {
        const active = vibeFilter === vibe
        return (
          <button
            key={vibe}
            onClick={() => setVibeFilter(vibe as VibeFilter)}
            className={cn(
              'flex-shrink-0 px-lg py-xs rounded-full font-label-caps text-label-caps uppercase border transition-colors duration-200 whitespace-nowrap',
              active
                ? 'bg-surface-container-high text-secondary border-secondary'
                : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-secondary hover:text-secondary'
            )}
          >
            {vibe}
          </button>
        )
      })}
    </div>
  )
}
