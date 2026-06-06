'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Trash2, MapPin, Eye, EyeOff } from 'lucide-react'
import type { Fit } from '@/lib/supabase/types'
import Badge from '@/components/ui/Badge'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

interface FitsTableProps {
  fits: Fit[]
}

export default function FitsTable({ fits }: FitsTableProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const res = await fetch(`/api/fits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published }),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error?.message)
      return json.data as Fit
    },
    onSuccess: (fit) => {
      queryClient.invalidateQueries({ queryKey: ['admin-fits'] })
      router.refresh()
      toast.success(fit.published ? 'Fit published' : 'Fit unpublished')
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteFit = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/fits/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error?.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-fits'] })
      router.refresh()
      toast.success('Fit deleted')
      setDeletingId(null)
    },
    onError: (err) => toast.error(err.message),
  })

  if (fits.length === 0) {
    return (
      <div className="text-center py-16 text-on-surface-variant">
        <p className="text-lg font-medium">No fits yet</p>
        <p className="text-sm mt-1">Create your first fit to get started</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-outline-variant">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container">
              <th className="text-left px-4 py-3 text-on-surface-variant font-medium">Title</th>
              <th className="text-left px-4 py-3 text-on-surface-variant font-medium">Vibes</th>
              <th className="text-left px-4 py-3 text-on-surface-variant font-medium">Status</th>
              <th className="text-left px-4 py-3 text-on-surface-variant font-medium">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {fits.map((fit) => (
              <tr key={fit.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container/50">
                <td className="px-4 py-3 text-on-surface font-medium">{fit.title}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {fit.vibe_tags.map((tag) => (
                      <Badge key={tag} variant="default">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      fit.published
                        ? 'bg-green-900/40 text-green-400 border border-green-700/50'
                        : 'bg-surface-container text-on-surface-variant border border-outline-variant'
                    )}
                  >
                    {fit.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-on-surface-variant">
                  {new Date(fit.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => togglePublish.mutate({ id: fit.id, published: !fit.published })}
                      className="text-on-surface-variant hover:text-on-surface transition-colors"
                      title={fit.published ? 'Unpublish' : 'Publish'}
                    >
                      {fit.published ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <Link
                      href={`/admin/fits/${fit.id}/pins`}
                      className="text-on-surface-variant hover:text-secondary transition-colors"
                      title="Edit pins"
                    >
                      <MapPin size={16} />
                    </Link>
                    <Link
                      href={`/admin/fits/${fit.id}/edit`}
                      className="text-on-surface-variant hover:text-on-surface transition-colors"
                      title="Edit fit"
                    >
                      <Edit2 size={16} />
                    </Link>
                    {deletingId === fit.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => deleteFit.mutate(fit.id)}
                          className="text-xs text-red-400 hover:text-red-300 font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="text-xs text-on-surface-variant hover:text-on-surface"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(fit.id)}
                        className="text-on-surface-variant hover:text-red-400 transition-colors"
                        title="Delete fit"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
    </>
  )
}
