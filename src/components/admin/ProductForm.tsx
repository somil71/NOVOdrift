'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload } from 'lucide-react'
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
  const queryClient = useQueryClient()
  const toast = useToast()
  const [imagePreview, setImagePreview] = useState(initialData?.image_url ?? '')
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
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

  const mutation = useMutation({
    mutationFn: async (data: CreateProductInput) => {
      const url =
        mode === 'create' ? '/api/products' : `/api/products/${initialData!.id}`
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
      toast.success(mode === 'create' ? 'Product created!' : 'Product updated!')
      onSuccess?.(product)
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
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="flex flex-col gap-4 max-w-lg">
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
            <label className="text-[13px] font-medium text-text-muted">Category *</label>
            <select
              className="bg-bg-surface border border-border rounded-button px-3 py-2 text-text-primary text-sm
                focus:outline-none focus:border-accent-gold transition-colors"
              {...register('category')}
            >
              <option value="">Select category</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
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
          <label className="text-[13px] font-medium text-text-muted">Product Image</label>
          <label className="cursor-pointer w-fit">
            {imagePreview ? (
              <div className="relative w-32 h-32 rounded-card overflow-hidden border border-border group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload size={16} className="text-white" />
                </div>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-card border-2 border-dashed border-border hover:border-accent-gold transition-colors flex flex-col items-center justify-center gap-1 text-text-muted">
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
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

        <Button type="submit" loading={mutation.isPending || uploading} className="w-fit">
          {mode === 'create' ? 'Create Product' : 'Save Changes'}
        </Button>
      </form>
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
    </>
  )
}
