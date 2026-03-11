/**
 * Tests for api.ts — WebSocket job status handling including
 * the new 'blocked', 'analyzing' statuses and PromptBlockedError.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { watchJobStatus, classifyJobError, PromptBlockedError, type JobPollResponse } from './api'

// ─── WebSocket Mock ───────────────────────────────────────────────────────────

interface MockWSHandlers {
  onmessage?: ((event: { data: string }) => void) | null
  onerror?: (() => void) | null
  onclose?: (() => void) | null
}

class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.OPEN
  handlers: MockWSHandlers = {}

  set onmessage(fn: ((e: { data: string }) => void) | null) { this.handlers.onmessage = fn }
  set onerror(fn: (() => void) | null) { this.handlers.onerror = fn }
  set onclose(fn: (() => void) | null) { this.handlers.onclose = fn }

  close() {
    this.readyState = MockWebSocket.CLOSED
  }

  /** Helper: emit a JSON message as if received from the server. */
  emit(data: JobPollResponse) {
    this.handlers.onmessage?.({ data: JSON.stringify(data) })
  }

  /** Helper: trigger the error handler. */
  triggerError() {
    this.handlers.onerror?.()
  }

  /** Helper: trigger the close handler. */
  triggerClose() {
    this.handlers.onclose?.()
  }
}

let mockWs: MockWebSocket

beforeEach(() => {
  mockWs = new MockWebSocket()
  // Must use a regular function (not arrow) so `new WebSocket(...)` works as constructor.
  // Returning an object from a constructor replaces the `new` result with that object.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.stubGlobal('WebSocket', function MockWSCtor(this: unknown) { return mockWs } as any)
  vi.stubGlobal('window', {
    location: { protocol: 'http:', host: 'localhost' },
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ─── PromptBlockedError ───────────────────────────────────────────────────────

describe('PromptBlockedError', () => {
  it('stores violations', () => {
    const err = new PromptBlockedError(['S14'])
    expect(err.violations).toEqual(['S14'])
  })

  it('has correct name', () => {
    const err = new PromptBlockedError(['S14'])
    expect(err.name).toBe('PromptBlockedError')
  })

  it('message includes PROMPT_BLOCKED and violation codes', () => {
    const err = new PromptBlockedError(['S1', 'S14'])
    expect(err.message).toContain('PROMPT_BLOCKED')
    expect(err.message).toContain('S1')
    expect(err.message).toContain('S14')
  })

  it('extends Error', () => {
    const err = new PromptBlockedError(['S14'])
    expect(err).toBeInstanceOf(Error)
  })

  it('handles empty violations', () => {
    const err = new PromptBlockedError([])
    expect(err.violations).toEqual([])
  })
})

// ─── watchJobStatus — 'done' ──────────────────────────────────────────────────

describe('watchJobStatus — done', () => {
  it('resolves with result when status is done', async () => {
    const promise = watchJobStatus('job1', 'token', vi.fn())

    mockWs.emit({
      job_id: 'job1',
      status: 'done',
      result: { nodes: [], edges: [] },
    })

    const result = await promise
    expect(result).toEqual({ nodes: [], edges: [] })
  })
})

// ─── watchJobStatus — 'error' ─────────────────────────────────────────────────

describe('watchJobStatus — error', () => {
  it('rejects with an Error when status is error', async () => {
    const promise = watchJobStatus('job1', 'token', vi.fn())

    mockWs.emit({
      job_id: 'job1',
      status: 'error',
      error: 'LLM timeout',
    })

    await expect(promise).rejects.toThrow('LLM timeout')
  })

  it('attaches jobError to the rejected error', async () => {
    const promise = watchJobStatus('job1', 'token', vi.fn())
    mockWs.emit({ job_id: 'job1', status: 'error', error: 'server crash' })

    try {
      await promise
    } catch (e) {
      expect((e as Error & { jobError?: string }).jobError).toBe('server crash')
    }
  })
})

// ─── watchJobStatus — 'blocked' ───────────────────────────────────────────────

describe('watchJobStatus — blocked', () => {
  it('rejects with PromptBlockedError when status is blocked', async () => {
    const promise = watchJobStatus('job1', 'token', vi.fn())

    mockWs.emit({
      job_id: 'job1',
      status: 'blocked',
      error: 'PROMPT_BLOCKED',
      violations: ['S14'],
    })

    await expect(promise).rejects.toBeInstanceOf(PromptBlockedError)
  })

  it('carries violation codes in the error', async () => {
    const promise = watchJobStatus('job1', 'token', vi.fn())
    mockWs.emit({ job_id: 'job1', status: 'blocked', violations: ['S14'] })

    try {
      await promise
    } catch (e) {
      expect(e).toBeInstanceOf(PromptBlockedError)
      expect((e as PromptBlockedError).violations).toEqual(['S14'])
    }
  })

  it('uses UNKNOWN when violations array is missing', async () => {
    const promise = watchJobStatus('job1', 'token', vi.fn())
    mockWs.emit({ job_id: 'job1', status: 'blocked' })

    try {
      await promise
    } catch (e) {
      expect(e).toBeInstanceOf(PromptBlockedError)
      expect((e as PromptBlockedError).violations).toEqual(['UNKNOWN'])
    }
  })

  it('blocked error is distinct from a generic Error (has name + violations)', async () => {
    const promise = watchJobStatus('job1', 'token', vi.fn())
    mockWs.emit({ job_id: 'job1', status: 'blocked', violations: ['S14'] })

    try {
      await promise
    } catch (e) {
      // PromptBlockedError extends Error — it IS both
      expect(e).toBeInstanceOf(PromptBlockedError)
      expect(e).toBeInstanceOf(Error)
      // But distinguished from plain Error by its name and violations field
      expect((e as PromptBlockedError).name).toBe('PromptBlockedError')
      expect(Array.isArray((e as PromptBlockedError).violations)).toBe(true)
    }
  })

  it('blocked with multiple violations', async () => {
    const promise = watchJobStatus('job1', 'token', vi.fn())
    mockWs.emit({ job_id: 'job1', status: 'blocked', violations: ['S1', 'S14'] })

    try {
      await promise
    } catch (e) {
      expect((e as PromptBlockedError).violations).toEqual(['S1', 'S14'])
    }
  })

  it('does not call onStatus for blocked', async () => {
    const onStatus = vi.fn()
    const promise = watchJobStatus('job1', 'token', onStatus)
    mockWs.emit({ job_id: 'job1', status: 'blocked', violations: ['S14'] })

    await expect(promise).rejects.toBeInstanceOf(PromptBlockedError)
    expect(onStatus).not.toHaveBeenCalled()
  })
})

// ─── watchJobStatus — 'queued' ────────────────────────────────────────────────

describe('watchJobStatus — queued', () => {
  it('calls onStatus with position and queued', () => {
    const onStatus = vi.fn()
    watchJobStatus('job1', 'token', onStatus)

    mockWs.emit({ job_id: 'job1', status: 'queued', position: 3 })

    expect(onStatus).toHaveBeenCalledWith(3, 'queued')
  })

  it('defaults to position 1 if missing', () => {
    const onStatus = vi.fn()
    watchJobStatus('job1', 'token', onStatus)
    mockWs.emit({ job_id: 'job1', status: 'queued' })
    expect(onStatus).toHaveBeenCalledWith(1, 'queued')
  })
})

// ─── watchJobStatus — 'processing' ───────────────────────────────────────────

describe('watchJobStatus — processing', () => {
  it('calls onStatus with (0, processing)', () => {
    const onStatus = vi.fn()
    watchJobStatus('job1', 'token', onStatus)

    mockWs.emit({ job_id: 'job1', status: 'processing', position: 0 })

    expect(onStatus).toHaveBeenCalledWith(0, 'processing')
  })
})

// ─── watchJobStatus — 'analyzing' ────────────────────────────────────────────

describe('watchJobStatus — analyzing', () => {
  it('maps analyzing → onStatus(0, processing)', () => {
    const onStatus = vi.fn()
    watchJobStatus('job1', 'token', onStatus)

    mockWs.emit({ job_id: 'job1', status: 'analyzing', position: 0 })

    expect(onStatus).toHaveBeenCalledWith(0, 'processing')
  })

  it('analyzing does not resolve or reject the promise', () => {
    const onStatus = vi.fn()
    const promise = watchJobStatus('job1', 'token', onStatus)

    mockWs.emit({ job_id: 'job1', status: 'analyzing', position: 0 })

    // Promise should still be pending — we can verify by checking onStatus called
    expect(onStatus).toHaveBeenCalledTimes(1)
    // The promise is not resolved — we don't await it (would hang)
    // Just verify the onStatus was called with the right args
    expect(onStatus).toHaveBeenCalledWith(0, 'processing')

    // Resolve to avoid unhandled rejection
    mockWs.emit({ job_id: 'job1', status: 'done', result: { nodes: [], edges: [] } })
    return promise
  })
})

// ─── watchJobStatus — full flow ───────────────────────────────────────────────

describe('watchJobStatus — full flow', () => {
  it('queued → analyzing → blocked', async () => {
    const onStatus = vi.fn()
    const promise = watchJobStatus('job1', 'token', onStatus)

    mockWs.emit({ job_id: 'job1', status: 'queued', position: 1 })
    mockWs.emit({ job_id: 'job1', status: 'analyzing', position: 0 })
    mockWs.emit({ job_id: 'job1', status: 'blocked', violations: ['S14'] })

    await expect(promise).rejects.toBeInstanceOf(PromptBlockedError)
    expect(onStatus).toHaveBeenCalledWith(1, 'queued')
    expect(onStatus).toHaveBeenCalledWith(0, 'processing') // analyzing → processing
  })

  it('queued → processing → analyzing → done', async () => {
    const onStatus = vi.fn()
    const promise = watchJobStatus('job1', 'token', onStatus)

    mockWs.emit({ job_id: 'job1', status: 'queued', position: 2 })
    mockWs.emit({ job_id: 'job1', status: 'processing', position: 0 })
    mockWs.emit({ job_id: 'job1', status: 'analyzing', position: 0 })
    mockWs.emit({ job_id: 'job1', status: 'done', result: { nodes: [{ id: '1' } as never], edges: [] } })

    const result = await promise
    expect(result.nodes).toHaveLength(1)
    expect(onStatus).toHaveBeenCalledTimes(3)
  })

  it('does not settle more than once (idempotent)', async () => {
    const promise = watchJobStatus('job1', 'token', vi.fn())

    mockWs.emit({ job_id: 'job1', status: 'done', result: { nodes: [], edges: [] } })
    // Second done should be ignored
    mockWs.emit({ job_id: 'job1', status: 'done', result: { nodes: [{ id: '2' } as never], edges: [] } })

    const result = await promise
    expect(result.nodes).toHaveLength(0) // First result wins
  })
})

// ─── watchJobStatus — network/close errors ────────────────────────────────────

describe('watchJobStatus — network errors', () => {
  it('rejects on WebSocket error', async () => {
    const promise = watchJobStatus('job1', 'token', vi.fn())
    mockWs.triggerError()
    await expect(promise).rejects.toThrow('WebSocket connection failed')
  })

  it('rejects on premature close', async () => {
    const promise = watchJobStatus('job1', 'token', vi.fn())
    mockWs.triggerClose()
    await expect(promise).rejects.toThrow('WebSocket closed before job completion')
  })
})

// ─── classifyJobError ─────────────────────────────────────────────────────────

describe('classifyJobError', () => {
  it('classifies overloaded errors', () => {
    expect(classifyJobError('529 overloaded')).toBe('overloaded')
    expect(classifyJobError('service overloaded')).toBe('overloaded')
  })

  it('classifies timeout errors', () => {
    expect(classifyJobError('request timed out')).toBe('timeout')
    expect(classifyJobError('timeout after 60s')).toBe('timeout')
  })

  it('classifies network errors', () => {
    expect(classifyJobError('network error')).toBe('network')
    expect(classifyJobError('connection refused')).toBe('network')
  })

  it('classifies unknown as server', () => {
    expect(classifyJobError('PROMPT_BLOCKED: S14')).toBe('server')
    expect(classifyJobError('some unknown error')).toBe('server')
  })
})
