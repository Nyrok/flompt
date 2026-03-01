import { useState, useCallback, useEffect } from 'react'
import { Clipboard, ClipboardCheck, FileText, Braces, Sparkles, Play, Share2, Send } from 'lucide-react'
import { useFlowStore } from '@/store/flowStore'
import { useLocale } from '@/i18n/LocaleContext'
import { analytics } from '@/lib/analytics'
import { assemblePrompt } from '@/lib/assemblePrompt'
import { isExtension } from '@/lib/platform'
import { STAR_EVENT } from '@/components/StarPopup'
import type { OutputFormat } from '@/types/blocks'

// ─── Config des boutons de sélection ────────────────────────────────────────
const FORMAT_OPTIONS: Array<{ format: OutputFormat; label: string; title: string }> = [
  { format: 'claude',  label: 'Claude',  title: 'XML — Claude-optimized' },
  { format: 'chatgpt', label: 'ChatGPT', title: 'Markdown — ChatGPT-optimized' },
  { format: 'gemini',  label: 'Gemini',  title: 'Markdown — Gemini-optimized' },
]

// ─── Composant ────────────────────────────────────────────────────────────────

const PromptOutput = () => {
  const { nodes, edges, compiledPrompt, setCompiledPrompt, outputFormat, setOutputFormat } = useFlowStore()
  const { t } = useLocale()
  const [copied,   setCopied]   = useState(false)
  const [injected, setInjected] = useState(false)

  // ── En mode extension : auto-sélectionner le format depuis la plateforme ──
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

  // ── Texte affiché pour la plateforme sélectionnée ─────────────────────────
  // Guard pour les anciens compiledPrompt persistés (format pré-migration sans .formats)
  const currentRaw: string | null = compiledPrompt?.formats?.[outputFormat] ?? null

  const handleCompile = () => {
    if (nodes.length === 0) return
    analytics.compileClicked()
    // Génère les 3 formats en une seule passe
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

  /** Envoie le prompt compilé (format courant) vers le content script de l'extension */
  const handleInjectToAI = useCallback(() => {
    if (!currentRaw) return
    window.parent.postMessage({ type: 'FLOMPT_INJECT', prompt: currentRaw }, '*')
    setInjected(true)
    analytics.promptCopied()
    setTimeout(() => setInjected(false), 2500)
  }, [currentRaw])

  const handleShare = async () => {
    const shareData = {
      title: t.promptOutput.shareTitle,
      text:  t.promptOutput.shareText,
      url:   'https://flompt.dev',
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch { /* user cancelled */ }
  }

  return (
    <div className="prompt-output-panel">
      <div className="output-header">
        <h2 className="panel-title">{t.promptOutput.title}</h2>
        {compiledPrompt && (
          <span className="token-badge">~{compiledPrompt.tokenEstimate} tokens</span>
        )}
      </div>

      {/* Sélecteur de plateforme cible — switche l'affichage sans recompiler */}
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
            {/* Send to AI — uniquement dans la sidebar extension */}
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

      <button
        className="btn btn-primary"
        onClick={handleCompile}
        disabled={nodes.length === 0}
        data-tour="compile-btn"
        aria-disabled={nodes.length === 0}
      >
        <Play size={14} aria-hidden="true" /> {t.promptOutput.compile}
      </button>

      <button className="btn btn-secondary btn-share" onClick={handleShare} aria-label={t.promptOutput.share}>
        <Share2 size={13} aria-hidden="true" /> {t.promptOutput.share}
      </button>
    </div>
  )
}

export default PromptOutput
