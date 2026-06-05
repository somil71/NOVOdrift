'use client'

import { motion } from 'framer-motion'
import type { Pin } from '@/lib/supabase/types'

interface PinTooltipProps { pin: Pin }

export default function PinTooltip({ pin }: PinTooltipProps) {
  const handleShopNow = () => {
    window.open(`/api/track/r?pin=${pin.id}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="absolute z-20 bg-surface-container-low border border-outline-variant rounded-lg shadow-xl p-sm"
      style={{ width: 200, bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-outline-variant" />

      <p className="font-headline-sm text-headline-sm text-on-surface line-clamp-2 leading-tight">
        {pin.product_name}
      </p>
      {pin.brand && (
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{pin.brand}</p>
      )}
      {pin.price != null && (
        <p className="font-body-md text-body-md text-secondary mt-xs">
          ₹{pin.price.toLocaleString('en-IN')}
        </p>
      )}
      <button
        onClick={handleShopNow}
        className="w-full mt-sm bg-secondary text-on-secondary hover:bg-secondary-fixed font-label-caps text-label-caps uppercase rounded py-xs px-md transition-all duration-200 tracking-wider"
      >
        Shop Now
      </button>
    </motion.div>
  )
}
