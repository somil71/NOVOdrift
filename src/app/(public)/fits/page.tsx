import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Fit } from '@/lib/supabase/types'
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
  )
}
