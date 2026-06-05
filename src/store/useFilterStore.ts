import { create } from 'zustand'
import { VIBE_FILTERS, type VibeFilter } from '@/lib/constants'

export { VIBE_FILTERS, type VibeFilter }

interface FilterStore {
  vibeFilter: VibeFilter
  setVibeFilter: (vibe: VibeFilter) => void
  resetFilter: () => void
}

export const useFilterStore = create<FilterStore>((set) => ({
  vibeFilter: 'All',
  setVibeFilter: (vibe) => set({ vibeFilter: vibe }),
  resetFilter: () => set({ vibeFilter: 'All' }),
}))
