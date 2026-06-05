import { create } from 'zustand'

type ModalType = 'fitDetail' | 'pinForm' | null

interface ModalStore {
  activeModal: ModalType
  modalData: Record<string, unknown> | null
  openModal: (modal: NonNullable<ModalType>, data?: Record<string, unknown>) => void
  closeModal: () => void
}

export const useModalStore = create<ModalStore>((set) => ({
  activeModal: null,
  modalData: null,
  openModal: (modal, data) => set({ activeModal: modal, modalData: data ?? null }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}))
