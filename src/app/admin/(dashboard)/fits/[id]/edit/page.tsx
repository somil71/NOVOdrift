import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import FitForm from '@/components/admin/FitForm'

interface PageProps {
  params: { id: string }
}

export default async function EditFitPage({ params }: PageProps) {
  const supabase = await createSupabaseServerClient()
  const { data: fit } = await supabase.from('fits').select('*').eq('id', params.id).single()

  if (!fit) notFound()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Edit Fit</h1>
      <FitForm mode="edit" initialData={fit} />
    </div>
  )
}
