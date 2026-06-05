'use client'

import { motion } from 'framer-motion'
import type { Pin } from '@/lib/supabase/types'
import Button from '@/components/ui/Button'

interface PinTooltipProps {
  pin: Pin
}

export default function PinTooltip({ pin }: PinTooltipProps) {
  const handleShopNow = () => {
    window.open(pin.affiliate_url, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="absolute z-20 bg-bg-card border border-border rounded-card shadow-xl p-3"
      style={{ width: 200, bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Arrow pointing down */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border" />

      <p className="text-sm font-semibold text-text-primary line-clamp-2 leading-tight">
        {pin.product_name}
      </p>
      {pin.brand && <p className="text-xs text-text-muted mt-0.5">{pin.brand}</p>}
      {pin.price != null && (
        <p className="text-[13px] text-accent-gold font-medium mt-1">
          ₹{pin.price.toLocaleString('en-IN')}
        </p>
      )}
      <Button size="sm" className="w-full mt-2" onClick={handleShopNow}>
        Shop Now
      </Button>
    </motion.div>
  )
}
