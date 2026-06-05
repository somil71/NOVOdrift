import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { VIBE_FILTERS } from '@/lib/constants'

// force-dynamic: this route uses cookies() via createSupabaseServerClient.
// Cannot combine revalidate with dynamic cookie access in Next.js 14 —
// background ISR has no request context and cookies() throws.
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .rpc('get_distinct_vibes' as never)
      .select()

    // Fallback: if RPC doesn't exist yet, query directly
    if (error) {
      const { data: fits } = await supabase
        .from('fits')
        .select('vibe_tags')
        .eq('published', true)

      const vibeSet = new Set<string>()
      for (const fit of fits ?? []) {
        for (const tag of fit.vibe_tags ?? []) {
          vibeSet.add(tag)
        }
      }

      // Sort: put VIBE_FILTERS order first, then any extras alphabetically
      const knownOrder = VIBE_FILTERS.filter((v) => v !== 'All')
      const ordered = [
        ...knownOrder.filter((v) => vibeSet.has(v)),
        ...Array.from(vibeSet).filter((v) => !knownOrder.includes(v as never)).sort(),
      ]

      return NextResponse.json({ data: ordered, error: null })
    }

    return NextResponse.json({ data: data ?? [], error: null })
  } catch (err) {
    console.error('[GET /api/vibes]', err)
    // Fallback to static list if query fails
    return NextResponse.json({ data: VIBE_FILTERS.filter((v) => v !== 'All'), error: null })
  }
}
