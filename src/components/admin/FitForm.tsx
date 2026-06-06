'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [selectedVibes, setSelectedVibes] = useState<string[]>(initialData?.vibe_tags ?? [])
  const [accentColor, setAccentColor] = useState<string>(initialData?.accent_color ?? '#E8C068')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
      router.refresh()
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
    mutation.mutate({ ...data, vibe_tags: selectedVibes, accent_color: accentColor })
  }

  const liveTitle = watch('title')

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
              <div className="relative w-48 aspect-[3/4] rounded-xl overflow-hidden border border-outline-variant bg-surface-container group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-1" />
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

        {/* Accent colour — drives the Themed spotlight view */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-on-surface-variant">
            Accent Colour
          </label>
          <p className="text-xs text-on-surface-variant/70 -mt-1">
            Pick a tone from the outfit (e.g. the jacket). Themes the fit&apos;s spotlight page.
          </p>
          <div className="flex items-center gap-3">
            {['#E8C068', '#B5682A', '#7C8AA5', '#9A6B4F', '#6B7A99', '#6FA8A0', '#9B7BB8', '#B5654A'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAccentColor(c)}
                className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                style={{ background: c, borderColor: accentColor === c ? '#fff' : 'transparent' }}
                aria-label={`Accent ${c}`}
              />
            ))}
            <span className="w-px h-6 bg-outline-variant mx-1" />
            <label className="relative cursor-pointer" title="Custom colour">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-7 h-7"
              />
              <span className="w-7 h-7 rounded-full border-2 border-outline-variant flex items-center justify-center" style={{ background: accentColor }}>
                <span className="material-symbols-outlined text-[14px] text-white mix-blend-difference">colorize</span>
              </span>
            </label>
            <span className="font-mono text-xs text-on-surface-variant ml-1">{accentColor}</span>
          </div>
        </div>

        <Button
          type="submit"
          loading={mutation.isPending || uploading}
          className="w-fit"
        >
          {mode === 'create' ? 'Create Fit & Add Pins' : 'Save Changes'}
        </Button>
      </form>

      {/* Live preview — mirrors the public feed card */}
      <div className="lg:sticky lg:top-8">
        <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-3">
          Feed Card Preview
        </p>
        <div className="bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden">
          <div className="relative w-full bg-surface-container" style={{ aspectRatio: '3/4' }}>
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                <Upload size={28} className="opacity-40" />
              </div>
            )}
            <div className="absolute top-[40%] left-[60%] z-20 w-3 h-3 bg-white rounded-full border border-surface-container flex items-center justify-center animate-pulse">
              <div className="w-1.5 h-1.5 bg-black rounded-full" />
            </div>
          </div>
          <div className="p-sm flex justify-between items-center">
            <div className="min-w-0">
              <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">{liveTitle || 'Outfit title'}</h3>
              {selectedVibes.length > 0 && (
                <p className="font-body-sm text-body-sm text-on-surface-variant">{selectedVibes[0]}</p>
              )}
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">arrow_outward</span>
          </div>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-3">
          {mode === 'create'
            ? 'After creating, you’ll place shoppable pins on the image.'
            : 'Edit details, then manage pins from the Pin Editor.'}
        </p>
      </div>
      </div>
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
    </>
  )
}
