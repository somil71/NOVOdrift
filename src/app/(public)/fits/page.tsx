import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Fit } from '@/lib/supabase/types'
import Navbar from '@/components/ui/Navbar'
import VibeFilter from '@/components/feed/VibeFilter'
import FitGrid from '@/components/feed/FitGrid'

export const revalidate = 60

async function getInitialFits(): Promise<Fit[]> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('fits')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(12)
  return data ?? []
}

export default async function FitFeedPage() {
  const initialFits = await getInitialFits()

  return (
    <>
      <style>{`
        .masonry-grid { column-count: 1; column-gap: 16px; }
        @media (min-width: 768px)  { .masonry-grid { column-count: 2; } }
        @media (min-width: 1024px) { .masonry-grid { column-count: 3; } }
        .masonry-item { break-inside: avoid; margin-bottom: 16px; }
      `}</style>

      <Navbar />

      <main className="pt-huge pb-xxl px-md md:px-lg max-w-7xl mx-auto">
        {/* Hero */}
        <header className="py-xxl md:py-huge text-center flex flex-col items-center">
          <h1 className="font-display text-display-mobile md:text-display text-on-surface max-w-2xl mx-auto mb-sm">
            Wear the look. Own every piece.
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
            Discover highly curated editorial aesthetics. Shop directly from high-fashion lookbooks
            and elevate your personal style with precision-selected pieces.
          </p>
        </header>

        {/* Vibe filters */}
        <div className="mb-xl">
          <VibeFilter />
        </div>

        {/* Feed grid */}
        <FitGrid initialFits={initialFits} />
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-outline-variant mt-xxl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-lg p-xxl max-w-7xl mx-auto">
          <div className="col-span-2 md:col-span-4 mb-lg">
            <span className="font-headline-md text-headline-md text-on-surface">FITBOARD</span>
          </div>
          {[
            { href: '/privacy', label: 'Privacy Policy' },
            { href: '/terms',   label: 'Terms of Service' },
            { href: '/about',   label: 'About' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {label}
            </a>
          ))}
          <div className="col-span-2 md:col-span-4 mt-lg font-body-sm text-body-sm text-on-surface-variant">
            © 2025 FITBOARD. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  )
}
