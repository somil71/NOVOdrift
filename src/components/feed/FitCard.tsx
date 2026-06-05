'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Fit } from '@/lib/supabase/types'

interface FitCardProps {
  fit: Fit & { pin_count?: number }
  index: number
}

export default function FitCard({ fit, index }: FitCardProps) {
  return (
    <motion.div
      className="masonry-item"
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
      }}
    >
      <Link href={`/fits/${fit.id}`} className="block group">
        <div className="bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden group-hover:border-secondary transition-colors duration-300 relative cursor-pointer">
          <div className="relative w-full overflow-hidden bg-surface-container" style={{ aspectRatio: '3/4' }}>
            {/* Subtle dark overlay that lifts on hover */}
            <div className="absolute inset-0 bg-black/10 z-10 group-hover:bg-transparent transition-colors duration-300" />

            <Image
              src={fit.image_url}
              alt={fit.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              priority={index < 3}
            />

            {/* Lookbook pin indicator */}
            <div className="absolute top-[40%] left-[60%] z-20 w-3 h-3 bg-white rounded-full border border-surface-container flex items-center justify-center animate-pulse">
              <div className="w-1.5 h-1.5 bg-black rounded-full" />
            </div>
          </div>

          <div className="p-sm flex justify-between items-center bg-surface-container-low">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">{fit.title}</h3>
              {fit.vibe_tags.length > 0 && (
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {fit.vibe_tags[0]}
                </p>
              )}
            </div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary transition-colors duration-200">
              arrow_outward
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
