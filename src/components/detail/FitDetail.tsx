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
  // Default to 3/4 until the image loads, then snap to its true ratio so nothing crops
  const [aspectRatio, setAspectRatio] = useState('3 / 4')

  const handleActivate = (id: string | null) => {
    setActivePinId(id)
  }

  // Close active pin when clicking the image background
  const handleImageClick = () => {
    setActivePinId(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back link + spotlight view toggle */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/fits"
            className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Feed
          </Link>
          <Link
            href={`/fits/${fit.id}/spotlight`}
            className="inline-flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-secondary hover:text-secondary-fixed transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            Spotlight view
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:items-start">
          {/* Image with pins — height-capped, pins NOT clipped so tooltips show fully */}
          <div className="w-full lg:w-auto flex justify-center lg:justify-start flex-shrink-0">
            <div
              className="relative"
              style={{ aspectRatio, height: 'min(82vh, 760px)', maxWidth: '100%' }}
              onClick={handleImageClick}
            >
              {/* Image wrapper clips only the image to rounded corners */}
              <div className="absolute inset-0 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
                <Image
                  src={fit.image_url}
                  alt={fit.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                  priority
                  onLoad={(e) => {
                    const img = e.currentTarget
                    if (img.naturalWidth && img.naturalHeight) {
                      setAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`)
                    }
                  }}
                />
              </div>

              {/* Pin dots — siblings of the clipping wrapper, so tooltips overflow freely */}
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
          </div>

          {/* Right panel — capped width so product cards don't stretch across the screen */}
          <div className="flex-1 max-w-xl flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold text-on-surface">{fit.title}</h1>
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

            <p className="text-sm text-on-surface-variant">
              {pins.length} item{pins.length !== 1 ? 's' : ''} in this outfit. Hover over the pins to shop.
            </p>

            {/* Product list fallback */}
            <div className="flex flex-col gap-3">
              {pins.map((pin) => (
                <a
                  key={pin.id}
                  href={`/api/track/r?pin=${pin.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-surface-container-low border border-outline-variant rounded-lg
                    hover:border-secondary transition-colors duration-200"
                >
                  <div>
                    <p className="text-sm font-medium text-on-surface">{pin.product_name}</p>
                    {pin.brand && <p className="text-xs text-on-surface-variant">{pin.brand}</p>}
                  </div>
                  <div className="text-right">
                    {pin.price != null && (
                      <p className="text-sm text-secondary font-medium">
                        ₹{pin.price.toLocaleString('en-IN')}
                      </p>
                    )}
                    <p className="text-xs text-on-surface-variant">Shop →</p>
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
