'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, X } from 'lucide-react'
import type { Fit } from '@/lib/supabase/types'
import { createFitSchema, type CreateFitInput } from '@/lib/validations/fit'
import { VIBE_FILTERS } from '@/store/useFilterStore'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useToast, ToastContainer } from '@/components/ui/Toast'

interface FitFormProps {
  mode: 'create' | 'edit'
  initialData?: Fit
  onSuccess?: (fit: Fit) => void
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket', 'fit-images')
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  const json = await res.json()
  if (!res.ok || json.error) throw new Error(json.error?.message ?? 'Upload failed')
  return json.data.url
}

export default function FitForm({ mode, initialData, onSuccess }: FitFormProps) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [selectedVibes, setSelectedVibes] = useState<string[]>(initialData?.vibe_tags ?? [])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateFitInput>({
    resolver: zodResolver(createFitSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      image_url: initialData?.image_url ?? '',
      vibe_tags: initialData?.vibe_tags ?? [],
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: CreateFitInput) => {
      const url = mode === 'create' ? '/api/fits' : `/api/fits/${initialData!.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error?.message ?? 'Failed to save')
      return json.data as Fit
    },
    onSuccess: (fit) => {
      queryClient.invalidateQueries({ queryKey: ['admin-fits'] })
      toast.success(mode === 'create' ? 'Fit created!' : 'Fit updated!')
      onSuccess?.(fit)
    },
    onError: (err) => {
      toast.error(err.message)
    },
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

  const toggleVibe = (vibe: string) => {
    if (selectedVibes.includes(vibe)) {
      const updated = selectedVibes.filter((v) => v !== vibe)
      setSelectedVibes(updated)
      setValue('vibe_tags', updated)
    } else if (selectedVibes.length >= 5) {
      // Explicit feedback instead of silently dropping the selection
      toast.error('Maximum 5 vibe tags allowed')
    } else {
      const updated = [...selectedVibes, vibe]
      setSelectedVibes(updated)
      setValue('vibe_tags', updated)
    }
  }

  const onSubmit = (data: CreateFitInput) => {
    mutation.mutate({ ...data, vibe_tags: selectedVibes })
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 max-w-lg">
        <Input
          id="title"
          label="Outfit Title *"
          placeholder="e.g. Dark Academia Campus Look"
          error={errors.title?.message}
          {...register('title')}
        />

        {/* Image upload */}
        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-medium text-on-surface-variant">Outfit Image *</label>
          <label className="cursor-pointer">
            {imagePreview ? (
              <div className="relative w-48 aspect-[3/4] rounded-xl overflow-hidden border border-outline-variant group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload size={20} className="text-white" />
                </div>
              </div>
            ) : (
              <div className="w-48 aspect-[3/4] rounded-xl border-2 border-dashed border-outline-variant hover:border-secondary transition-colors flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload size={24} />
                    <span className="text-xs">Upload image</span>
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
          {errors.image_url && <p className="text-xs text-red-400">{errors.image_url.message}</p>}
        </div>

        {/* Vibe tags */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-on-surface-variant">
            Vibe Tags (max 5)
          </label>
          <div className="flex flex-wrap gap-2">
            {VIBE_FILTERS.filter((v) => v !== 'All').map((vibe) => {
              const isSelected = selectedVibes.includes(vibe)
              const isDisabled = !isSelected && selectedVibes.length >= 5
              return (
                <button
                  key={vibe}
                  type="button"
                  onClick={() => toggleVibe(vibe)}
                  disabled={isDisabled}
                  className={`transition-all ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  title={isDisabled ? 'Maximum 5 vibe tags reached' : undefined}
                >
                  <Badge variant={isSelected ? 'gold' : 'default'}>
                    {isSelected && <X size={10} className="inline mr-0.5" />}
                    {vibe}
                  </Badge>
                </button>
              )
            })}
          </div>
        </div>

        <Button
          type="submit"
          loading={mutation.isPending || uploading}
          className="w-fit"
        >
          {mode === 'create' ? 'Create Fit' : 'Save Changes'}
        </Button>
      </form>
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
    </>
  )
}
