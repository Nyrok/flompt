import { create } from 'zustand'
import type { AuditResult } from './types'

interface AuditState {
  isOpen:      boolean
  result:      AuditResult | null
  cachedKey:   string | null   // serialized sorted block-type presence key
  setOpen:     (open: boolean) => void
  setResult:   (result: AuditResult | null) => void
  setCachedKey:(key: string | null) => void
}

export const useAuditStore = create<AuditState>((set) => ({
  isOpen:      false,
  result:      null,
  cachedKey:   null,
  setOpen:     (isOpen)     => set({ isOpen }),
  setResult:   (result)     => set({ result }),
  setCachedKey:(cachedKey)  => set({ cachedKey }),
}))
