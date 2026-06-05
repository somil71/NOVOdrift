'use client'

import { useFilterStore, VIBE_FILTERS, type VibeFilter } from '@/store/useFilterStore'
import { cn } from '@/lib/utils'

export default function VibeFilter() {
  const { vibeFilter, setVibeFilter } = useFilterStore()

  return (
    <div className="flex items-center justify-center gap-sm overflow-x-auto pb-sm scrollbar-hide">
      {VIBE_FILTERS.map((vibe) => {
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
