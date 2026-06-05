'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Trash2, Eye, EyeOff, ShoppingBag } from 'lucide-react'
import type { Product } from '@/lib/supabase/types'
import Badge from '@/components/ui/Badge'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

interface ProductsTableProps {
  products: Product[]
}

export default function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published }),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error?.message)
      return json.data as Product
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      router.refresh()
      toast.success(product.published ? 'Product published' : 'Product unpublished')
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error?.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      router.refresh()
      toast.success('Product deleted')
      setDeletingId(null)
    },
    onError: (err) => toast.error(err.message),
  })

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-on-surface-variant">
        <p className="text-lg font-medium">No products yet</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-outline-variant">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container">
              <th className="text-left px-4 py-3 text-on-surface-variant font-medium">Product</th>
              <th className="text-left px-4 py-3 text-on-surface-variant font-medium">Category</th>
              <th className="text-left px-4 py-3 text-on-surface-variant font-medium">Price</th>
              <th className="text-left px-4 py-3 text-on-surface-variant font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-outline-variant last:border-0 hover:bg-surface-container/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-surface-container border border-outline-variant flex-shrink-0 overflow-hidden relative">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag size={14} className="text-on-surface-variant" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">{product.name}</p>
                      {product.brand && (
                        <p className="text-xs text-on-surface-variant">{product.brand}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="default">{product.category}</Badge>
                </td>
                <td className="px-4 py-3 text-on-surface-variant">
                  {product.price != null ? `₹${product.price.toLocaleString('en-IN')}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      product.published
                        ? 'bg-green-900/40 text-green-400 border border-green-700/50'
                        : 'bg-surface-container text-on-surface-variant border border-outline-variant'
                    )}
                  >
                    {product.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() =>
                        togglePublish.mutate({ id: product.id, published: !product.published })
                      }
                      className="text-on-surface-variant hover:text-on-surface transition-colors"
                      title={product.published ? 'Unpublish' : 'Publish'}
                    >
                      {product.published ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      <Edit2 size={16} />
                    </Link>
                    {deletingId === product.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => deleteProduct.mutate(product.id)}
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
                        onClick={() => setDeletingId(product.id)}
                        className="text-on-surface-variant hover:text-red-400 transition-colors"
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
