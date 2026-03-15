import { create } from 'zustand'
import type { DebugResult } from './types'

interface DebuggerState {
  isOpen: boolean
  isLoading: boolean
  result: DebugResult | null
  error: string | null
  setOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setResult: (result: DebugResult | null) => void
  setError: (error: string | null) => void
}

export const useDebuggerStore = create<DebuggerState>((set) => ({
  isOpen: false,
  isLoading: false,
  result: null,
  error: null,
  setOpen: (isOpen) => set({ isOpen }),
  setLoading: (isLoading) => set({ isLoading }),
  setResult: (result) => set({ result }),
  setError: (error) => set({ error }),
}))
