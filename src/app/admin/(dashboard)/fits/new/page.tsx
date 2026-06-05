'use client'

import { useRouter } from 'next/navigation'
import type { Fit } from '@/lib/supabase/types'
import FitForm from '@/components/admin/FitForm'

export default function NewFitPage() {
  const router = useRouter()

  const handleSuccess = (fit: Fit) => {
    router.push(`/admin/fits/${fit.id}/pins`)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">New Fit</h1>
      <FitForm mode="create" onSuccess={handleSuccess} />
    </div>
  )
}
