import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface AnalyticsSummary {
  stats: {
    totalFits: number
    publishedFits: number
    totalProducts: number
    totalPins: number
    totalClicks: number
    clicks24h: number
    clicks7d: number
  }
  topFits: { fit_id: string; title: string; clicks: number }[]
  draftFits: { id: string; title: string; vibe_tags: string[]; created_at: string }[]
}

async function getDashboardData(): Promise<AnalyticsSummary> {
  const supabase = await createSupabaseAdminClient()

  const [
    { count: totalFits },
    { count: publishedFits },
    { count: totalProducts },
    { count: totalPins },
    { count: totalClicks },
    { count: clicks24h },
    { count: clicks7d },
    { data: rawTopFits },
    { data: draftFits },
  ] = await Promise.all([
    supabase.from('fits').select('*', { count: 'exact', head: true }),
    supabase.from('fits').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('pins').select('*', { count: 'exact', head: true }),
    supabase.from('click_events').select('*', { count: 'exact', head: true }),
    supabase.from('click_events').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
    supabase.from('click_events').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    supabase.from('click_events').select('fit_id')
      .not('fit_id', 'is', null)
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    supabase.from('fits').select('id, title, vibe_tags, created_at')
      .eq('published', false).order('created_at', { ascending: false }).limit(5),
  ])

  const fitClickMap: Record<string, number> = {}
  for (const row of (rawTopFits ?? [])) {
    if (row.fit_id) fitClickMap[row.fit_id] = (fitClickMap[row.fit_id] ?? 0) + 1
  }
  const topFitIds = Object.entries(fitClickMap).sort(([, a], [, b]) => b - a).slice(0, 5)
  let topFits: { fit_id: string; title: string; clicks: number }[] = []
  if (topFitIds.length > 0) {
    const { data: fitRows } = await supabase.from('fits').select('id, title')
      .in('id', topFitIds.map(([id]) => id))
    topFits = topFitIds.map(([id, clicks]) => ({
      fit_id: id, clicks,
      title: fitRows?.find((r) => r.id === id)?.title ?? 'Unknown',
    }))
  }

  return {
    stats: {
      totalFits: totalFits ?? 0, publishedFits: publishedFits ?? 0,
      totalProducts: totalProducts ?? 0, totalPins: totalPins ?? 0,
      totalClicks: totalClicks ?? 0, clicks24h: clicks24h ?? 0, clicks7d: clicks7d ?? 0,
    },
    topFits,
    draftFits: draftFits ?? [],
  }
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export default async function AdminDashboardPage() {
  const { stats, topFits, draftFits } = await getDashboardData()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const statCards = [
    { label: 'Published Fits',  value: fmt(stats.publishedFits),  icon: 'style',        gold: false },
    { label: 'Products',        value: fmt(stats.totalProducts),  icon: 'shopping_bag', gold: false },
    { label: 'Active Pins',     value: fmt(stats.totalPins),      icon: 'push_pin',     gold: false },
    { label: 'Clicks (24h)',    value: fmt(stats.clicks24h),      icon: 'ads_click',    gold: true  },
  ]

  return (
    <div className="p-xxl max-w-[1200px] mx-auto">
      {/* Header */}
      <header className="flex justify-between items-end mb-xxl">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
            {greeting}, Admin
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Here is an overview of the platform&apos;s current state.
          </p>
        </div>
        <div className="flex gap-md">
          <Link
            href="/admin/fits/new"
            className="bg-secondary text-on-secondary font-label-caps text-label-caps uppercase px-lg py-sm rounded border border-secondary hover:bg-secondary-fixed transition-colors duration-200 flex items-center gap-xs tracking-widest"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Fit
          </Link>
          <Link
            href="/admin/fits"
            className="bg-transparent text-secondary border border-outline-variant hover:border-secondary font-label-caps text-label-caps uppercase px-lg py-sm rounded transition-colors duration-200 tracking-widest"
          >
            All Fits
          </Link>
        </div>
      </header>

      {/* Stats — single balanced grid, primary KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-lg mb-lg">
        {statCards.map(({ label, value, icon, gold }) => (
          <div
            key={label}
            className={`relative overflow-hidden rounded-xl p-lg flex flex-col justify-between h-[150px] border transition-all duration-300 hover:-translate-y-0.5 ${
              gold
                ? 'bg-gradient-to-br from-secondary/15 to-surface-container-low border-secondary/40'
                : 'bg-surface-container-low border-outline-variant hover:border-outline'
            }`}
          >
            <div className="flex justify-between items-start">
              <span className={`font-label-caps text-label-caps uppercase tracking-widest ${gold ? 'text-secondary' : 'text-on-surface-variant'}`}>
                {label}
              </span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${gold ? 'bg-secondary/20' : 'bg-surface-container-high'}`}>
                <span className={`material-symbols-outlined text-[18px] ${gold ? 'text-secondary' : 'text-on-surface-variant'}`}>{icon}</span>
              </div>
            </div>
            <div className={`font-display-mobile text-display-mobile ${gold ? 'text-secondary' : 'text-on-surface'}`}>
              {value}
            </div>
          </div>
        ))}
      </section>

      {/* Secondary KPIs — inline strip */}
      <div className="flex flex-wrap gap-x-xxl gap-y-md bg-surface-container-low border border-outline-variant rounded-xl px-lg py-md mb-xxl">
        {[
          { label: 'Total Fits', value: stats.totalFits, icon: 'style' },
          { label: 'Clicks (7d)', value: stats.clicks7d, icon: 'trending_up' },
          { label: 'All-Time Clicks', value: stats.totalClicks, icon: 'ads_click' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant opacity-60">{icon}</span>
            <div>
              <p className="font-headline-sm text-headline-sm text-on-surface leading-none">{fmt(value)}</p>
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main content split */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Top fits by CTR */}
        <div className="lg:col-span-2 bg-surface-container-low border border-outline-variant rounded-xl flex flex-col">
          <div className="p-lg border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Top Fits (7 days)</h3>
            <Link href="/admin/fits" className="font-label-caps text-label-caps text-secondary hover:text-secondary-fixed transition-colors uppercase tracking-widest">
              View All
            </Link>
          </div>
          {topFits.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-xl">
              <p className="font-body-md text-body-md text-on-surface-variant text-center">
                No clicks yet. Share your fits to start tracking.
              </p>
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-outline-variant">
              {topFits.map((fit, i) => (
                <li key={fit.fit_id} className="p-lg flex items-center gap-lg hover:bg-surface-container-lowest transition-colors">
                  <span className="font-headline-sm text-headline-sm text-on-surface-variant w-6 text-center opacity-50">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-body-md text-on-surface truncate">{fit.title}</p>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-secondary text-[16px]">ads_click</span>
                    <span className="font-headline-sm text-headline-sm text-secondary">{fmt(fit.clicks)}</span>
                  </div>
                  <Link
                    href={`/fits/${fit.fit_id}`}
                    className="text-on-surface-variant hover:text-secondary transition-colors"
                    target="_blank"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pending Drafts */}
        <div className="bg-surface-container-low border border-outline-variant rounded-xl flex flex-col">
          <div className="p-lg border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Pending Drafts</h3>
            <span className="font-label-caps text-label-caps text-on-surface-variant">{draftFits.length}</span>
          </div>
          {draftFits.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-xl">
              <p className="font-body-md text-body-md text-on-surface-variant text-center">
                No drafts. All fits are published.
              </p>
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-outline-variant overflow-y-auto">
              {draftFits.map((fit) => (
                <li key={fit.id} className="p-lg hover:bg-surface-container-lowest transition-colors">
                  <p className="font-body-md text-body-md text-on-surface truncate">{fit.title}</p>
                  <div className="flex items-center justify-between mt-xs">
                    <span className="font-label-caps text-label-caps text-on-surface-variant">
                      {fit.vibe_tags[0] ?? 'No vibe'}
                    </span>
                    <Link
                      href={`/admin/fits/${fit.id}/pins`}
                      className="font-label-caps text-label-caps text-secondary hover:text-secondary-fixed transition-colors uppercase tracking-widest"
                    >
                      Edit →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="p-lg border-t border-outline-variant">
            <Link
              href="/admin/fits/new"
              className="w-full bg-surface-container-high text-on-surface border border-outline-variant font-label-caps text-label-caps uppercase px-lg py-sm rounded hover:border-secondary hover:text-secondary transition-colors duration-200 flex items-center justify-center gap-xs tracking-widest"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Fit
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
