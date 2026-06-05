import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import FitsTable from '@/components/admin/FitsTable'

export const dynamic = 'force-dynamic'

async function getAllFits() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('fits')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function AdminFitsPage() {
  const fits = await getAllFits()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Fits</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">{fits.length} total</p>
        </div>
        <Link
          href="/admin/fits/new"
          className="flex items-center gap-2 bg-secondary text-on-secondary font-semibold
            px-4 py-2 rounded-lg hover:bg-secondary-fixed transition-colors text-sm"
        >
          <Plus size={16} />
          New Fit
        </Link>
      </div>
      <FitsTable fits={fits} />
    </div>
  )
}
