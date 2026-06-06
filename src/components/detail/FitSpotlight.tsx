'use client'

import { useState, useRef, useLayoutEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Fit, Pin } from '@/lib/supabase/types'

interface FitSpotlightProps {
  fit: Fit
  pins: Pin[]
  prevId: string | null
  nextId: string | null
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
const rgba = (hex: string, a: number) => {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export default function FitSpotlight({ fit, pins, prevId, nextId }: FitSpotlightProps) {
  const [aspectRatio, setAspectRatio] = useState('3 / 4')

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Top bar */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 pt-[80px] sm:pt-[88px] flex items-center justify-between gap-2">
        <Link href="/fits" className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors flex-shrink-0">
          <ArrowLeft size={16} /> Back to Feed
        </Link>
      </div>

      {/* Prev / Next fit navigation */}
      {prevId && (
        <Link href={`/fits/${prevId}`} aria-label="Previous fit"
          className="fixed left-3 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-surface-container-low/80 backdrop-blur border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-secondary transition-colors">
          <ChevronLeft size={22} />
        </Link>
      )}
      {nextId && (
        <Link href={`/fits/${nextId}`} aria-label="Next fit"
          className="fixed right-3 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-surface-container-low/80 backdrop-blur border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-secondary transition-colors">
          <ChevronRight size={22} />
        </Link>
      )}

      <AttributesView fit={fit} pins={pins} aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} />
    </main>
  )
}

/* ── DESIGN 1 — Attributes: centered hero, click bursts pins, dotted trails to side cards ── */
interface Line { x1: number; y1: number; x2: number; y2: number }

function AttributesView({ fit, pins, aspectRatio, setAspectRatio }: {
  fit: Fit; pins: Pin[]; aspectRatio: string; setAspectRatio: (s: string) => void
}) {
  const GOLD = '#E8C068'
  const [revealed, setRevealed] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [lines, setLines] = useState<Line[]>([])

  const stageRef = useRef<HTMLDivElement>(null)
  const pinRefs = useRef<(HTMLButtonElement | null)[]>([])
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const leftPins = pins.filter((p) => p.x_percent < 50)
  const rightPins = pins.filter((p) => p.x_percent >= 50)

  const measure = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return
    const s = stage.getBoundingClientRect()
    const next: Line[] = []
    pins.forEach((pin, i) => {
      const pinEl = pinRefs.current[i]
      const cardEl = cardRefs.current[i]
      if (!pinEl || !cardEl) return
      const p = pinEl.getBoundingClientRect()
      const c = cardEl.getBoundingClientRect()
      const onLeft = pin.x_percent < 50
      next.push({
        x1: (onLeft ? c.right : c.left) - s.left,
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

  const card = (pin: Pin, side: 'left' | 'right') => {
    const idx = pins.indexOf(pin)
    const isActive = activeId === pin.id
    return (
      <div
        key={pin.id}
        ref={(el) => { cardRefs.current[idx] = el }}
        onMouseEnter={() => setActiveId(pin.id)}
        onMouseLeave={() => setActiveId(null)}
        className={`w-52 bg-surface-container-low/95 backdrop-blur border rounded-xl p-3 transition-all duration-500 ${side === 'left' ? 'text-right' : 'text-left'}`}
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'translateX(0)' : `translateX(${side === 'left' ? '-16px' : '16px'})`,
          transitionDelay: `${idx * 90}ms`,
          borderColor: isActive ? GOLD : 'rgba(255,255,255,0.08)',
          boxShadow: isActive ? `0 0 24px ${rgba(GOLD, 0.2)}` : 'none',
        }}
      >
        <p className="font-label-caps text-[10px] uppercase tracking-widest mb-0.5" style={{ color: GOLD }}>
          Piece {String(idx + 1).padStart(2, '0')}
        </p>
        <p className="font-headline-sm text-headline-sm text-on-surface leading-tight">{pin.product_name}</p>
        {pin.brand && <p className="font-body-sm text-body-sm text-on-surface-variant">{pin.brand}</p>}
        <div className={`flex items-center gap-3 mt-2 ${side === 'left' ? 'justify-end' : 'justify-start'}`}>
          {pin.price != null && <span className="font-medium" style={{ color: GOLD }}>₹{pin.price.toLocaleString('en-IN')}</span>}
          <a href={`/api/track/r?pin=${pin.id}`} target="_blank" rel="noopener noreferrer"
            className="font-label-caps text-label-caps uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: GOLD, color: '#1A1A1A' }}>Shop</a>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="font-display-mobile text-display-mobile text-on-surface">{fit.title}</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          {fit.vibe_tags.map((t) => (
            <span key={t} className="font-label-caps text-label-caps uppercase tracking-widest px-3 py-1 rounded-full border border-outline-variant text-on-surface-variant">{t}</span>
          ))}
        </div>
      </div>

      {/* Stage */}
      <div ref={stageRef} className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-center justify-items-center">
        {/* Dotted connector layer */}
        <svg className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
          {revealed && lines.map((l, i) => (
            <g key={i} style={{ opacity: 0, animation: `fadeIn 400ms ease forwards ${i * 90 + 200}ms` }}>
              <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={rgba(GOLD, 0.6)} strokeWidth={1.5} strokeDasharray="2 4" strokeLinecap="round" />
              <circle cx={l.x1} cy={l.y1} r={3} fill={GOLD} />
              <circle cx={l.x2} cy={l.y2} r={2} fill={GOLD} />
            </g>
          ))}
        </svg>
        <style>{`@keyframes fadeIn { to { opacity: 1 } }`}</style>

        {/* Left rail */}
        <div className="hidden lg:flex flex-col items-end justify-center gap-5 z-20">
          {leftPins.map((p) => card(p, 'left'))}
        </div>

        {/* Center hero image */}
        <div className="relative" style={{ aspectRatio, height: 'min(60vh, 640px)' }}>
          <div className="absolute inset-0 rounded-2xl overflow-hidden bg-surface-container-low"
            style={{ boxShadow: `0 0 80px ${rgba(GOLD, revealed ? 0.2 : 0.08)}` }}>
            <button onClick={() => { setRevealed((r) => !r); if (revealed) setActiveId(null) }} className="block w-full h-full">
              <Image src={fit.image_url} alt={fit.title} fill sizes="(max-width:1024px) 100vw, 45vw"
                className={`object-contain transition-all duration-700 ${revealed ? '' : 'brightness-[0.85]'}`} priority
                onLoad={(e) => {
                  const img = e.currentTarget
                  if (img.naturalWidth && img.naturalHeight) setAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`)
                }} />
              {!revealed && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="font-label-caps text-label-caps uppercase tracking-widest px-5 py-2.5 rounded-full bg-black/55 backdrop-blur text-white flex items-center gap-2 animate-pulse">
                    <span className="material-symbols-outlined text-[18px]">touch_app</span>
                    Tap to reveal the outfit
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Pins — siblings of the clip wrapper so trails aren't clipped */}
          {pins.map((pin, i) => (
            <button key={pin.id} ref={(el) => { pinRefs.current[i] = el }}
              onClick={() => setActiveId(activeId === pin.id ? null : pin.id)}
              onMouseEnter={() => setActiveId(pin.id)} onMouseLeave={() => setActiveId(null)}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${pin.x_percent}%`, top: `${pin.y_percent}%`,
                opacity: revealed ? 1 : 0,
                transform: `translate(-50%,-50%) scale(${revealed ? 1 : 0})`,
                transition: `transform 420ms cubic-bezier(.34,1.56,.64,1) ${i * 90}ms, opacity 300ms ${i * 90}ms`,
              }}>
              <span className="relative flex items-center justify-center">
                <span className="block w-4 h-4 rounded-full border-2 border-white" style={{ background: GOLD, boxShadow: `0 0 0 4px ${rgba(GOLD, 0.3)}` }} />
                <span className="absolute inset-0 rounded-full animate-ping" style={{ background: rgba(GOLD, 0.4) }} />
              </span>
            </button>
          ))}
        </div>

        {/* Right rail */}
        <div className="hidden lg:flex flex-col items-start justify-center gap-5 z-20">
          {rightPins.map((p) => card(p, 'right'))}
        </div>
      </div>

      {/* Mobile list */}
      <div className="lg:hidden mt-6 flex flex-col gap-2">
        {pins.map((pin, i) => (
          <a key={pin.id} href={`/api/track/r?pin=${pin.id}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-surface-container-low border border-outline-variant rounded-lg">
            <span className="font-body-md text-body-md text-on-surface">{i + 1}. {pin.product_name}</span>
            {pin.price != null && <span style={{ color: GOLD }} className="font-medium">₹{pin.price.toLocaleString('en-IN')}</span>}
          </a>
        ))}
      </div>
    </div>
  )
}

