import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import PinEditor from '@/components/admin/PinEditor'

interface PageProps {
  params: { id: string }
}

export default async function PinsEditorPage({ params }: PageProps) {
  const supabase = await createSupabaseServerClient()

  const { data: fit } = await supabase.from('fits').select('*').eq('id', params.id).single()
  if (!fit) notFound()

  const { data: pins } = await supabase
    .from('pins')
    .select('*')
    .eq('fit_id', params.id)
    .order('created_at')

  return (
    <div className="p-8">
      <Link
        href="/admin/fits"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Fits
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Pin Editor</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">{fit.title}</p>
        </div>
        <Link
          href={`/admin/fits/${fit.id}/edit`}
          className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          Edit metadata →
        </Link>
      </div>

      <PinEditor fitId={fit.id} imageUrl={fit.image_url} initialPins={pins ?? []} />
    </div>
  )
}
