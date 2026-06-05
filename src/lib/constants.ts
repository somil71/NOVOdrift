// Vibe filter categories — single source of truth
export const VIBE_FILTERS = [
  'All',
  'Street',
  'Minimal',
  'Dark Academia',
  'Ethnic',
  'Formal',
  'Casual',
  'Avant-Garde',
  'Techwear',
] as const

export type VibeFilter = (typeof VIBE_FILTERS)[number]

// Product categories
export const PRODUCT_CATEGORIES = [
  'Tops',
  'Bottoms',
  'Shoes',
  'Accessories',
  'Outerwear',
  'Bags',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]
