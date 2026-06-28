import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Fit } from '@/lib/supabase/types'

export const revalidate = 300

export default async function LandingPage() {
  const supabase = await createSupabaseServerClient()
  const [fitsRes, countRes] = await Promise.all([
    supabase.from('fits').select('id, title, image_url').eq('published', true).order('created_at', { ascending: false }).limit(14),
    supabase.from('fits').select('*', { count: 'exact', head: true }).eq('published', true),
  ])

  const fits = (fitsRes.data ?? []) as Pick<Fit, 'id' | 'title' | 'image_url'>[]
  const fitCount = countRes.count ?? 0
  const enterHref = '/fits'

  // Split images into two marquee columns
  const colA = fits.filter((_, i) => i % 2 === 0)
  const colB = fits.filter((_, i) => i % 2 === 1)
  const hasImages = fits.length > 0

  return (
    <main className="relative bg-background text-on-surface">
      {/* ── Top bar ── */}
      <header className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-5 sm:px-10 py-5">
        <span className="font-headline-sm text-headline-sm tracking-[3px] uppercase">FITBOARD</span>
        <Link href="/fits" className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-colors">
          Enter →
        </Link>
      </header>

      {/* ── HERO: editorial split ── */}
      <section className="relative grid lg:grid-cols-[1.05fr_0.95fr] min-h-screen">
        {/* Left — type */}
        <div className="relative z-10 flex flex-col justify-center px-6 sm:px-10 lg:px-16 pt-28 pb-16 lg:py-0">
          <div className="flex items-center gap-3 mb-8">
            <span className="h-px w-10 bg-secondary" />
            <span className="font-label-caps text-label-caps uppercase tracking-[3px] text-secondary">Est. 2026 — Curated Lookbook</span>
          </div>

          <h1 className="font-display text-[15vw] leading-[0.92] sm:text-[84px] lg:text-[92px] tracking-tight">
            Wear the<br />
            <span className="italic text-secondary">look.</span> Own<br />
            every piece.
          </h1>

          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-8 leading-relaxed">
            Not a store. Not a feed. A shoppable editorial of hand-styled outfits —
            tap any look to reveal the exact pieces and shop them in a click.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-10">
            <Link href={enterHref}
              className="group inline-flex items-center justify-center gap-2 bg-secondary text-on-secondary font-label-caps text-label-caps uppercase tracking-widest px-8 py-4 rounded-lg hover:bg-secondary-fixed transition-all hover:shadow-[0_0_28px_rgba(232,192,104,0.4)]">
              Enter FITBOARD
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </Link>
          </div>

          {/* stat row */}
          <div className="flex items-center gap-8 mt-12">
            <div>
              <p className="font-headline-md text-headline-md text-on-surface">{fitCount}+</p>
              <p className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">Curated fits</p>
            </div>
            <span className="h-8 w-px bg-outline-variant" />
            <div>
              <p className="font-headline-md text-headline-md text-on-surface">1-tap</p>
              <p className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">Shop the look</p>
            </div>
            <span className="h-8 w-px bg-outline-variant" />
            <div>
              <p className="font-headline-md text-headline-md text-on-surface">Weekly</p>
              <p className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">New drops</p>
            </div>
          </div>
        </div>

        {/* Right — animated image columns */}
        <div className="relative hidden lg:block overflow-hidden border-l border-outline-variant/40">
          {hasImages ? (
            <>
              <div className="absolute inset-0 grid grid-cols-2 gap-3 p-3">
                <div className="flex flex-col gap-3 animate-[scrollUp_38s_linear_infinite]">
                  {[...colA, ...colA].map((f, i) => (
                    <div key={`a-${i}`} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden">
                      <Image src={f.image_url} alt={f.title} fill sizes="25vw" className="object-cover" priority={i === 0} />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3 animate-[scrollDown_44s_linear_infinite] -mt-24">
                  {[...colB, ...colB].map((f, i) => (
                    <div key={`b-${i}`} className="relative w-full aspect-[3/4] rounded-lg overflow-hidden">
                      <Image src={f.image_url} alt={f.title} fill sizes="25vw" className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
              {/* edge fades */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant/30">
              <span className="material-symbols-outlined text-[80px]">styler</span>
            </div>
          )}
        </div>
      </section>

      {/* mobile image strip (since marquee is desktop-only) */}
      {hasImages && (
        <div className="lg:hidden flex gap-3 overflow-x-auto px-5 pb-2 -mt-6 scrollbar-hide">
          {fits.slice(0, 8).map((f) => (
            <div key={f.id} className="relative flex-shrink-0 w-32 aspect-[3/4] rounded-lg overflow-hidden">
              <Image src={f.image_url} alt={f.title} fill sizes="128px" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="px-6 sm:px-10 lg:px-16 py-24 border-t border-outline-variant/40">
        <div className="flex items-center gap-3 mb-12">
          <span className="font-label-caps text-label-caps uppercase tracking-[3px] text-secondary">How it works</span>
          <span className="h-px flex-1 bg-outline-variant/40" />
        </div>
        <div className="grid sm:grid-cols-3 gap-10">
          {[
            { n: '01', t: 'Browse the edit', d: 'Scroll a curated feed of editorial outfits, filtered by your aesthetic.' },
            { n: '02', t: 'Reveal the pieces', d: 'Tap any look — interactive pins burst out, each tied to a real product.' },
            { n: '03', t: 'Shop in one tap', d: 'Hit buy and go straight to the retailer. The whole outfit, piece by piece.' },
          ].map((s) => (
            <div key={s.n}>
              <p className="font-display text-[44px] leading-none text-secondary/30">{s.n}</p>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mt-4">{s.t}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-6 sm:px-10 lg:px-16 py-24 border-t border-outline-variant/40 flex flex-col items-start gap-6">
        <h2 className="font-display text-[40px] sm:text-[56px] leading-[1] max-w-2xl">
          Your next outfit is one tap away.
        </h2>
        <Link href={enterHref}
          className="inline-flex items-center gap-2 bg-secondary text-on-secondary font-label-caps text-label-caps uppercase tracking-widest px-8 py-4 rounded-lg hover:bg-secondary-fixed transition-all hover:shadow-[0_0_28px_rgba(232,192,104,0.4)]">
          Enter FITBOARD
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 sm:px-10 lg:px-16 py-8 border-t border-outline-variant/40">
        <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 FITBOARD. Wear the look. Own every piece.</p>
        <div className="flex gap-6">
          <Link href="/about" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">About</Link>
          <Link href="/terms" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">Terms</Link>
          <Link href="/privacy" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">Privacy</Link>
        </div>
      </footer>

      {/* marquee keyframes */}
      <style>{`
        @keyframes scrollUp { from { transform: translateY(0) } to { transform: translateY(-50%) } }
        @keyframes scrollDown { from { transform: translateY(-50%) } to { transform: translateY(0) } }
      `}</style>
    </main>
  )
}
