import { z } from 'zod'
import { PRODUCT_CATEGORIES } from '@/lib/constants'

export { PRODUCT_CATEGORIES }

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().optional(),
  category: z.enum(PRODUCT_CATEGORIES, { error: 'Invalid category' }),
  price: z.number().positive().optional(),
  image_url: z.string().url().optional(),
  affiliate_url: z.string().url('Must be a valid URL'),
  tags: z.array(z.string()).optional(),
})

export const updateProductSchema = createProductSchema
  .partial()
  .extend({ published: z.boolean().optional() })

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
