import { create } from 'zustand'

export const VIBE_FILTERS = ['All', 'Street', 'Minimal', 'Dark Academia', 'Ethnic', 'Formal', 'Casual'] as const
export type VibeFilter = (typeof VIBE_FILTERS)[number]

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
