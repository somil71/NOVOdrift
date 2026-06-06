import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import type { Fit, Product } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export default async function AnalyticsPage() {
  const supabase = await createSupabaseAdminClient()

  const [
    { data: userCount },
    { count: totalClicks },
    { count: clicks7d },
    { data: topViewedFits },
    { data: topViewedProducts },
    { data: topSaved },
  ] = await Promise.all([
    supabase.rpc('get_user_count'),
    supabase.from('click_events').select('*', { count: 'exact', head: true }),
    supabase.from('click_events').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    supabase.from('fits').select('id, title, image_url, view_count').eq('published', true)
      .order('view_count', { ascending: false }).limit(6),
    supabase.from('products').select('id, name, image_url, view_count, price').eq('published', true)
      .order('view_count', { ascending: false }).limit(6),
    supabase.rpc('top_saved_fits', { lim: 6 }),
  ])

  const users = (userCount as number) ?? 0
  const fits = (topViewedFits ?? []) as Pick<Fit, 'id' | 'title' | 'image_url' | 'view_count'>[]
  const products = (topViewedProducts ?? []) as Pick<Product, 'id' | 'name' | 'image_url' | 'view_count' | 'price'>[]
  const saved = (topSaved ?? []) as { fit_id: string; title: string; saves: number }[]
  const totalFitViews = fits.reduce((s, f) => s + (f.view_count ?? 0), 0)

  const kpis = [
    { label: 'Registered Users', value: fmt(users), icon: 'group', gold: true },
    { label: 'Total Clicks', value: fmt(totalClicks ?? 0), icon: 'ads_click', gold: false },
    { label: 'Clicks (7d)', value: fmt(clicks7d ?? 0), icon: 'trending_up', gold: false },
    { label: 'Fit Views (top 6)', value: fmt(totalFitViews), icon: 'visibility', gold: false },
  ]

  return (
    <div className="p-4 sm:p-xxl max-w-[1200px] mx-auto">
      <header className="mb-xl">
        <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">Analytics</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          Audience, engagement and what&apos;s performing.
        </p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-lg mb-xxl">
        {kpis.map(({ label, value, icon, gold }) => (
          <div key={label} className={`relative overflow-hidden rounded-xl p-lg flex flex-col justify-between h-[140px] border ${
            gold ? 'bg-gradient-to-br from-secondary/15 to-surface-container-low border-secondary/40'
                 : 'bg-surface-container-low border-outline-variant'}`}>
            <div className="flex justify-between items-start">
              <span className={`font-label-caps text-label-caps uppercase tracking-widest ${gold ? 'text-secondary' : 'text-on-surface-variant'}`}>{label}</span>
              <span className={`material-symbols-outlined text-[20px] ${gold ? 'text-secondary' : 'text-on-surface-variant'} opacity-70`}>{icon}</span>
            </div>
            <div className={`font-display-mobile text-display-mobile ${gold ? 'text-secondary' : 'text-on-surface'}`}>{value}</div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Most viewed fits */}
        <Panel title="Most Viewed Fits" href="/admin/fits">
          {fits.length === 0 ? <Empty text="No views yet." /> : (
            <ul className="divide-y divide-outline-variant/50">
              {fits.map((f, i) => (
                <li key={f.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-5 text-center font-headline-sm text-on-surface-variant opacity-50">{i + 1}</span>
                  <div className="relative w-9 h-12 rounded overflow-hidden bg-surface-container flex-shrink-0">
                    <Image src={f.image_url} alt={f.title} fill sizes="36px" className="object-cover" />
                  </div>
                  <span className="flex-1 min-w-0 font-body-md text-body-md text-on-surface truncate">{f.title}</span>
                  <span className="flex items-center gap-1 text-secondary font-medium">
                    <span className="material-symbols-outlined text-[16px]">visibility</span>{fmt(f.view_count ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Most viewed products */}
        <Panel title="Most Viewed Products" href="/admin/products">
          {products.length === 0 ? <Empty text="No views yet." /> : (
            <ul className="divide-y divide-outline-variant/50">
              {products.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-5 text-center font-headline-sm text-on-surface-variant opacity-50">{i + 1}</span>
                  <div className="relative w-10 h-10 rounded overflow-hidden bg-surface-container flex-shrink-0">
                    {p.image_url && <Image src={p.image_url} alt={p.name} fill sizes="40px" className="object-contain p-0.5" />}
                  </div>
                  <span className="flex-1 min-w-0 font-body-md text-body-md text-on-surface truncate">{p.name}</span>
                  <span className="flex items-center gap-1 text-secondary font-medium">
                    <span className="material-symbols-outlined text-[16px]">visibility</span>{fmt(p.view_count ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Most saved fits */}
        <Panel title="Most Saved Fits (wishlist)" href="/admin/fits">
          {saved.length === 0 ? <Empty text="No saves yet." /> : (
            <ul className="divide-y divide-outline-variant/50">
              {saved.map((s, i) => (
                <li key={s.fit_id} className="flex items-center gap-3 py-2.5">
                  <span className="w-5 text-center font-headline-sm text-on-surface-variant opacity-50">{i + 1}</span>
                  <span className="flex-1 min-w-0 font-body-md text-body-md text-on-surface truncate">{s.title}</span>
                  <span className="flex items-center gap-1 text-secondary font-medium">
                    <span className="material-symbols-outlined text-[16px]">bookmark</span>{fmt(Number(s.saves))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Engagement note */}
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-lg">
          <div className="flex items-center gap-sm mb-3">
            <span className="material-symbols-outlined text-secondary text-[20px]">insights</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Real-time monitoring</h2>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Page-level performance & traffic are captured by Vercel Analytics and Speed Insights
            (visible in your Vercel dashboard). Affiliate clicks, views, saves and user counts
            shown here come from Supabase in real time.
          </p>
          <Link href="https://vercel.com/dashboard" target="_blank"
            className="inline-flex items-center gap-1 mt-4 font-label-caps text-label-caps uppercase tracking-widest text-secondary hover:text-secondary-fixed transition-colors">
            Open Vercel dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}

function Panel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface-container-low border border-outline-variant rounded-xl p-lg">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">{title}</h2>
        <Link href={href} className="font-label-caps text-label-caps uppercase tracking-widest text-secondary hover:text-secondary-fixed transition-colors">View all</Link>
      </div>
      {children}
    </section>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="font-body-md text-body-md text-on-surface-variant py-6 text-center">{text}</p>
}
