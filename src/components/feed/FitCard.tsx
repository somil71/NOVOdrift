'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Fit } from '@/lib/supabase/types'
import Badge from '@/components/ui/Badge'

interface FitCardProps {
  fit: Fit
  index: number
}

export default function FitCard({ fit, index }: FitCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
      }}
    >
      <Link href={`/fits/${fit.id}`} className="block group">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-card border border-border bg-bg-card
            group-hover:border-accent-gold group-hover:shadow-[0_0_12px_rgba(232,192,104,0.2)]
            transition-[border-color,box-shadow] duration-200"
        >
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={fit.image_url}
              alt={fit.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover"
              priority={index < 3}
            />
            {/* Bottom gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-4">
              <p className="text-sm font-semibold text-text-primary line-clamp-1">{fit.title}</p>
              {fit.vibe_tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {fit.vibe_tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="gold" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}
