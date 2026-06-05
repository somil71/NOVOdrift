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
      <Navbar />
      <VibeFilter />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <FitGrid initialFits={initialFits} />
      </main>
    </>
  )
}
