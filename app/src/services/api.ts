import axios, { AxiosError } from 'axios'
import type { FlomptNode, FlomptEdge } from '@/types/blocks'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ─── Error classification ────────────────────────────────────────────────────

export type ApiErrorType = 'overloaded' | 'timeout' | 'network' | 'server' | 'unknown'

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

/** Classifies a backend error returned via the job store (string). */
export function classifyJobError(errorMsg: string): ApiErrorType {
  const msg = errorMsg.toLowerCase()
  if (msg.includes('529') || msg.includes('overloaded')) return 'overloaded'
  if (msg.includes('timeout') || msg.includes('timed out')) return 'timeout'
  if (msg.includes('network') || msg.includes('connection')) return 'network'
  return 'server'
}

// ─── Decompose (async / fire-and-forget) ─────────────────────────────────────
// POST /api/decompose → returns immediately { job_id, status, token }
// WS   /api/ws/job/{job_id}?token=... → real-time status until done/error

export interface DecomposeResponse {
  nodes: FlomptNode[]
  edges: FlomptEdge[]
}

/** Immediate response from POST /api/decompose. */
export interface DecomposeJobStarted {
  job_id: string
  status: 'queued'
  position?: number
  token: string
}

/** Response from WS /api/ws/job/{job_id} during streaming. */
export interface JobPollResponse {
  job_id: string
  status: 'queued' | 'processing' | 'done' | 'error' | 'unknown'
  position?: number | null
  result?: DecomposeResponse   // present when status === 'done'
  error?: string               // present when status === 'error'
}

/** Submits the job — returns immediately with job_id, token, and estimated position. */
export const decomposePrompt = async (rawPrompt: string, jobId: string): Promise<DecomposeJobStarted> => {
  const { data } = await client.post<DecomposeJobStarted>('/decompose', { prompt: rawPrompt, job_id: jobId })
  return data
}

/**
 * Opens a WebSocket connection to /api/ws/job/{jobId}?token=... and resolves
 * the promise as soon as the job is finished (done/error).
 * Pushes status updates via the `onStatus` callback.
 */
export function watchJobStatus(
  jobId: string,
  token: string,
  onStatus: (pos: number, status: 'queued' | 'processing') => void,
): Promise<DecomposeResponse> {
  return new Promise((resolve, reject) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/ws/job/${jobId}?token=${encodeURIComponent(token)}`
    const ws = new WebSocket(wsUrl)

    // Flag to avoid resolving/rejecting more than once
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
      // Connection closed without a terminal state (network drop, proxy timeout, server restart…)
      settle(() => {
        const err = new Error('WebSocket closed before job completion')
        reject(err)
      })
    }
  })
}

// compilePrompt removed — assembly is now 100% local (see PromptOutput.tsx)

// ─── AI IDE features ─────────────────────────────────────────────────────────

export interface DebugResult {
  issues: Array<{
    id: string; severity: string; category: string
    message: string; location?: string; suggestion: string
  }>
  score: number; fixedPrompt: string; improvements: string[]
  tokensBefore: number; tokensAfter: number
}

export const debugPrompt = async (prompt: string): Promise<DebugResult> => {
  const { data } = await client.post<any>('/debug', { prompt })
  return {
    issues: data.issues ?? [],
    score: data.score ?? 50,
    fixedPrompt: data.fixed_prompt ?? prompt,
    improvements: data.improvements ?? [],
    tokensBefore: data.tokens_before ?? 0,
    tokensAfter: data.tokens_after ?? 0,
  }
}

export interface CompressResult {
  compressedPrompt: string
  changes: Array<{ type: string; original: string; replacement: string | null; reason: string; tokensSaved: number }>
  tokensBefore: number; tokensAfter: number; reductionPercent: number
}

export const compressPrompt = async (prompt: string, targetReduction = 0.5): Promise<CompressResult> => {
  const { data } = await client.post<any>('/compress', { prompt, target_reduction: targetReduction })
  return {
    compressedPrompt: data.compressed_prompt ?? prompt,
    changes: (data.changes ?? []).map((c: any) => ({
      type: c.type,
      original: c.original,
      replacement: c.replacement ?? null,
      reason: c.reason,
      tokensSaved: c.tokens_saved ?? 0,
    })),
    tokensBefore: data.tokens_before ?? 0,
    tokensAfter: data.tokens_after ?? 0,
    reductionPercent: data.reduction_percent ?? 0,
  }
}

export interface CriticResult {
  overallScore: number; grade: string
  dimensions: Array<{ name: string; score: number; feedback: string }>
  strengths: string[]; weaknesses: string[]; topRecommendation: string
}

export const critiquePrompt = async (prompt: string, locale = 'en'): Promise<CriticResult> => {
  const { data } = await client.post<any>('/critic', { prompt, locale })
  return {
    overallScore: data.overall_score ?? 5,
    grade: data.grade ?? 'C',
    dimensions: data.dimensions ?? [],
    strengths: data.strengths ?? [],
    weaknesses: data.weaknesses ?? [],
    topRecommendation: data.top_recommendation ?? '',
  }
}

export interface SystemPromptResult {
  sections: Array<{ name: string; content: string }>
  fullPrompt: string; totalTokens: number
}

export const generateSystemPrompt = async (prompt: string): Promise<SystemPromptResult> => {
  const { data } = await client.post<any>('/system-prompt', { prompt })
  return {
    sections: data.sections ?? [],
    fullPrompt: data.full_prompt ?? '',
    totalTokens: data.total_tokens ?? 0,
  }
}
