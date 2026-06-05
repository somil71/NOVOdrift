import { NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createSupabaseServiceClient()

    const [
      { count: totalFits },
      { count: publishedFits },
      { count: totalProducts },
      { count: totalPins },
      { count: totalClicks },
      { count: clicks24h },
      { count: clicks7d },
      { data: topFits },
      { data: recentClicks },
      { data: draftFits },
    ] = await Promise.all([
      supabase.from('fits').select('*', { count: 'exact', head: true }),
      supabase.from('fits').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('pins').select('*', { count: 'exact', head: true }),
      supabase.from('click_events').select('*', { count: 'exact', head: true }),
      supabase
        .from('click_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from('click_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      // Top 5 fits by click count
      supabase
        .from('click_events')
        .select('fit_id')
        .not('fit_id', 'is', null)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      // 10 most recent click events
      supabase
        .from('click_events')
        .select('id, type, fit_id, pin_id, product_id, destination_url, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
      // Unpublished fits (drafts)
      supabase
        .from('fits')
        .select('id, title, vibe_tags, created_at')
        .eq('published', false)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    // Aggregate top fits from click events
    const fitClickMap: Record<string, number> = {}
    for (const row of (topFits ?? [])) {
      if (row.fit_id) fitClickMap[row.fit_id] = (fitClickMap[row.fit_id] ?? 0) + 1
    }
    const topFitIds = Object.entries(fitClickMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, clicks]) => ({ fit_id: id, clicks }))

    // Fetch fit titles for top fits
    let topFitsWithTitles: { fit_id: string; title: string; clicks: number }[] = []
    if (topFitIds.length > 0) {
      const { data: fitRows } = await supabase
        .from('fits')
        .select('id, title')
        .in('id', topFitIds.map((f) => f.fit_id))
      topFitsWithTitles = topFitIds.map((f) => ({
        ...f,
        title: fitRows?.find((r) => r.id === f.fit_id)?.title ?? 'Unknown',
      }))
    }

    return NextResponse.json({
      data: {
        stats: {
          totalFits: totalFits ?? 0,
          publishedFits: publishedFits ?? 0,
          totalProducts: totalProducts ?? 0,
          totalPins: totalPins ?? 0,
          totalClicks: totalClicks ?? 0,
          clicks24h: clicks24h ?? 0,
          clicks7d: clicks7d ?? 0,
        },
        topFits: topFitsWithTitles,
        recentClicks: recentClicks ?? [],
        draftFits: draftFits ?? [],
      },
      error: null,
    })
  } catch (err) {
    console.error('[GET /api/analytics/summary]', err)
    return NextResponse.json(
      { data: null, error: { message: 'Failed to fetch analytics', code: 'SERVER_ERROR' } },
      { status: 500 }
    )
  }
}
