import { useState, useCallback } from 'react'
import { Clipboard, ClipboardCheck, FileText, Braces, Sparkles, Play, Share2, Send } from 'lucide-react'
import { useFlowStore } from '@/store/flowStore'
import { useLocale } from '@/i18n/LocaleContext'
import { analytics } from '@/lib/analytics'
import { assemblePrompt } from '@/lib/assemblePrompt'
import { isExtension } from '@/lib/platform'

// ─── Composant ────────────────────────────────────────────────────────────────

const PromptOutput = () => {
  const { nodes, edges, compiledPrompt, setCompiledPrompt } = useFlowStore()
  const { t } = useLocale()
  const [copied,   setCopied]   = useState(false)
  const [injected, setInjected] = useState(false)

  const handleCompile = () => {
    if (nodes.length === 0) return
    analytics.compileClicked()
    const result = assemblePrompt(nodes, edges)
    setCompiledPrompt(result)
    analytics.compileCompleted(result.tokenEstimate)
  }

  const handleCopy = () => {
    if (!compiledPrompt) return
    navigator.clipboard.writeText(compiledPrompt.raw).then(() => {
      setCopied(true)
      analytics.promptCopied()
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleExportTxt = () => {
    if (!compiledPrompt) return
    const blob = new Blob([compiledPrompt.raw], { type: 'text/plain' })
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

  /** Envoie le prompt compilé vers le content script de l'extension */
  const handleInjectToAI = useCallback(() => {
    if (!compiledPrompt) return
    window.parent.postMessage({ type: 'FLOMPT_INJECT', prompt: compiledPrompt.raw }, '*')
    setInjected(true)
    analytics.promptCopied()
    setTimeout(() => setInjected(false), 2500)
  }, [compiledPrompt])

  const handleShare = async () => {
    const shareData = {
      title: 'flompt — Visual AI Prompt Builder',
      text:  'Check out flompt! Turn any AI prompt into a visual flow. Free & open-source.',
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

      {compiledPrompt ? (
        <>
          <pre className="compiled-output">{compiledPrompt.raw}</pre>
          <div className="export-actions">
            {/* Send to AI — uniquement dans la sidebar extension */}
            {isExtension && (
              <button
                className={`btn btn-primary export-inject${injected ? ' injected' : ''}`}
                onClick={handleInjectToAI}
                title="Inject this prompt into the AI chat input"
                aria-label={injected ? 'Prompt injected!' : 'Send prompt to AI chat input'}
                aria-live="polite"
              >
                {injected
                  ? <><ClipboardCheck size={13} aria-hidden="true" /> Injected!</>
                  : <><Send size={13} aria-hidden="true" /> Send to AI</>
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
                title={`${t.promptOutput.exportTxt} — Export as text file`}
                aria-label={`Export as .txt file`}
              >
                <FileText size={13} aria-hidden="true" /> {t.promptOutput.exportTxt}
              </button>
              <button
                className="btn btn-secondary export-btn"
                onClick={handleExportJSON}
                title={`${t.promptOutput.exportJson} — Export as JSON file`}
                aria-label={`Export as .json file`}
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
