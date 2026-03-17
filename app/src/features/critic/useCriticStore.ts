import { create } from 'zustand'
import type { CriticResult } from './types'

interface CriticState {
  isOpen: boolean
  isLoading: boolean
  result: CriticResult | null
  error: string | null
  cachedForPrompt: string | null
  setOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setResult: (result: CriticResult | null) => void
  setError: (error: string | null) => void
  setCachedForPrompt: (prompt: string | null) => void
}

export const useCriticStore = create<CriticState>((set) => ({
  isOpen: false,
  isLoading: false,
  result: null,
  error: null,
  cachedForPrompt: null,
  setOpen: (isOpen) => set({ isOpen }),
  setLoading: (isLoading) => set({ isLoading }),
  setResult: (result) => set({ result }),
  setError: (error) => set({ error }),
  setCachedForPrompt: (cachedForPrompt) => set({ cachedForPrompt }),
}))
