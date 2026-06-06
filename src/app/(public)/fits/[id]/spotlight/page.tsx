import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Fit, Pin } from '@/lib/supabase/types'
import FitSpotlight from '@/components/detail/FitSpotlight'

export const revalidate = 30

interface PageProps {
  params: { id: string }
}

async function getData(id: string): Promise<{ fit: Fit; pins: Pin[]; similar: Fit[]; prevId: string | null; nextId: string | null } | null> {
  const supabase = await createSupabaseServerClient()

  const { data: fit } = await supabase
    .from('fits')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (!fit) return null

  const { data: pins } = await supabase
    .from('pins')
    .select('*')
    .eq('fit_id', id)
    .order('created_at')

  // Neighboring fits in feed order (created_at DESC). prev = newer, next = older.
  const [{ data: newer }, { data: older }] = await Promise.all([
    supabase.from('fits').select('id').eq('published', true).gt('created_at', fit.created_at).order('created_at', { ascending: true }).limit(1),
    supabase.from('fits').select('id').eq('published', true).lt('created_at', fit.created_at).order('created_at', { ascending: false }).limit(1),
  ])
  const prevId = newer?.[0]?.id ?? null
  const nextId = older?.[0]?.id ?? null

  // Similar fits — share at least one vibe tag, exclude self
  let similar: Fit[] = []
  if (fit.vibe_tags && fit.vibe_tags.length > 0) {
    const { data } = await supabase
      .from('fits')
      .select('*')
      .eq('published', true)
      .neq('id', id)
      .overlaps('vibe_tags', fit.vibe_tags)
      .order('created_at', { ascending: false })
      .limit(6)
    similar = data ?? []
  }
  // Fallback: if not enough by vibe, top up with recent fits
  if (similar.length < 4) {
    const { data } = await supabase
      .from('fits')
      .select('*')
      .eq('published', true)
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(6)
    const seen = new Set(similar.map((s) => s.id))
    for (const f of data ?? []) {
      if (!seen.has(f.id)) { similar.push(f); seen.add(f.id) }
      if (similar.length >= 6) break
    }
  }

  return { fit, pins: pins ?? [], similar, prevId, nextId }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = await getData(params.id)
  if (!result) return { title: 'Fit Not Found — FITBOARD' }
  return {
    title: `${result.fit.title} — Spotlight — FITBOARD`,
    description: `Explore this outfit piece by piece.`,
  }
}

export default async function FitSpotlightPage({ params }: PageProps) {
  const result = await getData(params.id)
  if (!result) notFound()

  return <FitSpotlight fit={result.fit} pins={result.pins} similar={result.similar} prevId={result.prevId} nextId={result.nextId} />
}
