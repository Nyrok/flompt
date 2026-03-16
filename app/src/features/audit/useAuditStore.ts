import { create } from 'zustand'
import type { AuditResult } from './types'

interface AuditState {
  isOpen:  boolean
  result:  AuditResult | null
  setOpen:   (open: boolean) => void
  setResult: (result: AuditResult | null) => void
}

export const useAuditStore = create<AuditState>((set) => ({
  isOpen:    false,
  result:    null,
  setOpen:   (isOpen)  => set({ isOpen }),
  setResult: (result)  => set({ result }),
}))
