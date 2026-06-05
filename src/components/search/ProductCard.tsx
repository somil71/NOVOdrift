'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import type { Product } from '@/lib/supabase/types'
import Button from '@/components/ui/Button'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const handleBuy = () => {
    window.open(product.affiliate_url, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-col bg-bg-card border border-border rounded-card overflow-hidden
        hover:border-accent-gold hover:shadow-[0_4px_20px_rgba(232,192,104,0.15)]
        transition-[border-color,box-shadow] duration-200"
    >
      {/* Product image */}
      <div className="relative aspect-square w-full bg-bg-surface">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={32} className="text-text-muted" />
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-sm font-semibold text-text-primary line-clamp-2 leading-tight">
            {product.name}
          </p>
          {product.brand && (
            <p className="text-xs text-text-muted mt-0.5">{product.brand}</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto">
          {product.price != null ? (
            <p className="text-sm font-medium text-accent-gold">
              ₹{product.price.toLocaleString('en-IN')}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-text-muted bg-bg-surface px-2 py-0.5 rounded-full">
            {product.category}
          </span>
        </div>
        <Button size="sm" className="w-full" onClick={handleBuy}>
          Buy Now
        </Button>
      </div>
    </motion.div>
  )
}
