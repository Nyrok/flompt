import { create } from 'zustand'
import type { CompressResult } from './types'

interface CompressorState {
  isOpen: boolean
  isLoading: boolean
  result: CompressResult | null
  error: string | null
  targetReduction: number
  setOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setResult: (result: CompressResult | null) => void
  setError: (error: string | null) => void
  setTargetReduction: (v: number) => void
}

export const useCompressorStore = create<CompressorState>((set) => ({
  isOpen: false,
  isLoading: false,
  result: null,
  error: null,
  targetReduction: 0.5,
  setOpen: (isOpen) => set({ isOpen }),
  setLoading: (isLoading) => set({ isLoading }),
  setResult: (result) => set({ result }),
  setError: (error) => set({ error }),
  setTargetReduction: (targetReduction) => set({ targetReduction }),
}))
