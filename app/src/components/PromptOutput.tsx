import { useState, useCallback, useEffect } from 'react'
import { Clipboard, ClipboardCheck, FileText, Braces, Sparkles, Play, Send, Github, Zap, Bug, Scissors, Star as StarIcon } from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'
import { useFlowStore } from '@/store/flowStore'
import { useLocale } from '@/i18n/LocaleContext'
import { analytics } from '@/lib/analytics'
import { assemblePrompt } from '@/lib/assemblePrompt'
import { isExtension } from '@/lib/platform'
import { useMakeStore } from '@/store/makeStore'
import type { OutputFormat } from '@/types/blocks'
import CostPopover from '@/features/cost-estimator/CostPopover'
import { useDebuggerStore } from '@/features/debugger/useDebuggerStore'
import { useCompressorStore } from '@/features/compressor/useCompressorStore'
import { useCriticStore } from '@/features/critic/useCriticStore'
import { debugPrompt, compressPrompt, critiquePrompt } from '@/services/api'
import type { DebugResult } from '@/features/debugger/types'
import type { CompressResult } from '@/features/compressor/types'
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

  const { setOpen: openDebugger, setLoading: setDebugLoading, setResult: setDebugResult, setError: setDebugError } = useDebuggerStore()
  const { setOpen: openCompressor, setLoading: setCompressLoading, setResult: setCompressResult, setError: setCompressError, targetReduction } = useCompressorStore()
  const { setOpen: openCritic, setLoading: setCriticLoading, setResult: setCriticResult, setError: setCriticError } = useCriticStore()

  const handleDebug = async () => {
    if (!currentRaw) return
    openDebugger(true)
    setDebugLoading(true)
    setDebugError(null)
    try {
      const result = await debugPrompt(currentRaw, locale)
      setDebugResult(result as DebugResult)
    } catch {
      setDebugError('Debug failed. Please try again.')
    } finally {
      setDebugLoading(false)
    }
  }

  const handleCompress = async () => {
    if (!currentRaw) return
    openCompressor(true)
    setCompressLoading(true)
    setCompressError(null)
    try {
      const result = await compressPrompt(currentRaw, targetReduction, locale)
      setCompressResult(result as CompressResult)
    } catch (e) {
      console.error('[compress] error:', e)
      setCompressError('Compression failed. Please try again.')
    } finally {
      setCompressLoading(false)
    }
  }

  const handleCritic = async () => {
    if (!currentRaw) return
    openCritic(true)
    setCriticLoading(true)
    setCriticError(null)
    try {
      const result = await critiquePrompt(currentRaw, locale)
      setCriticResult(result as CriticResult)
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
              onClick={() => setOutputFormat(format)}
              title={title}
              aria-pressed={outputFormat === format}
            >
              {label}
            </button>
          </Tooltip>
        ))}
      </div>

      {currentRaw ? (
        <>
          <pre className="compiled-output">{currentRaw}</pre>
          <div className="export-actions">
            {/* Send to AI — only in the extension sidebar */}
            {isExtension && (
              <Tooltip content={t.promptOutput.injectLabel} side="top">
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
              </Tooltip>
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
              <Tooltip content={t.promptOutput.exportTxtLabel} side="top">
                <button
                  className="btn btn-secondary export-btn"
                  onClick={handleExportTxt}
                  title={t.promptOutput.exportTxtLabel}
                  aria-label={t.promptOutput.exportTxtLabel}
                >
                  <FileText size={13} aria-hidden="true" /> {t.promptOutput.exportTxt}
                </button>
              </Tooltip>
              <Tooltip content={t.promptOutput.exportJsonLabel} side="top">
                <button
                  className="btn btn-secondary export-btn"
                  onClick={handleExportJSON}
                  title={t.promptOutput.exportJsonLabel}
                  aria-label={t.promptOutput.exportJsonLabel}
                >
                  <Braces size={13} aria-hidden="true" /> {t.promptOutput.exportJson}
                </button>
              </Tooltip>
            </div>
            {!isExtension && (
              <div className="output-ide-actions">
                <Tooltip content={t.ide.outputButtons.debug} side="top">
                  <button className="btn btn-secondary export-btn" onClick={handleDebug} title={t.ide.outputButtons.debug}>
                    <Bug size={13} /> {t.ide.outputButtons.debug}
                  </button>
                </Tooltip>
                <Tooltip content={t.ide.outputButtons.compress} side="top">
                  <button className="btn btn-secondary export-btn" onClick={handleCompress} title={t.ide.outputButtons.compress}>
                    <Scissors size={13} /> {t.ide.outputButtons.compress}
                  </button>
                </Tooltip>
                <Tooltip content={t.ide.outputButtons.score} side="top">
                  <button className="btn btn-secondary export-btn" onClick={handleCritic} title={t.ide.outputButtons.score}>
                    <StarIcon size={13} /> {t.ide.outputButtons.score}
                  </button>
                </Tooltip>
              </div>
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
          aria-disabled={nodes.length === 0}
        >
          <Play size={14} aria-hidden="true" /> {t.promptOutput.compile}
        </button>
      )}

      {/* Send to Make.com */}
      {!isExtension && (
        <button
          className="make-open-btn"
          onClick={() => {
            openMakePanel(true)
            analytics.makePanelOpened()
          }}
          title={t.makeIntegration.openPanel}
        >
          <Zap size={13} aria-hidden="true" /> {t.makeIntegration.openPanel}
        </button>
      )}

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
    </div>
  )
}

export default PromptOutput
