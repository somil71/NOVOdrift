import { z } from 'zod'

export const createFitSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  image_url: z.string().url('Must be a valid URL'),
  vibe_tags: z.array(z.string()).max(5),
})

export const updateFitSchema = createFitSchema
  .partial()
  .extend({ published: z.boolean().optional() })

export type CreateFitInput = z.infer<typeof createFitSchema>
export type UpdateFitInput = z.infer<typeof updateFitSchema>
