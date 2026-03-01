import { useState, useRef, useEffect } from 'react'
import { Zap, ClipboardPaste, Download } from 'lucide-react'
import { useFlowStore } from '@/store/flowStore'
import { decomposePrompt, watchJobStatus, classifyError, classifyJobError } from '@/services/api'
import { useLocale } from '@/i18n/LocaleContext'
import { analytics, setSource } from '@/lib/analytics'
import { isExtension } from '@/lib/platform'

// ─── Composant ────────────────────────────────────────────────────────────────

const PromptInput = () => {
  const {
    rawPrompt, setRawPrompt,
    setNodes, setEdges,
    setIsDecomposing, isDecomposing,
    setActiveTab,
    setQueueStatus,
    setCompiledPrompt,
  } = useFlowStore()
  const { t } = useLocale()
  const [error, setError] = useState<string | null>(null)
  const [platformName, setPlatformName] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Réception import depuis la plateforme (extension uniquement) ──────────
  useEffect(() => {
    if (!isExtension) return

    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'FLOMPT_PLATFORM_INFO') {
        const platform = event.data.platform as string
        if (platform && platform !== 'Unknown') {
          setPlatformName(platform)
          setSource('extension', platform)
        }
        return
      }
      if (event.data?.type !== 'FLOMPT_PLATFORM_INPUT') return
      const text = event.data.text as string
      const platform = event.data.platform as string
      if (typeof text !== 'string') return
      setRawPrompt(text)
      if (platform && platform !== 'Unknown') {
        setPlatformName(platform)
        setSource('extension', platform)
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [setRawPrompt])

  const handleImportFromPlatform = () => {
    window.parent.postMessage({ type: 'FLOMPT_SYNC_REQUEST' }, '*')
  }

  const handleDecompose = async () => {
    if (!rawPrompt.trim()) return

    const prompt = rawPrompt
    const jobId = crypto.randomUUID()

    setError(null)
    setQueueStatus(null)
    setCompiledPrompt(null)
    setIsDecomposing(true)
    analytics.decomposeClicked()
    setTimeout(() => setActiveTab('canvas'), 0)

    try {
      // ── 1. Soumettre le job — retour immédiat (statut initial : "analyzing") ──
      const { status: initStatus, position } = await decomposePrompt(prompt, jobId)
      setQueueStatus({
        position: position ?? 0,
        status: initStatus === 'analyzing' ? 'analyzing' : 'queued',
      })

      // ── 2. Attendre le résultat via WebSocket ─────────────────────────────
      const result = await watchJobStatus(jobId, (pos, status) => {
        setQueueStatus({ position: pos, status })
      })

      // ── 3. Appliquer le résultat ──────────────────────────────────────────
      setNodes(result.nodes)
      setEdges(result.edges)
      analytics.decomposeCompleted(result.nodes.length)

    } catch (e) {
      setActiveTab('input')

      // Cas spécial : prompt bloqué par Llama Guard 4 avec catégories de violation
      type BlockedErr = Error & { jobError?: string; violations?: string[] }
      const jobErr = (e as BlockedErr)?.jobError

      if (jobErr === 'PROMPT_BLOCKED') {
        const violations: string[] = (e as BlockedErr).violations ?? []
        const detail = violations.length > 0 ? ` — ${violations.join(', ')}` : ''
        setError(`${t.errors.blocked}${detail}`)
        analytics.error('decompose', 'blocked')
      } else {
        // Erreur job store générique vs erreur réseau (AxiosError)
        const errType = jobErr !== undefined
          ? classifyJobError(jobErr)
          : classifyError(e)
        setError(t.errors[errType])
        analytics.error('decompose', errType)
      }

      console.error(e)
    } finally {
      setQueueStatus(null)
      setIsDecomposing(false)
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setRawPrompt(rawPrompt ? rawPrompt + '\n' + text : text)
        textareaRef.current?.focus()
      }
    } catch {
      textareaRef.current?.focus()
    }
  }

  return (
    <div className="prompt-input-panel">
      <h2 className="panel-title">{t.promptInput.title}</h2>

      {/* Bouton import plateforme — visible uniquement dans l'extension */}
      {isExtension && (
        <button
          className="btn btn-secondary btn-import-platform"
          onClick={handleImportFromPlatform}
          type="button"
        >
          <Download size={13} />
          {platformName
            ? `Import from ${platformName}`
            : t.promptInput.importFromPlatform
          }
        </button>
      )}

      <div className="textarea-wrap">
        <label htmlFor="raw-prompt-textarea" className="sr-only">
          {t.promptInput.title}
        </label>
        <textarea
          id="raw-prompt-textarea"
          ref={textareaRef}
          className="prompt-textarea"
          value={rawPrompt}
          onChange={(e) => setRawPrompt(e.target.value)}
          placeholder={t.promptInput.placeholder}
          rows={5}
          aria-describedby={error ? 'prompt-error-msg' : undefined}
        />
        {!rawPrompt && (
          <button
            className="btn-paste"
            onClick={handlePaste}
            title={t.promptInput.paste}
            aria-label={t.promptInput.paste}
            type="button"
          >
            <ClipboardPaste size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {error && (
        <p id="prompt-error-msg" className="error-msg" role="alert" aria-live="assertive">
          {error}
        </p>
      )}

      <button
        className="btn btn-primary"
        onClick={handleDecompose}
        disabled={isDecomposing || !rawPrompt.trim()}
        data-tour="decompose-btn"
        aria-busy={isDecomposing}
      >
        <Zap size={14} aria-hidden="true" />
        {isDecomposing ? t.promptInput.decomposing : t.promptInput.decompose}
      </button>
    </div>
  )
}

export default PromptInput
