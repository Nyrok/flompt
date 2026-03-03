import axios, { AxiosError } from 'axios'
import type { FlomptNode, FlomptEdge } from '@/types/blocks'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ─── Error classification ────────────────────────────────────────────────────

export type ApiErrorType = 'overloaded' | 'timeout' | 'network' | 'server' | 'blocked' | 'unknown'

export function classifyError(e: unknown): ApiErrorType {
  if (e instanceof AxiosError) {
    const status = e.response?.status
    const detail = (e.response?.data as { detail?: string })?.detail ?? ''
    if (status === 529 || status === 503 || detail.includes('529') || detail.includes('overloaded')) return 'overloaded'
    if (status === 429) return 'overloaded'
    if (e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT' || status === 504) return 'timeout'
    if (e.code === 'ERR_NETWORK' || !e.response) return 'network'
    if (status && status >= 500) return 'server'
  }
  return 'unknown'
}

/** Classifie une erreur backend retournée via le job store (string). */
export function classifyJobError(errorMsg: string): ApiErrorType {
  const msg = errorMsg.toLowerCase()
  if (msg === 'prompt_blocked') return 'blocked'
  if (msg.includes('529') || msg.includes('overloaded')) return 'overloaded'
  if (msg.includes('timeout') || msg.includes('timed out')) return 'timeout'
  if (msg.includes('network') || msg.includes('connection')) return 'network'
  return 'server'
}

// ─── Decompose (async / fire-and-forget) ─────────────────────────────────────
// POST /api/decompose → retourne immédiatement { job_id, status, token }
// WS   /api/ws/job/{job_id}?token=... → statut temps réel jusqu'à done/error

export interface DecomposeResponse {
  nodes: FlomptNode[]
  edges: FlomptEdge[]
}

/** Réponse immédiate du POST /api/decompose. */
export interface DecomposeJobStarted {
  job_id: string
  status: 'analyzing' | 'queued'
  position?: number
  token: string
}

/** Réponse du WS /api/ws/job/{job_id} au fil du streaming. */
export interface JobPollResponse {
  job_id: string
  status: 'analyzing' | 'queued' | 'processing' | 'done' | 'error' | 'blocked' | 'unknown'
  position?: number | null
  result?: DecomposeResponse   // présent quand status === 'done'
  error?: string               // présent quand status === 'error' | 'blocked'
  violations?: string[]        // noms lisibles des catégories violées (status === 'blocked')
}

/** Soumet le job — retourne immédiatement avec job_id, token et position estimée. */
export const decomposePrompt = async (rawPrompt: string, jobId: string): Promise<DecomposeJobStarted> => {
  const { data } = await client.post<DecomposeJobStarted>('/decompose', { prompt: rawPrompt, job_id: jobId })
  return data
}

/**
 * Ouvre une connexion WebSocket vers /api/ws/job/{jobId}?token=... et résout
 * la promesse dès que le job est terminé (done/error/blocked).
 * Pousse les updates de statut via le callback `onStatus`.
 */
export function watchJobStatus(
  jobId: string,
  token: string,
  onStatus: (pos: number, status: 'analyzing' | 'queued' | 'processing') => void,
): Promise<DecomposeResponse> {
  return new Promise((resolve, reject) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/ws/job/${jobId}?token=${encodeURIComponent(token)}`
    const ws = new WebSocket(wsUrl)

    // Flag pour éviter de resolve/reject plusieurs fois
    let settled = false

    const settle = (fn: () => void) => {
      if (settled) return
      settled = true
      fn()
    }

    ws.onmessage = (event) => {
      const data: JobPollResponse = JSON.parse(event.data as string)

      if (data.status === 'done' && data.result) {
        settle(() => {
          ws.close()
          resolve(data.result!)
        })
      } else if (data.status === 'error') {
        settle(() => {
          ws.close()
          const err = new Error(data.error ?? 'Job failed')
          ;(err as Error & { jobError?: string }).jobError = data.error ?? ''
          reject(err)
        })
      } else if (data.status === 'blocked') {
        settle(() => {
          ws.close()
          const err = new Error('PROMPT_BLOCKED')
          ;(err as Error & { jobError?: string; violations?: string[] }).jobError = 'PROMPT_BLOCKED'
          ;(err as Error & { jobError?: string; violations?: string[] }).violations = data.violations ?? []
          reject(err)
        })
      } else if (data.status === 'analyzing') {
        onStatus(0, 'analyzing')
      } else if (data.status === 'queued') {
        onStatus(data.position ?? 1, 'queued')
      } else if (data.status === 'processing') {
        onStatus(0, 'processing')
      }
    }

    ws.onerror = () => {
      settle(() => {
        ws.close()
        const err = new Error('WebSocket connection failed')
        reject(err)
      })
    }

    ws.onclose = () => {
      // Connexion fermée sans état terminal (drop réseau, timeout proxy, redémarrage serveur…)
      settle(() => {
        const err = new Error('WebSocket closed before job completion')
        reject(err)
      })
    }
  })
}

// compilePrompt supprimé — l'assemblage est désormais 100% local (voir PromptOutput.tsx)
