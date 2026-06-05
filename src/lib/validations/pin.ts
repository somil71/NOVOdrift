import { z } from 'zod'

export const createPinSchema = z.object({
  fit_id: z.string().uuid('Must be a valid fit ID'),
  x_percent: z.number().min(0).max(100),
  y_percent: z.number().min(0).max(100),
  product_name: z.string().min(1, 'Product name is required'),
  brand: z.string().optional(),
  price: z.number().positive().optional(),
  affiliate_url: z.string().url('Must be a valid URL'),
})

export const updatePinSchema = z.object({
  product_name: z.string().min(1).optional(),
  brand: z.string().optional(),
  price: z.number().positive().optional(),
  affiliate_url: z.string().url().optional(),
})

export type CreatePinInput = z.infer<typeof createPinSchema>
export type UpdatePinInput = z.infer<typeof updatePinSchema>
