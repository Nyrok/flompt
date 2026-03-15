import { create } from 'zustand'
import type { SystemPromptResult, SystemSection } from './types'

interface SystemPromptState {
  isOpen: boolean
  isLoading: boolean
  result: SystemPromptResult | null
  error: string | null
  editedSections: SystemSection[]
  setOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setResult: (result: SystemPromptResult | null) => void
  setError: (error: string | null) => void
  updateSection: (name: string, content: string) => void
}

export const useSystemPromptStore = create<SystemPromptState>((set) => ({
  isOpen: false,
  isLoading: false,
  result: null,
  error: null,
  editedSections: [],
  setOpen: (isOpen) => set({ isOpen }),
  setLoading: (isLoading) => set({ isLoading }),
  setResult: (result) => set({ result, editedSections: result?.sections ?? [] }),
  setError: (error) => set({ error }),
  updateSection: (name, content) =>
    set(state => ({
      editedSections: state.editedSections.map(s => s.name === name ? { ...s, content } : s)
    })),
}))
