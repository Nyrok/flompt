import { useState, useCallback, useEffect } from 'react'
import { Clipboard, ClipboardCheck, FileText, Braces, Sparkles, Play, Send, Github } from 'lucide-react'
import { useFlowStore } from '@/store/flowStore'
import { useLocale } from '@/i18n/LocaleContext'
import { analytics } from '@/lib/analytics'
import { assemblePrompt } from '@/lib/assemblePrompt'
import { isExtension } from '@/lib/platform'
import { STAR_EVENT } from '@/components/StarPopup'
import type { OutputFormat } from '@/types/blocks'

// ─── Selection button config ─────────────────────────────────────────────────
const FORMAT_OPTIONS: Array<{ format: OutputFormat; label: string; title: string }> = [
  { format: 'claude',  label: 'Claude',  title: 'XML — Claude-optimized' },
  { format: 'chatgpt', label: 'ChatGPT', title: 'Markdown — ChatGPT-optimized' },
  { format: 'gemini',  label: 'Gemini',  title: 'Markdown — Gemini-optimized' },
]

// ─── Component ────────────────────────────────────────────────────────────────

const PromptOutput = () => {
  const { nodes, edges, compiledPrompt, setCompiledPrompt, outputFormat, setOutputFormat } = useFlowStore()
  const { t } = useLocale()
  const [copied,   setCopied]   = useState(false)
  const [injected, setInjected] = useState(false)

  // ── In extension mode: auto-select the format from the platform ───────────
  useEffect(() => {
    if (!isExtension) return
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'FLOMPT_PLATFORM_INFO') return
      const fmt = event.data.format as OutputFormat | undefined
      if (fmt && (fmt === 'claude' || fmt === 'chatgpt' || fmt === 'gemini')) {
        setOutputFormat(fmt)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [setOutputFormat])

  // ── Text displayed for the selected platform ──────────────────────────────
  // Guard for legacy persisted compiledPrompt (pre-migration format without .formats)
  const currentRaw: string | null = compiledPrompt?.formats?.[outputFormat] ?? null

  const handleCompile = () => {
    if (nodes.length === 0) return
    analytics.compileClicked()
    // Generate all 3 formats in a single pass
    const result = assemblePrompt(nodes, edges)
    setCompiledPrompt(result)
    analytics.compileCompleted(result.tokenEstimate)
    window.dispatchEvent(new CustomEvent(STAR_EVENT))
  }

  const handleCopy = () => {
    if (!currentRaw) return
    navigator.clipboard.writeText(currentRaw).then(() => {
      setCopied(true)
      analytics.promptCopied()
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleExportTxt = () => {
    if (!currentRaw) return
    const blob = new Blob([currentRaw], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'flompt-prompt.txt'; a.click()
    URL.revokeObjectURL(url)
    analytics.promptExported('txt')
  }

  const handleExportJSON = () => {
    const data = { nodes, edges, compiledPrompt, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'flompt-session.json'; a.click()
    URL.revokeObjectURL(url)
    analytics.promptExported('json')
  }

  /** Sends the compiled prompt (current format) to the extension content script */
  const handleInjectToAI = useCallback(() => {
    if (!currentRaw) return
    window.parent.postMessage({ type: 'FLOMPT_INJECT', prompt: currentRaw }, '*')
    setInjected(true)
    analytics.promptCopied()
    window.dispatchEvent(new CustomEvent(STAR_EVENT))
    setTimeout(() => setInjected(false), 2500)
  }, [currentRaw])


  return (
    <div className="prompt-output-panel">
      <div className="output-header">
        <h2 className="panel-title">{t.promptOutput.title}</h2>
        {compiledPrompt && (
          <span className="token-badge">~{compiledPrompt.tokenEstimate} tokens</span>
        )}
      </div>

      {/* Target platform selector — switches the display without recompiling */}
      <div className="format-selector" role="group" aria-label="Target AI platform">
        {FORMAT_OPTIONS.map(({ format, label, title }) => (
          <button
            key={format}
            className={`format-btn${outputFormat === format ? ' format-btn-active' : ''}`}
            onClick={() => setOutputFormat(format)}
            title={title}
            aria-pressed={outputFormat === format}
          >
            {label}
          </button>
        ))}
      </div>

      {currentRaw ? (
        <>
          <pre className="compiled-output">{currentRaw}</pre>
          <div className="export-actions">
            {/* Send to AI — only in the extension sidebar */}
            {isExtension && (
              <button
                className={`btn btn-primary export-inject${injected ? ' injected' : ''}`}
                onClick={handleInjectToAI}
                title={t.promptOutput.injectLabel}
                aria-label={injected ? t.promptOutput.injectedLabel : t.promptOutput.injectLabel}
                aria-live="polite"
              >
                {injected
                  ? <><ClipboardCheck size={13} aria-hidden="true" /> {t.promptOutput.injected}</>
                  : <><Send size={13} aria-hidden="true" /> {t.promptOutput.sendToAI}</>
                }
              </button>
            )}
            <button
              className="btn btn-secondary export-copy"
              onClick={handleCopy}
              aria-live="polite"
              aria-atomic="true"
            >
              {copied
                ? <><ClipboardCheck size={13} aria-hidden="true" /> {t.promptOutput.copied}</>
                : <><Clipboard size={13} aria-hidden="true" /> {t.promptOutput.copy}</>
              }
            </button>
            <div className="export-row2">
              <button
                className="btn btn-secondary export-btn"
                onClick={handleExportTxt}
                title={t.promptOutput.exportTxtLabel}
                aria-label={t.promptOutput.exportTxtLabel}
              >
                <FileText size={13} aria-hidden="true" /> {t.promptOutput.exportTxt}
              </button>
              <button
                className="btn btn-secondary export-btn"
                onClick={handleExportJSON}
                title={t.promptOutput.exportJsonLabel}
                aria-label={t.promptOutput.exportJsonLabel}
              >
                <Braces size={13} aria-hidden="true" /> {t.promptOutput.exportJson}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="output-placeholder">
          <Sparkles size={28} className="output-placeholder-icon" />
          <span>{t.promptOutput.placeholder.split('\\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}</span>
        </div>
      )}

      {compiledPrompt === null && (
        <button
          className="btn btn-primary"
          onClick={handleCompile}
          disabled={nodes.length === 0}
          data-tour="compile-btn"
          aria-disabled={nodes.length === 0}
        >
          <Play size={14} aria-hidden="true" /> {t.promptOutput.compile}
        </button>
      )}

      <a
        className="btn btn-secondary btn-share"
        href="https://github.com/Nyrok/flompt"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
      >
        <Github size={13} aria-hidden="true" /> View source code
      </a>
    </div>
  )
}

export default PromptOutput
