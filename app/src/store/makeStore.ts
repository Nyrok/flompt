import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MakeExecution {
  id: string
  sentAt: string          // ISO string
  status: 'success' | 'error'
  errorMessage?: string
  promptLength: number
  format: string
}

interface MakeState {
  webhookUrl: string
  isPanelOpen: boolean
  isSending: boolean
  lastStatus: 'success' | 'error' | null
  history: MakeExecution[]

  setWebhookUrl: (url: string) => void
  setIsPanelOpen: (open: boolean) => void
  setIsSending: (v: boolean) => void
  setLastStatus: (s: 'success' | 'error' | null) => void
  addExecution: (exec: MakeExecution) => void
  clearHistory: () => void
}

const MAX_HISTORY = 10

export const useMakeStore = create<MakeState>()(
  persist(
    (set) => ({
      webhookUrl: '',
      isPanelOpen: false,
      isSending: false,
      lastStatus: null,
      history: [],

      setWebhookUrl: (url) => set({ webhookUrl: url, lastStatus: null }),
      setIsPanelOpen: (open) => set({ isPanelOpen: open }),
      setIsSending: (v) => set({ isSending: v }),
      setLastStatus: (s) => set({ lastStatus: s }),

      addExecution: (exec) =>
        set((state) => ({
          history: [exec, ...state.history].slice(0, MAX_HISTORY),
        })),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'flompt-make',
      partialize: (state) => ({
        webhookUrl: state.webhookUrl,
        history: state.history,
        // isPanelOpen / isSending / lastStatus: transient, not persisted
      }),
    }
  )
)
