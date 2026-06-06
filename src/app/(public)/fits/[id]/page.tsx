import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Fit, Pin } from '@/lib/supabase/types'
import FitDetail from '@/components/detail/FitDetail'
import FitSpotlight from '@/components/detail/FitSpotlight'

export const revalidate = 30

interface PageProps {
  params: { id: string }
  searchParams: { classic?: string }
}

async function getData(id: string): Promise<{
  fit: Fit; pins: Pin[]; similar: Fit[]; prevId: string | null; nextId: string | null
} | null> {
  const supabase = await createSupabaseServerClient()

  const { data: fit } = await supabase
    .from('fits').select('*').eq('id', id).eq('published', true).single()
  if (!fit) return null

  const { data: pins } = await supabase
    .from('pins').select('*').eq('fit_id', id).order('created_at')

  let similar: Fit[] = []
  if (fit.vibe_tags && fit.vibe_tags.length > 0) {
    const { data } = await supabase
      .from('fits').select('*').eq('published', true).neq('id', id)
      .overlaps('vibe_tags', fit.vibe_tags)
      .order('created_at', { ascending: false }).limit(6)
    similar = data ?? []
  }
  if (similar.length < 4) {
    const { data } = await supabase
      .from('fits').select('*').eq('published', true).neq('id', id)
      .order('created_at', { ascending: false }).limit(6)
    const seen = new Set(similar.map((s) => s.id))
    for (const f of data ?? []) {
      if (!seen.has(f.id)) { similar.push(f); seen.add(f.id) }
      if (similar.length >= 6) break
    }
  }

  const [{ data: newer }, { data: older }] = await Promise.all([
    supabase.from('fits').select('id').eq('published', true).gt('created_at', fit.created_at).order('created_at', { ascending: true }).limit(1),
    supabase.from('fits').select('id').eq('published', true).lt('created_at', fit.created_at).order('created_at', { ascending: false }).limit(1),
  ])

  return { fit, pins: pins ?? [], similar, prevId: newer?.[0]?.id ?? null, nextId: older?.[0]?.id ?? null }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = await getData(params.id)
  if (!result) return { title: 'Fit Not Found — FITBOARD' }
  return {
    title: `${result.fit.title} — FITBOARD`,
    description: `Shop every piece from this outfit: ${result.pins.map((p) => p.product_name).join(', ')}`,
    openGraph: { images: [result.fit.image_url], title: result.fit.title, type: 'article' },
  }
}

export default async function FitDetailPage({ params, searchParams }: PageProps) {
  const result = await getData(params.id)
  if (!result) notFound()

  // Classic fallback view (?classic=1)
  if (searchParams.classic) {
    return <FitDetail fit={result.fit} pins={result.pins} />
  }

  // Spotlight is the main experience
  return (
    <FitSpotlight
      fit={result.fit}
      pins={result.pins}
      prevId={result.prevId}
      nextId={result.nextId}
    />
  )
}
