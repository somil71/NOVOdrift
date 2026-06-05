'use client'

import { motion } from 'framer-motion'
import { useFilterStore, VIBE_FILTERS, type VibeFilter } from '@/store/useFilterStore'
import { cn } from '@/lib/utils'

export default function VibeFilter() {
  const { vibeFilter, setVibeFilter } = useFilterStore()

  return (
    <div className="sticky top-14 z-30 bg-bg-primary/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
          {VIBE_FILTERS.map((vibe) => (
            <button
              key={vibe}
              onClick={() => setVibeFilter(vibe as VibeFilter)}
              className={cn(
                'relative flex-shrink-0 px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200',
                vibeFilter === vibe
                  ? 'text-accent-gold'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              {vibe}
              {vibeFilter === vibe && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent-gold rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
