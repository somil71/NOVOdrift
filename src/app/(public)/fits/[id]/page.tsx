import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Fit, Pin } from '@/lib/supabase/types'
import FitDetail from '@/components/detail/FitDetail'

export const revalidate = 30

interface PageProps {
  params: { id: string }
}

async function getFitWithPins(id: string): Promise<{ fit: Fit; pins: Pin[] } | null> {
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

  return { fit, pins: pins ?? [] }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = await getFitWithPins(params.id)
  if (!result) return { title: 'Fit Not Found — FitBoard' }

  return {
    title: `${result.fit.title} — FitBoard`,
    description: `Shop every piece from this outfit: ${result.pins.map((p) => p.product_name).join(', ')}`,
    openGraph: {
      images: [result.fit.image_url],
      title: result.fit.title,
      type: 'article',
    },
  }
}

export default async function FitDetailPage({ params }: PageProps) {
  const result = await getFitWithPins(params.id)
  if (!result) notFound()

  return (
    <>
      <FitDetail fit={result.fit} pins={result.pins} />
    </>
  )
}
