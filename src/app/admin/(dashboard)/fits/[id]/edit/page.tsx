import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import FitForm from '@/components/admin/FitForm'

interface PageProps {
  params: { id: string }
}

export default async function EditFitPage({ params }: PageProps) {
  const supabase = await createSupabaseAdminClient()
  const { data: fit } = await supabase.from('fits').select('*').eq('id', params.id).single()

  if (!fit) notFound()

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-on-surface mb-6">Edit Fit</h1>
      <FitForm mode="edit" initialData={fit} />
    </div>
  )
}
