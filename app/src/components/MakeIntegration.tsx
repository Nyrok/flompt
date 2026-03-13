import { useState, useRef } from 'react'
import { X, Zap, ClipboardPaste, CheckCircle, XCircle, Clock, Trash2, ExternalLink, Send, Loader } from 'lucide-react'
import { useMakeStore } from '@/store/makeStore'
import { useFlowStore } from '@/store/flowStore'
import { useLocale } from '@/i18n/LocaleContext'
import { analytics } from '@/lib/analytics'
import type { MakeExecution } from '@/store/makeStore'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidWebhookUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return (u.protocol === 'https:' || u.protocol === 'http:') && u.hostname.includes('make.com')
  } catch {
    return false
  }
}

function formatRelativeTime(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (diff < 60)  return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ─── Component ────────────────────────────────────────────────────────────────

const MakeIntegration = () => {
  const {
    webhookUrl, isPanelOpen, isSending, lastStatus, history,
    setWebhookUrl, setIsPanelOpen, setIsSending, setLastStatus,
    addExecution, clearHistory,
  } = useMakeStore()

  const { compiledPrompt, outputFormat, nodes } = useFlowStore()
  const { t } = useLocale()

  const [urlInput, setUrlInput] = useState(webhookUrl)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentRaw: string | null = compiledPrompt?.formats?.[outputFormat] ?? null
  const isConfigured = isValidWebhookUrl(webhookUrl)
  const canSend = isConfigured && currentRaw !== null && !isSending

  // ── URL save ────────────────────────────────────────────────────────────
  const handleUrlChange = (val: string) => {
    setUrlInput(val)
    setUrlError(null)
    setTestResult(null)
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    // Auto-save when valid
    if (isValidWebhookUrl(val)) {
      setWebhookUrl(val)
      setUrlError(null)
    }
  }

  const handleUrlBlur = () => {
    if (urlInput && !isValidWebhookUrl(urlInput)) {
      setUrlError(t.makeIntegration.invalidUrl)
    } else if (urlInput) {
      setWebhookUrl(urlInput)
    }
  }

  // ── Paste from clipboard ────────────────────────────────────────────────
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setUrlInput(text)
      handleUrlChange(text)
    } catch { /* user denied clipboard */ }
  }

  // ── Test connection ─────────────────────────────────────────────────────
  const handleTest = async () => {
    if (!isValidWebhookUrl(urlInput)) return
    setIsTesting(true)
    setTestResult(null)
    try {
      // Send a lightweight ping — Make webhooks always return 200 even on GET
      const res = await fetch(urlInput, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _flompt_ping: true }),
      })
      setTestResult(res.ok ? 'ok' : 'fail')
    } catch {
      setTestResult('fail')
    } finally {
      setIsTesting(false)
    }
  }

  // ── Send prompt ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!canSend || !currentRaw) return
    setIsSending(true)
    setLastStatus(null)
    analytics.makeSendPrompt(outputFormat, nodes.length, currentRaw.length)

    const exec: MakeExecution = {
      id: crypto.randomUUID(),
      sentAt: new Date().toISOString(),
      status: 'success',
      promptLength: currentRaw.length,
      format: outputFormat,
    }

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentRaw,
          format: outputFormat,
          blockCount: nodes.length,
          source: 'flompt',
          sentAt: exec.sentAt,
        }),
      })

      if (!res.ok) {
        exec.status = 'error'
        exec.errorMessage = `HTTP ${res.status}`
        analytics.makeError(`HTTP ${res.status}`)
      } else {
        analytics.makeSuccess()
      }
    } catch (err) {
      exec.status = 'error'
      exec.errorMessage = err instanceof Error ? err.message : 'Network error'
      analytics.makeError(exec.errorMessage)
    }

    addExecution(exec)
    setLastStatus(exec.status)
    setIsSending(false)

    // Auto-clear success state after 4s
    if (exec.status === 'success') {
      closeTimerRef.current = setTimeout(() => setLastStatus(null), 4000)
    }
  }

  if (!isPanelOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="make-backdrop"
        onClick={() => setIsPanelOpen(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="make-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t.makeIntegration.panelLabel}
      >
        {/* Header */}
        <div className="make-panel-header">
          <div className="make-panel-brand">
            <div className="make-brand-icon" aria-hidden="true">
              <Zap size={14} />
            </div>
            <span className="make-panel-title">{t.makeIntegration.title}</span>
            <span className="make-panel-subtitle">make.com</span>
          </div>
          <button
            className="btn-icon make-close-btn"
            onClick={() => setIsPanelOpen(false)}
            aria-label={t.makeIntegration.close}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="make-panel-body">

          {/* Webhook URL */}
          <section className="make-section">
            <label className="make-label" htmlFor="make-webhook-input">
              {t.makeIntegration.webhookLabel}
            </label>
            <div className="make-url-row">
              <input
                id="make-webhook-input"
                className={`make-webhook-input${urlError ? ' make-webhook-input--error' : ''}${isConfigured && webhookUrl === urlInput ? ' make-webhook-input--ok' : ''}`}
                type="url"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="https://hook.eu1.make.com/..."
                spellCheck={false}
                autoComplete="off"
              />
              <button
                className="btn-icon make-paste-btn"
                onClick={handlePaste}
                title={t.makeIntegration.paste}
                aria-label={t.makeIntegration.paste}
              >
                <ClipboardPaste size={13} />
              </button>
            </div>
            {urlError && (
              <span className="make-field-error" role="alert">{urlError}</span>
            )}
          </section>

          {/* Status + Test */}
          <div className="make-status-row">
            <div className={`make-status-badge${isConfigured ? ' make-status-badge--ok' : ''}`}>
              {isConfigured
                ? <><CheckCircle size={11} /> {t.makeIntegration.configured}</>
                : <><XCircle size={11} /> {t.makeIntegration.notConfigured}</>
              }
            </div>
            {isConfigured && (
              <button
                className="make-test-btn"
                onClick={handleTest}
                disabled={isTesting}
                title={t.makeIntegration.test}
              >
                {isTesting
                  ? <><Loader size={11} className="spin" /> {t.makeIntegration.testing}</>
                  : testResult === 'ok'
                    ? <><CheckCircle size={11} /> {t.makeIntegration.testOk}</>
                    : testResult === 'fail'
                      ? <><XCircle size={11} /> {t.makeIntegration.testFail}</>
                      : t.makeIntegration.test
                }
              </button>
            )}
          </div>

          {/* Prompt preview */}
          {currentRaw && (
            <div className="make-prompt-preview">
              <span className="make-preview-label">{outputFormat.toUpperCase()}</span>
              <span className="make-preview-chars">~{currentRaw.length} chars</span>
              <div className="make-preview-snippet">{currentRaw.slice(0, 120)}…</div>
            </div>
          )}

          {!currentRaw && (
            <div className="make-no-prompt">
              <Zap size={16} className="make-no-prompt-icon" />
              <span>{t.makeIntegration.noPrompt}</span>
            </div>
          )}

          {/* Send button */}
          <button
            className={`make-send-btn${lastStatus === 'success' ? ' make-send-btn--success' : ''}${lastStatus === 'error' ? ' make-send-btn--error' : ''}`}
            onClick={handleSend}
            disabled={!canSend}
            aria-disabled={!canSend}
            aria-live="polite"
          >
            {isSending
              ? <><Loader size={14} className="spin" /> {t.makeIntegration.sending}</>
              : lastStatus === 'success'
                ? <><CheckCircle size={14} /> {t.makeIntegration.sent}</>
                : lastStatus === 'error'
                  ? <><XCircle size={14} /> {t.makeIntegration.sendError}</>
                  : <><Send size={14} /> {t.makeIntegration.send}</>
            }
          </button>

          {/* Execution history */}
          {history.length > 0 && (
            <section className="make-section">
              <div className="make-history-header">
                <span className="make-label">{t.makeIntegration.history}</span>
                <button
                  className="make-clear-btn"
                  onClick={clearHistory}
                  title={t.makeIntegration.clearHistory}
                >
                  <Trash2 size={11} /> {t.makeIntegration.clearHistory}
                </button>
              </div>
              <ul className="make-history-list" aria-label={t.makeIntegration.history}>
                {history.map((exec) => (
                  <li key={exec.id} className={`make-history-item${exec.status === 'error' ? ' make-history-item--error' : ''}`}>
                    <span className="make-history-icon" aria-hidden="true">
                      {exec.status === 'success'
                        ? <CheckCircle size={11} />
                        : <XCircle size={11} />
                      }
                    </span>
                    <span className="make-history-meta">
                      <span className="make-history-time">
                        <Clock size={9} /> {formatRelativeTime(exec.sentAt)}
                      </span>
                      <span className="make-history-format">{exec.format}</span>
                      {exec.status === 'success'
                        ? <span className="make-history-chars">{exec.promptLength} chars</span>
                        : <span className="make-history-err">{exec.errorMessage}</span>
                      }
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Make.com link */}
          <a
            className="make-docs-link"
            href="https://www.make.com/en/help/tools/webhooks"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={11} /> {t.makeIntegration.docs}
          </a>
        </div>
      </div>
    </>
  )
}

export default MakeIntegration
