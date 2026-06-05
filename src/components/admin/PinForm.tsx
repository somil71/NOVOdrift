'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import type { Pin } from '@/lib/supabase/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const pinFormSchema = z.object({
  product_name: z.string().min(1, 'Product name is required'),
  brand: z.string().optional(),
  price: z.number().positive().optional().or(z.nan().transform(() => undefined)),
  affiliate_url: z.string().url('Must be a valid URL'),
})

type PinFormValues = z.infer<typeof pinFormSchema>

interface PinFormProps {
  pin?: Partial<Pin>
  onSave: (data: PinFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function PinForm({ pin, onSave, onCancel, isLoading }: PinFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PinFormValues>({
    resolver: zodResolver(pinFormSchema),
    defaultValues: {
      product_name: pin?.product_name ?? '',
      brand: pin?.brand ?? '',
      price: pin?.price ?? undefined,
      affiliate_url: pin?.affiliate_url ?? '',
    },
  })

  useEffect(() => {
    reset({
      product_name: pin?.product_name ?? '',
      brand: pin?.brand ?? '',
      price: pin?.price ?? undefined,
      affiliate_url: pin?.affiliate_url ?? '',
    })
  }, [pin, reset])

  return (
    <div className="bg-bg-card border border-border rounded-card p-4 shadow-xl w-72">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary">
          {pin?.id ? 'Edit Pin' : 'New Pin'}
        </h3>
        <button onClick={onCancel} className="text-text-muted hover:text-text-primary transition-colors">
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-3">
        <Input
          label="Product Name *"
          placeholder="e.g. Oversized Blazer"
          error={errors.product_name?.message}
          {...register('product_name')}
        />
        <Input label="Brand" placeholder="e.g. Zara" {...register('brand')} />
        <Input
          label="Price (₹)"
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g. 3999"
          {...register('price', { valueAsNumber: true })}
        />
        <Input
          label="Affiliate URL *"
          placeholder="https://..."
          error={errors.affiliate_url?.message}
          {...register('affiliate_url')}
        />
        <div className="flex gap-2 mt-1">
          <Button type="submit" size="sm" loading={isLoading} className="flex-1">
            Save Pin
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
