import { useState, useCallback, useEffect, useRef } from 'react'
import { Clipboard, ClipboardCheck, Sparkles, Play, Send, Github, Zap, Star as StarIcon, Download, ChevronDown, FileText, Braces } from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'
import { useFlowStore } from '@/store/flowStore'
import { useLocale } from '@/i18n/LocaleContext'
import { analytics } from '@/lib/analytics'
import { assemblePrompt } from '@/lib/assemblePrompt'
import { isExtension } from '@/lib/platform'
import { useMakeStore } from '@/store/makeStore'
import type { OutputFormat } from '@/types/blocks'
import CostPopover from '@/features/cost-estimator/CostPopover'
import { useCriticStore } from '@/features/critic/useCriticStore'
import { critiquePrompt } from '@/services/api'
import type { CriticResult } from '@/features/critic/types'

// ─── Selection button config ─────────────────────────────────────────────────
const FORMAT_OPTIONS: Array<{ format: OutputFormat; label: string; title: string }> = [
  { format: 'claude',  label: 'Claude',  title: 'XML — Claude-optimized' },
  { format: 'chatgpt', label: 'ChatGPT', title: 'Markdown — ChatGPT-optimized' },
  { format: 'gemini',  label: 'Gemini',  title: 'Markdown — Gemini-optimized' },
]

// ─── Component ────────────────────────────────────────────────────────────────

const PromptOutput = () => {
  const { nodes, edges, compiledPrompt, setCompiledPrompt, outputFormat, setOutputFormat } = useFlowStore()
  const { t, locale } = useLocale()
  const { setIsPanelOpen: openMakePanel } = useMakeStore()
  const [copied,      setCopied]      = useState(false)
  const [injected,    setInjected]    = useState(false)
  const [exportOpen,  setExportOpen]  = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

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

  // ── Close export dropdown on outside click ────────────────────────────────
  useEffect(() => {
    if (!exportOpen) return
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [exportOpen])

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
    // Track compile count for extension popup trigger
    try {
      const count = parseInt(localStorage.getItem('flompt-compile-count') || '0') + 1
      localStorage.setItem('flompt-compile-count', String(count))
      window.dispatchEvent(new CustomEvent('flompt:compiled', { detail: { count } }))
    } catch { /* noop */ }
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

  const {
    setOpen: openCritic,
    setLoading: setCriticLoading,
    setResult: setCriticResult,
    setError: setCriticError,
    result: criticResult,
    cachedForPrompt: criticCachedPrompt,
    setCachedForPrompt: setCriticCachedPrompt,
  } = useCriticStore()

  const handleCritic = async () => {
    if (!currentRaw) return
    analytics.scoreOpened()
    // Reuse cached result if prompt hasn't changed
    if (criticResult && criticCachedPrompt === currentRaw) {
      openCritic(true)
      return
    }
    openCritic(true)
    setCriticLoading(true)
    setCriticError(null)
    try {
      const result = await critiquePrompt(currentRaw, locale)
      setCriticResult(result as CriticResult)
      setCriticCachedPrompt(currentRaw)
    } catch {
      setCriticError('Evaluation failed. Please try again.')
    } finally {
      setCriticLoading(false)
    }
  }

  /** Sends the compiled prompt (current format) to the extension content script */
  const handleInjectToAI = useCallback(() => {
    if (!currentRaw) return
    window.parent.postMessage({ type: 'FLOMPT_INJECT', prompt: currentRaw }, '*')
    setInjected(true)
    analytics.promptCopied()
    setTimeout(() => setInjected(false), 2500)
  }, [currentRaw])


  return (
    <div className="prompt-output-panel">
      <div className="output-header">
        <h2 className="panel-title">{t.promptOutput.title}</h2>
        {compiledPrompt && (
          <CostPopover tokens={compiledPrompt.tokenEstimate} />
        )}
      </div>

      {/* Target platform selector — switches the display without recompiling */}
      <div className="format-selector" role="group" aria-label="Target AI platform">
        {FORMAT_OPTIONS.map(({ format, label, title }) => (
          <Tooltip key={format} content={title} side="top">
            <button
              className={`format-btn${outputFormat === format ? ' format-btn-active' : ''}`}
              onClick={() => { setOutputFormat(format); analytics.outputFormatChanged(format) }}
              aria-label={title}
              aria-pressed={outputFormat === format}
            >
              {label}
            </button>
          </Tooltip>
        ))}
      </div>

      {currentRaw ? (
        <>
          <pre className="compiled-output" aria-live="polite" aria-label={t.promptOutput.title}>{currentRaw}</pre>
          <div className="export-actions">

            {/* Send to AI — only in the extension sidebar */}
            {isExtension && (
              <Tooltip content={t.promptOutput.injectLabel} side="top">
                <button
                  className={`btn btn-primary export-inject${injected ? ' injected' : ''}`}
                  onClick={handleInjectToAI}
                  aria-label={injected ? t.promptOutput.injectedLabel : t.promptOutput.injectLabel}
                  aria-live="polite"
                >
                  {injected
                    ? <><ClipboardCheck size={13} aria-hidden="true" /> {t.promptOutput.injected}</>
                    : <><Send size={13} aria-hidden="true" /> {t.promptOutput.sendToAI}</>
                  }
                </button>
              </Tooltip>
            )}

            {/* Copy to Clipboard */}
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

            {/* Export dropdown */}
            <div className="export-dropdown" ref={exportRef}>
              <button
                className="btn btn-secondary export-dropdown-trigger"
                onClick={() => setExportOpen(o => !o)}
                aria-haspopup="true"
                aria-expanded={exportOpen}
                aria-label={t.promptOutput.exportLabel}
              >
                <Download size={13} aria-hidden="true" />
                {t.promptOutput.exportLabel}
                <ChevronDown size={11} className={`export-chevron${exportOpen ? ' open' : ''}`} aria-hidden="true" />
              </button>
              {exportOpen && (
                <div className="export-dropdown-menu" role="menu">
                  <button
                    className="export-dropdown-item"
                    role="menuitem"
                    onClick={() => { handleExportTxt(); setExportOpen(false) }}
                  >
                    <FileText size={13} aria-hidden="true" /> {t.promptOutput.exportTxt}
                  </button>
                  <button
                    className="export-dropdown-item"
                    role="menuitem"
                    onClick={() => { handleExportJSON(); setExportOpen(false) }}
                  >
                    <Braces size={13} aria-hidden="true" /> {t.promptOutput.exportJson}
                  </button>
                </div>
              )}
            </div>

            {/* ── Analysis section ──────────────────────────────────────── */}
            {!isExtension && (
              <>
                <div className="output-section-divider" aria-hidden="true">
                  <span>{t.promptOutput.sectionAnalysis}</span>
                </div>
                <Tooltip content={t.ide.outputButtons.score} side="top">
                  <button className="btn btn-secondary export-btn" onClick={handleCritic} aria-label={t.ide.outputButtons.score} style={{ width: '100%' }} data-tour="ide-tools">
                    <StarIcon size={13} aria-hidden="true" /> {t.ide.outputButtons.score}
                  </button>
                </Tooltip>

                {/* ── Third party section ──────────────────────────────── */}
                <div className="output-section-divider" aria-hidden="true">
                  <span>{t.promptOutput.sectionThirdParty}</span>
                </div>
                <button
                  className="make-open-btn"
                  onClick={() => {
                    openMakePanel(true)
                    analytics.makePanelOpened()
                  }}
                  aria-label={t.makeIntegration.openPanel}
                >
                  <Zap size={13} aria-hidden="true" /> {t.makeIntegration.openPanel}
                </button>
                <a
                  className="btn btn-secondary btn-share"
                  href="https://github.com/Nyrok/flompt"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  onClick={() => analytics.githubClicked('prompt_output')}
                >
                  <Github size={13} aria-hidden="true" /> View on GitHub
                </a>
              </>
            )}

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
        >
          <Play size={14} aria-hidden="true" /> {t.promptOutput.compile}
        </button>
      )}

      {/* Extension: always show GitHub link */}
      {isExtension && (
        <a
          className="btn btn-secondary btn-share"
          href="https://github.com/Nyrok/flompt"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          onClick={() => analytics.githubClicked('prompt_output')}
        >
          <Github size={13} aria-hidden="true" /> View on GitHub
        </a>
      )}

    </div>
  )
}

export default PromptOutput
