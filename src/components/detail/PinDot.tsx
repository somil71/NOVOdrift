'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { Pin } from '@/lib/supabase/types'
import PinTooltip from './PinTooltip'

interface PinDotProps {
  pin: Pin
  index: number
  isActive: boolean
  onActivate: (id: string | null) => void
}

export default function PinDot({ pin, index, isActive, onActivate }: PinDotProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20, delay: index * 0.1 }}
      className="absolute"
      style={{
        left: `${pin.x_percent}%`,
        top: `${pin.y_percent}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isActive ? 20 : 10,
      }}
    >
      {/* White circle with black inner dot — matching Lookbook Pin design */}
      <button
        className="relative w-3 h-3 bg-white rounded-full border border-surface-container flex items-center justify-center animate-pulse hover:scale-150 transition-transform duration-150 cursor-pointer focus:outline-none"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onActivate(isActive ? null : pin.id)
        }}
        aria-label={`Pin: ${pin.product_name}`}
      >
        <div className="w-1.5 h-1.5 bg-black rounded-full" />
      </button>

      <AnimatePresence>{isActive && <PinTooltip pin={pin} />}</AnimatePresence>
    </motion.div>
  )
}
