'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, ShoppingBag } from 'lucide-react'
import type { Product } from '@/lib/supabase/types'
import { createProductSchema, PRODUCT_CATEGORIES, type CreateProductInput } from '@/lib/validations/product'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useToast, ToastContainer } from '@/components/ui/Toast'

interface ProductFormProps {
  mode: 'create' | 'edit'
  initialData?: Product
  onSuccess?: (product: Product) => void
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket', 'product-images')
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  const json = await res.json()
  if (!res.ok || json.error) throw new Error(json.error?.message ?? 'Upload failed')
  return json.data.url
}

export default function ProductForm({ mode, initialData, onSuccess }: ProductFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [imagePreview, setImagePreview] = useState(initialData?.image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [published, setPublished] = useState(initialData?.published ?? false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      brand: initialData?.brand ?? '',
      category: initialData?.category as CreateProductInput['category'] | undefined,
      price: initialData?.price ?? undefined,
      image_url: initialData?.image_url ?? '',
      affiliate_url: initialData?.affiliate_url ?? '',
      tags: initialData?.tags ?? [],
    },
  })

  // Live values for the preview panel
  const liveName = watch('name')
  const liveBrand = watch('brand')
  const liveCategory = watch('category')
  const livePrice = watch('price')

  const mutation = useMutation({
    mutationFn: async (data: CreateProductInput) => {
      const url = mode === 'create' ? '/api/products' : `/api/products/${initialData!.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error?.message ?? 'Failed to save')
      return json.data as Product
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      router.refresh()
      toast.success(mode === 'create' ? 'Product created!' : 'Product updated!')
      onSuccess?.(product)
    },
    onError: (err) => toast.error(err.message),
  })

  const togglePublish = useMutation({
    mutationFn: async (next: boolean) => {
      const res = await fetch(`/api/products/${initialData!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: next }),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error?.message)
      return json.data as Product
    },
    onSuccess: (product) => {
      setPublished(product.published)
      router.refresh()
      toast.success(product.published ? 'Product published — now live on the shop' : 'Product unpublished')
    },
    onError: (err) => toast.error(err.message),
  })

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setImagePreview(url)
      setValue('image_url', url)
    } catch {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* LEFT — form fields */}
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-4">
          <Input
            id="name"
            label="Product Name *"
            placeholder="e.g. Oversized Linen Shirt"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="flex gap-4">
            <Input label="Brand" placeholder="e.g. H&M" className="flex-1" {...register('brand')} />
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[13px] font-medium text-on-surface-variant">Category *</label>
              <select
                className="bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:border-secondary transition-colors"
                {...register('category')}
              >
                <option value="">Select category</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-400">{errors.category.message}</p>}
            </div>
          </div>

          <Input
            label="Price (₹)"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 1999"
            {...register('price', { valueAsNumber: true })}
          />

          {/* Product image */}
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-medium text-on-surface-variant">Product Image</label>
            <label className="cursor-pointer w-fit">
              {imagePreview ? (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-outline-variant bg-surface-container group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-1" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload size={16} className="text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-outline-variant hover:border-secondary transition-colors flex flex-col items-center justify-center gap-1 text-on-surface-variant">
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload size={18} />
                      <span className="text-xs">Upload</span>
                    </>
                  )}
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageChange}
                disabled={uploading}
              />
            </label>
          </div>

          <Input
            label="Affiliate URL *"
            placeholder="https://..."
            error={errors.affiliate_url?.message}
            {...register('affiliate_url')}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={mutation.isPending || uploading}>
              {mode === 'create' ? 'Create Product' : 'Save Changes'}
            </Button>
            {mode === 'edit' && (
              <button
                type="button"
                onClick={() => togglePublish.mutate(!published)}
                disabled={togglePublish.isPending}
                className={`font-label-caps text-label-caps uppercase tracking-widest px-lg py-sm rounded border transition-all disabled:opacity-50 ${
                  published
                    ? 'bg-green-900/40 text-green-400 border-green-700 hover:bg-green-900/60'
                    : 'bg-transparent text-secondary border-outline-variant hover:border-secondary'
                }`}
              >
                {published ? '✓ Published' : 'Publish'}
              </button>
            )}
          </div>
        </form>

        {/* RIGHT — live preview, fills the space */}
        <div className="lg:sticky lg:top-8">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-3">
            Live Preview
          </p>
          <div className="flex flex-col bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden">
            <div className="relative aspect-square w-full bg-surface-container">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="preview" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={32} className="text-on-surface-variant" />
                </div>
              )}
            </div>
            <div className="p-3 flex flex-col gap-2">
              <div>
                <p className="text-sm font-semibold text-on-surface line-clamp-2 leading-tight">
                  {liveName || 'Product name'}
                </p>
                {liveBrand && <p className="text-xs text-on-surface-variant mt-0.5">{liveBrand}</p>}
              </div>
              <div className="flex items-center justify-between">
                {livePrice ? (
                  <p className="text-sm font-medium text-secondary">₹{Number(livePrice).toLocaleString('en-IN')}</p>
                ) : <span className="text-xs text-on-surface-variant">No price</span>}
                {liveCategory && (
                  <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                    {liveCategory}
                  </span>
                )}
              </div>
              <div className="bg-secondary text-on-secondary text-center font-label-caps text-label-caps uppercase tracking-widest py-2 rounded">
                Buy Now
              </div>
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-3">
            {published
              ? 'This product is live on the shop.'
              : 'Draft — not visible to shoppers until published.'}
          </p>
        </div>
      </div>
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
    </>
  )
}
