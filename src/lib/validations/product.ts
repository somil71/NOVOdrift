import { z } from 'zod'
import { PRODUCT_CATEGORIES } from '@/lib/constants'

export { PRODUCT_CATEGORIES }

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().nullish(),
  category: z.enum(PRODUCT_CATEGORIES, { error: 'Invalid category' }),
  // valueAsNumber on an empty field yields NaN — coerce NaN to undefined
  price: z.number().positive().nullish().or(z.nan().transform(() => undefined)),
  image_url: z.string().url().nullish().or(z.literal('')),
  affiliate_url: z.string().url('Must be a valid URL'),
  tags: z.array(z.string()).optional(),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color').nullish(),
})

export const updateProductSchema = createProductSchema
  .partial()
  .extend({ published: z.boolean().optional() })

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
