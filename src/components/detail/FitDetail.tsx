'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Fit, Pin } from '@/lib/supabase/types'
import PinDot from './PinDot'
import Badge from '@/components/ui/Badge'

interface FitDetailProps {
  fit: Fit
  pins: Pin[]
}

export default function FitDetail({ fit, pins }: FitDetailProps) {
  const [activePinId, setActivePinId] = useState<string | null>(null)

  const handleActivate = (id: string | null) => {
    setActivePinId(id)
  }

  // Close active pin when clicking the image background
  const handleImageClick = () => {
    setActivePinId(null)
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back link */}
        <Link
          href="/fits"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Feed
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image with pins */}
          <div
            className="relative w-full lg:w-[60%] overflow-hidden rounded-card border border-border bg-bg-card"
            style={{ aspectRatio: '3/4', maxHeight: '80vh' }}
            onClick={handleImageClick}
          >
            <Image
              src={fit.image_url}
              alt={fit.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
              priority
            />

            {/* Pin dots */}
            {pins.map((pin, i) => (
              <PinDot
                key={pin.id}
                pin={pin}
                index={i}
                isActive={activePinId === pin.id}
                onActivate={handleActivate}
              />
            ))}
          </div>

          {/* Right panel */}
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{fit.title}</h1>
              {fit.vibe_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {fit.vibe_tags.map((tag) => (
                    <Badge key={tag} variant="gold">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <p className="text-sm text-text-muted">
              {pins.length} item{pins.length !== 1 ? 's' : ''} in this outfit. Hover over the pins to shop.
            </p>

            {/* Product list fallback */}
            <div className="flex flex-col gap-3">
              {pins.map((pin) => (
                <a
                  key={pin.id}
                  href={pin.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-bg-card border border-border rounded-button
                    hover:border-accent-gold transition-colors duration-200"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">{pin.product_name}</p>
                    {pin.brand && <p className="text-xs text-text-muted">{pin.brand}</p>}
                  </div>
                  <div className="text-right">
                    {pin.price != null && (
                      <p className="text-sm text-accent-gold font-medium">
                        ₹{pin.price.toLocaleString('en-IN')}
                      </p>
                    )}
                    <p className="text-xs text-text-muted">Shop →</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
