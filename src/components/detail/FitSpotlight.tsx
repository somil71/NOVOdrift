'use client'

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Fit, Pin } from '@/lib/supabase/types'

interface FitSpotlightProps {
  fit: Fit
  pins: Pin[]
  similar: Fit[]
}

// Subtle per-vibe accent fallback (used until/if the image-derived color resolves)
const VIBE_ACCENT: Record<string, string> = {
  Street: '#7C8AA5',
  Minimal: '#C9B79C',
  'Dark Academia': '#9A6B4F',
  Ethnic: '#B5654A',
  Formal: '#6B7A99',
  Casual: '#6FA8A0',
  'Avant-Garde': '#9B7BB8',
  Techwear: '#5FA0B5',
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
const rgba = (hex: string, a: number) => {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

interface Line { x1: number; y1: number; x2: number; y2: number }

export default function FitSpotlight({ fit, pins, similar }: FitSpotlightProps) {
  const [revealed, setRevealed] = useState(false)
  const [activePin, setActivePin] = useState<string | null>(null)
  const [accent, setAccent] = useState<string>(
    VIBE_ACCENT[fit.vibe_tags?.[0] ?? ''] ?? '#E8C068'
  )
  const [lines, setLines] = useState<Line[]>([])

  const stageRef = useRef<HTMLDivElement>(null)
  const pinRefs = useRef<(HTMLButtonElement | null)[]>([])
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  // Split pins into left / right rails by index
  const leftPins = pins.filter((_, i) => i % 2 === 0)
  const rightPins = pins.filter((_, i) => i % 2 === 1)

  // ── Idea 2: derive a dominant accent color from the actual outfit image ──
  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = fit.image_url
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const w = (canvas.width = 40)
        const h = (canvas.height = 50)
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, 0, 0, w, h)
        const { data } = ctx.getImageData(0, 0, w, h)
        let r = 0, g = 0, b = 0, count = 0
        for (let i = 0; i < data.length; i += 4) {
          const cr = data[i], cg = data[i + 1], cb = data[i + 2]
          const max = Math.max(cr, cg, cb), min = Math.min(cr, cg, cb)
          const sat = max - min
          // Skip near-white/near-black/very-grey pixels — keep the garment's hue
          if (max < 35 || min > 225 || sat < 18) continue
          r += cr; g += cg; b += cb; count++
        }
        if (count < 20) return // not enough chromatic signal — keep vibe fallback
        r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count)
        const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
        setAccent(hex)
      } catch {
        /* tainted canvas / CORS — keep the vibe fallback */
      }
    }
  }, [fit.image_url])

  // ── Idea 1: measure connector lines from each pin to its rail card ──
  const measure = useCallback(() => {
    const stage = stageRef.current
    if (!stage) { setLines([]); return }
    const s = stage.getBoundingClientRect()
    const next: Line[] = []
    pins.forEach((pin, i) => {
      const pinEl = pinRefs.current[i]
      const cardEl = cardRefs.current[i]
      if (!pinEl || !cardEl) return
      const p = pinEl.getBoundingClientRect()
      const c = cardEl.getBoundingClientRect()
      const isLeft = i % 2 === 0
      next.push({
        x1: (isLeft ? c.right : c.left) - s.left,
        y1: c.top + c.height / 2 - s.top,
        x2: p.left + p.width / 2 - s.left,
        y2: p.top + p.height / 2 - s.top,
      })
    })
    setLines(next)
  }, [pins])

  useLayoutEffect(() => {
    if (!revealed) { setLines([]); return }
    const id = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', measure) }
  }, [revealed, measure])

  const renderCard = (pin: Pin, globalIndex: number, side: 'left' | 'right') => (
    <div
      key={pin.id}
      ref={(el) => { cardRefs.current[globalIndex] = el }}
      onMouseEnter={() => setActivePin(pin.id)}
      onMouseLeave={() => setActivePin(null)}
      className={`group relative bg-surface-container-low/90 backdrop-blur border rounded-xl p-4 transition-all duration-500 ${
        revealed ? 'opacity-100 translate-x-0' : `opacity-0 ${side === 'left' ? '-translate-x-6' : 'translate-x-6'}`
      } ${side === 'left' ? 'text-right' : 'text-left'}`}
      style={{
        borderColor: activePin === pin.id ? accent : 'var(--tw-outline-variant, #2A2A2A)',
        boxShadow: activePin === pin.id ? `0 0 24px ${rgba(accent, 0.25)}` : 'none',
        transitionDelay: revealed ? `${globalIndex * 90}ms` : '0ms',
      }}
    >
      <p className="font-label-caps text-[10px] uppercase tracking-widest mb-1" style={{ color: accent }}>
        Piece {globalIndex + 1}
      </p>
      <p className="font-headline-sm text-headline-sm text-on-surface leading-tight">{pin.product_name}</p>
      {pin.brand && <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{pin.brand}</p>}
      <div className={`flex items-center gap-3 mt-3 ${side === 'left' ? 'justify-end' : 'justify-start'}`}>
        {pin.price != null && (
          <span className="font-headline-sm text-headline-sm" style={{ color: accent }}>
            ₹{pin.price.toLocaleString('en-IN')}
          </span>
        )}
        <a
          href={`/api/track/r?pin=${pin.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-label-caps text-label-caps uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors"
          style={{ borderColor: rgba(accent, 0.5), color: accent }}
        >
          Shop
        </a>
      </div>
    </div>
  )

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Idea 2: accent glow backdrop that evolves with the outfit */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 35%, ${rgba(accent, revealed ? 0.22 : 0.12)}, transparent 70%)`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-[88px] pb-xxl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/fits" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            <ArrowLeft size={16} /> Back to Feed
          </Link>
          <Link href={`/fits/${fit.id}`} className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors">
            Classic view →
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-display-mobile text-display-mobile text-on-surface">{fit.title}</h1>
          <div className="flex items-center justify-center gap-2 mt-3">
            {fit.vibe_tags.map((tag) => (
              <span key={tag} className="font-label-caps text-label-caps uppercase tracking-widest px-3 py-1 rounded-full border"
                style={{ borderColor: rgba(accent, 0.5), color: accent }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Stage: rails + centered image + connector lines */}
        <div ref={stageRef} className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-10 items-center">
          {/* SVG connector layer (desktop only) */}
          <svg className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
            {revealed && lines.map((l, i) => (
              <g key={i}>
                <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={rgba(accent, 0.5)} strokeWidth={1} strokeDasharray="3 3" />
                <circle cx={l.x1} cy={l.y1} r={3} fill={accent} />
              </g>
            ))}
          </svg>

          {/* Left rail */}
          <div className="hidden lg:flex flex-col justify-center gap-5 z-20">
            {leftPins.map((pin) => renderCard(pin, pins.indexOf(pin), 'left'))}
          </div>

          {/* Center image */}
          <div className="relative mx-auto" style={{ aspectRatio: '3 / 4', height: 'min(70vh, 620px)' }}>
            <button
              onClick={() => setRevealed((r) => !r)}
              className="relative w-full h-full rounded-2xl overflow-hidden block group"
              style={{ boxShadow: `0 0 60px ${rgba(accent, revealed ? 0.3 : 0.15)}` }}
            >
              <Image src={fit.image_url} alt={fit.title} fill sizes="(max-width:1024px) 100vw, 50vw"
                className={`object-cover transition-all duration-700 ${revealed ? '' : 'brightness-90'}`} priority />

              {/* Pins overlaid on the image */}
              {pins.map((pin, i) => (
                <button
                  key={pin.id}
                  ref={(el) => { pinRefs.current[i] = el }}
                  onClick={(e) => { e.stopPropagation(); setActivePin(activePin === pin.id ? null : pin.id) }}
                  onMouseEnter={() => setActivePin(pin.id)}
                  onMouseLeave={() => setActivePin(null)}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500"
                  style={{
                    left: `${pin.x_percent}%`,
                    top: `${pin.y_percent}%`,
                    opacity: revealed ? 1 : 0,
                    transform: `translate(-50%,-50%) scale(${revealed ? 1 : 0})`,
                    transitionDelay: revealed ? `${i * 90}ms` : '0ms',
                  }}
                >
                  <span className="block w-4 h-4 rounded-full border-2 border-white"
                    style={{ background: accent, boxShadow: `0 0 0 4px ${rgba(accent, 0.3)}` }} />
                  {activePin === pin.id && (
                    <span className="absolute inset-0 rounded-full animate-ping" style={{ background: rgba(accent, 0.6) }} />
                  )}
                </button>
              ))}

              {/* Reveal hint */}
              {!revealed && (
                <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none">
                  <span className="font-label-caps text-label-caps uppercase tracking-widest px-4 py-2 rounded-full bg-black/60 backdrop-blur text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">touch_app</span>
                    Tap to reveal the {pins.length} piece{pins.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Right rail */}
          <div className="hidden lg:flex flex-col justify-center gap-5 z-20">
            {rightPins.map((pin) => renderCard(pin, pins.indexOf(pin), 'right'))}
          </div>
        </div>

        {/* Mobile / tablet: simple list under the image (no connector lines) */}
        <div className="lg:hidden mt-8 flex flex-col gap-3">
          {pins.map((pin, i) => (
            <a key={pin.id} href={`/api/track/r?pin=${pin.id}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-surface-container-low border border-outline-variant rounded-lg">
              <div>
                <p className="font-body-md text-body-md text-on-surface">{pin.product_name}</p>
                {pin.brand && <p className="font-body-sm text-body-sm text-on-surface-variant">{pin.brand}</p>}
              </div>
              {pin.price != null && <span style={{ color: accent }} className="font-medium">₹{pin.price.toLocaleString('en-IN')}</span>}
            </a>
          ))}
        </div>

        {/* Idea 3: similar fits to fill the space */}
        {similar.length > 0 && (
          <section className="mt-24">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1" style={{ background: rgba(accent, 0.3) }} />
              <h2 className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                Fits in the same mood
              </h2>
              <span className="h-px flex-1" style={{ background: rgba(accent, 0.3) }} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {similar.map((s) => (
                <Link key={s.id} href={`/fits/${s.id}/spotlight`}
                  className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-outline-variant hover:border-transparent transition-all"
                  style={{ boxShadow: 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 20px ${rgba(accent, 0.3)}`)}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}>
                  <Image src={s.image_url} alt={s.title} fill sizes="200px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="font-body-sm text-body-sm text-white line-clamp-1">{s.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
