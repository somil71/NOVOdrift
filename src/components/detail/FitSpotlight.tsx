'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Fit, Pin } from '@/lib/supabase/types'

interface FitSpotlightProps {
  fit: Fit
  pins: Pin[]
  similar: Fit[]
}

const VIBE_ACCENT: Record<string, string> = {
  Street: '#7C8AA5', Minimal: '#C9B79C', 'Dark Academia': '#9A6B4F',
  Ethnic: '#B5654A', Formal: '#6B7A99', Casual: '#6FA8A0',
  'Avant-Garde': '#9B7BB8', Techwear: '#5FA0B5',
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
const rgba = (hex: string, a: number) => {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

type View = 'attributes' | 'themed'

export default function FitSpotlight({ fit, pins, similar }: FitSpotlightProps) {
  const [view, setView] = useState<View>('attributes')
  const [aspectRatio, setAspectRatio] = useState('3 / 4')

  // Themed accent: admin-set first, then per-vibe fallback, then gold.
  const themedAccent = fit.accent_color ?? VIBE_ACCENT[fit.vibe_tags?.[0] ?? ''] ?? '#E8C068'

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Top bar */}
      <div className="relative z-30 max-w-7xl mx-auto px-6 pt-[88px] flex items-center justify-between">
        <Link href="/fits" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
          <ArrowLeft size={16} /> Back to Feed
        </Link>
        <div className="inline-flex bg-surface-container-low border border-outline-variant rounded-full p-1">
          {([['attributes', '① Attributes'], ['themed', '② Themed']] as [View, string][]).map(([v, label]) => (
            <button key={v} onClick={() => setView(v)}
              className={`font-label-caps text-label-caps uppercase tracking-widest px-4 py-2 rounded-full transition-colors ${
                view === v ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:text-on-surface'
              }`}>
              {label}
            </button>
          ))}
        </div>
        <Link href={`/fits/${fit.id}`} className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors hidden sm:block">
          Classic →
        </Link>
      </div>

      {view === 'attributes'
        ? <AttributesView fit={fit} pins={pins} aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} />
        : <ThemedView fit={fit} pins={pins} similar={similar} accent={themedAccent} aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} />}
    </main>
  )
}

/* ─────────────────────────────────────────────────────────────
   DESIGN 1 — Attributes: image is the hero, click bursts the pins,
   stat card floats anchored to the active pin.
   ───────────────────────────────────────────────────────────── */
function AttributesView({ fit, pins, aspectRatio, setAspectRatio }: {
  fit: Fit; pins: Pin[]; aspectRatio: string; setAspectRatio: (s: string) => void
}) {
  const GOLD = '#E8C068'
  const [revealed, setRevealed] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = pins.find((p) => p.id === activeId) ?? null

  return (
    <div
      className="relative min-h-[calc(100vh-88px)] flex items-center justify-center px-6 py-10"
      onClick={() => { setActiveId(null) }}
    >
      {/* HUD: title + tags, top-left */}
      <div className="absolute top-8 left-6 lg:left-10 z-20 max-w-xs pointer-events-none">
        <h1 className="font-display-mobile text-display-mobile text-on-surface leading-none">{fit.title}</h1>
        <div className="flex flex-wrap gap-2 mt-3">
          {fit.vibe_tags.map((t) => (
            <span key={t} className="font-label-caps text-label-caps uppercase tracking-widest px-3 py-1 rounded-full border border-outline-variant text-on-surface-variant">{t}</span>
          ))}
        </div>
      </div>

      {/* HUD: item count, bottom-left */}
      <div className="absolute bottom-8 left-6 lg:left-10 z-20 pointer-events-none">
        <p className="font-headline-lg text-headline-lg" style={{ color: GOLD }}>
          {String(pins.length).padStart(2, '0')}
        </p>
        <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          piece{pins.length !== 1 ? 's' : ''} to shop
        </p>
      </div>

      {/* Centered hero image */}
      <div className="relative" style={{ aspectRatio, height: 'min(74vh, 660px)' }}>
        <button
          onClick={(e) => { e.stopPropagation(); setRevealed((r) => !r); if (revealed) setActiveId(null) }}
          className="relative w-full h-full rounded-2xl overflow-hidden block bg-surface-container-low"
          style={{ boxShadow: `0 0 80px ${rgba(GOLD, revealed ? 0.22 : 0.10)}` }}
        >
          <Image src={fit.image_url} alt={fit.title} fill sizes="(max-width:1024px) 100vw, 55vw"
            className={`object-contain transition-all duration-700 ${revealed ? '' : 'brightness-[0.85]'}`} priority
            onLoad={(e) => {
              const img = e.currentTarget
              if (img.naturalWidth && img.naturalHeight) setAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`)
            }} />

          {/* Reveal hint */}
          {!revealed && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="font-label-caps text-label-caps uppercase tracking-widest px-5 py-2.5 rounded-full bg-black/55 backdrop-blur text-white flex items-center gap-2 animate-pulse">
                <span className="material-symbols-outlined text-[18px]">touch_app</span>
                Tap to reveal the outfit
              </span>
            </div>
          )}

          {/* Pins burst out on reveal */}
          {pins.map((pin, i) => {
            const isActive = activeId === pin.id
            return (
              <button
                key={pin.id}
                onClick={(e) => { e.stopPropagation(); setActiveId(isActive ? null : pin.id) }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${pin.x_percent}%`, top: `${pin.y_percent}%`,
                  opacity: revealed ? 1 : 0,
                  transform: `translate(-50%,-50%) scale(${revealed ? 1 : 0})`,
                  transition: `transform 420ms cubic-bezier(.34,1.56,.64,1) ${i * 80}ms, opacity 300ms ${i * 80}ms`,
                }}
              >
                <span className="relative flex items-center justify-center">
                  <span className="block rounded-full border-2 border-white transition-all"
                    style={{ width: isActive ? 18 : 14, height: isActive ? 18 : 14, background: GOLD, boxShadow: `0 0 0 4px ${rgba(GOLD, 0.3)}` }} />
                  <span className="absolute inset-0 rounded-full animate-ping" style={{ background: rgba(GOLD, 0.5) }} />
                </span>
              </button>
            )
          })}

          {/* Stat card — floats anchored to the active pin's Y, opposite its X side */}
          {active && (() => {
            const onRight = active.x_percent < 50
            return (
              <div
                onClick={(e) => e.stopPropagation()}
                className="hidden lg:block absolute z-30 w-64"
                style={{
                  top: `${Math.min(Math.max(active.y_percent, 18), 82)}%`,
                  [onRight ? 'left' : 'right']: 'calc(100% + 28px)',
                  transform: 'translateY(-50%)',
                } as React.CSSProperties}
              >
                {/* connector line back toward the image edge */}
                <span
                  className="absolute top-1/2 h-px"
                  style={{
                    background: `linear-gradient(${onRight ? 'to left' : 'to right'}, ${rgba(GOLD, 0.7)}, transparent)`,
                    width: 28, [onRight ? 'right' : 'left']: '100%',
                  } as React.CSSProperties}
                />
                <span className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                  style={{ background: GOLD, [onRight ? 'right' : 'left']: 'calc(100% + 26px)' } as React.CSSProperties} />

                <div className="bg-surface-container-low/95 backdrop-blur border border-outline-variant rounded-xl p-4 shadow-2xl"
                  style={{ boxShadow: `0 0 30px ${rgba(GOLD, 0.2)}` }}>
                  <p className="font-label-caps text-[10px] uppercase tracking-widest mb-1" style={{ color: GOLD }}>
                    Piece {String(pins.indexOf(active) + 1).padStart(2, '0')}
                  </p>
                  <p className="font-headline-sm text-headline-sm text-on-surface leading-tight">{active.product_name}</p>
                  {active.brand && <p className="font-body-sm text-body-sm text-on-surface-variant">{active.brand}</p>}
                  <div className="h-px my-3" style={{ background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
                  <div className="flex items-center justify-between">
                    {active.price != null
                      ? <span className="font-headline-sm text-headline-sm" style={{ color: GOLD }}>₹{active.price.toLocaleString('en-IN')}</span>
                      : <span className="text-on-surface-variant text-sm">—</span>}
                    <a href={`/api/track/r?pin=${active.id}`} target="_blank" rel="noopener noreferrer"
                      className="font-label-caps text-label-caps uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors"
                      style={{ background: GOLD, color: '#1A1A1A' }}>
                      Shop →
                    </a>
                  </div>
                </div>
              </div>
            )
          })()}
        </button>
      </div>

      {/* HUD: item list bottom-right (peripheral shortcuts, after reveal) */}
      {revealed && (
        <div className="hidden lg:flex flex-col gap-2 absolute bottom-8 right-6 lg:right-10 z-20 w-56" onClick={(e) => e.stopPropagation()}>
          {pins.map((pin) => (
            <button key={pin.id} onClick={() => setActiveId(activeId === pin.id ? null : pin.id)}
              className="flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all"
              style={{
                borderColor: activeId === pin.id ? GOLD : 'rgba(255,255,255,0.08)',
                background: activeId === pin.id ? rgba(GOLD, 0.1) : 'rgba(255,255,255,0.02)',
              }}>
              <span className="font-body-sm text-body-sm text-on-surface truncate">{pin.product_name}</span>
              {pin.price != null && <span className="font-body-sm text-body-sm flex-shrink-0 ml-2" style={{ color: GOLD }}>₹{pin.price.toLocaleString('en-IN')}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Mobile list */}
      <div className="lg:hidden absolute bottom-4 left-4 right-4 z-20 flex gap-2 overflow-x-auto pb-2" onClick={(e) => e.stopPropagation()}>
        {pins.map((pin) => (
          <a key={pin.id} href={`/api/track/r?pin=${pin.id}`} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
            <p className="font-body-sm text-body-sm text-on-surface whitespace-nowrap">{pin.product_name}</p>
            {pin.price != null && <p className="text-xs" style={{ color: GOLD }}>₹{pin.price.toLocaleString('en-IN')}</p>}
          </a>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   DESIGN 2 — Themed: admin-set accent drives the whole page.
   Central figure with halo, item list, similar fits.
   ───────────────────────────────────────────────────────────── */
function ThemedView({ fit, pins, similar, accent, aspectRatio, setAspectRatio }: {
  fit: Fit; pins: Pin[]; similar: Fit[]; accent: string; aspectRatio: string; setAspectRatio: (s: string) => void
}) {
  const [hoverPin, setHoverPin] = useState<string | null>(null)
  const [simHover, setSimHover] = useState<string | null>(null)

  return (
    <div className="relative">
      {/* Ambient accent auras */}
      <div className="pointer-events-none fixed top-[-120px] right-0 w-[500px] h-[500px] rounded-full" style={{ background: accent, filter: 'blur(120px)', opacity: 0.10 }} />
      <div className="pointer-events-none fixed bottom-[-80px] left-[-60px] w-[320px] h-[320px] rounded-full" style={{ background: accent, filter: 'blur(90px)', opacity: 0.07 }} />

      <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-xxl">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Image with halo + clean accent pins */}
          <div className="w-full lg:w-auto flex justify-center flex-shrink-0">
            <div className="relative" style={{ aspectRatio, height: 'min(68vh, 600px)' }}>
              <div className="absolute -inset-6 rounded-3xl" style={{ background: accent, filter: 'blur(45px)', opacity: 0.35 }} />
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-surface-container-low"
                style={{ border: `1px solid ${rgba(accent, 0.3)}`, boxShadow: `0 0 50px ${rgba(accent, 0.4)}` }}>
                <Image src={fit.image_url} alt={fit.title} fill sizes="(max-width:1024px) 100vw, 45vw"
                  className="object-contain" priority
                  onLoad={(e) => {
                    const img = e.currentTarget
                    if (img.naturalWidth && img.naturalHeight) setAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`)
                  }} />
                {/* Clean accent pins with hover tooltip */}
                {pins.map((pin) => (
                  <div key={pin.id} className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${pin.x_percent}%`, top: `${pin.y_percent}%` }}
                    onMouseEnter={() => setHoverPin(pin.id)} onMouseLeave={() => setHoverPin(null)}>
                    <span className="block w-3.5 h-3.5 rounded-full border-2 border-white cursor-pointer"
                      style={{ background: accent, boxShadow: `0 0 0 4px ${rgba(accent, 0.3)}` }} />
                    {hoverPin === pin.id && (
                      <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-40 bg-surface-container border border-outline-variant rounded-lg p-2.5 shadow-xl z-30">
                        <p className="font-body-sm text-body-sm text-on-surface leading-tight">{pin.product_name}</p>
                        {pin.price != null && <p className="text-xs mt-0.5" style={{ color: accent }}>₹{pin.price.toLocaleString('en-IN')}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info column */}
          <div className="flex-1 min-w-0">
            <h1 className="font-display-mobile text-display-mobile text-on-surface">{fit.title}</h1>
            <div className="flex flex-wrap gap-2 mt-3 mb-5">
              {fit.vibe_tags.map((t) => (
                <span key={t} className="font-label-caps text-label-caps uppercase tracking-widest px-3 py-1 rounded-full border"
                  style={{ borderColor: accent, color: accent }}>{t}</span>
              ))}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
              {pins.length} item{pins.length !== 1 ? 's' : ''} in this outfit · hover the image pins or the list to shop
            </p>

            {/* Item list */}
            <div className="flex flex-col gap-2">
              {pins.map((pin) => (
                <a key={pin.id} href={`/api/track/r?pin=${pin.id}`} target="_blank" rel="noopener noreferrer"
                  onMouseEnter={() => setHoverPin(pin.id)} onMouseLeave={() => setHoverPin(null)}
                  className="flex items-center justify-between p-3 rounded-lg border transition-all"
                  style={{
                    borderColor: hoverPin === pin.id ? rgba(accent, 0.5) : 'rgba(255,255,255,0.07)',
                    background: hoverPin === pin.id ? rgba(accent, 0.1) : 'rgba(255,255,255,0.02)',
                  }}>
                  <div>
                    <p className="font-body-md text-body-md text-on-surface">{pin.product_name}</p>
                    {pin.brand && <p className="font-body-sm text-body-sm text-on-surface-variant">{pin.brand}</p>}
                  </div>
                  <div className="text-right">
                    {pin.price != null && <p className="font-medium" style={{ color: accent }}>₹{pin.price.toLocaleString('en-IN')}</p>}
                    <p className="text-xs text-on-surface-variant">Shop →</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Similar fits */}
        {similar.length > 0 && (
          <section className="mt-20">
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-5">Similar fits</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {similar.map((s) => (
                <Link key={s.id} href={`/fits/${s.id}/spotlight`}
                  onMouseEnter={() => setSimHover(s.id)} onMouseLeave={() => setSimHover(null)}
                  className="group relative aspect-[3/4] rounded-xl overflow-hidden border transition-all"
                  style={{
                    borderColor: simHover === s.id ? rgba(accent, 0.6) : 'rgba(255,255,255,0.06)',
                    transform: simHover === s.id ? 'translateY(-3px)' : 'none',
                    boxShadow: simHover === s.id ? `0 8px 24px ${rgba(accent, 0.3)}` : 'none',
                  }}>
                  <Image src={s.image_url} alt={s.title} fill sizes="200px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="font-body-sm text-body-sm text-white line-clamp-1">{s.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
