export type { Fit, Pin, Product } from '@/lib/supabase/types'

export interface ApiResponse<T> {
  data: T | null
  error: { message: string; code: string } | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  limit: number
  offset: number
}
