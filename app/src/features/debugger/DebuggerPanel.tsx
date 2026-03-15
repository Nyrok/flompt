import { X, AlertCircle, AlertTriangle, Info, CheckCircle, Loader, Wand2 } from 'lucide-react'
import { useDebuggerStore } from './useDebuggerStore'
import { useLocale } from '@/i18n/LocaleContext'
import type { IssueSeverity } from './types'

function severityIcon(s: IssueSeverity) {
  if (s === 'error')   return <AlertCircle size={13} style={{ color: 'var(--error, #ef4444)' }} />
  if (s === 'warning') return <AlertTriangle size={13} style={{ color: '#f59e0b' }} />
  return <Info size={13} style={{ color: '#60a5fa' }} />
}

function scoreColor(score: number) {
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

interface Props {
  onApplyFix: (fixedPrompt: string) => void
}

export default function DebuggerPanel({ onApplyFix }: Props) {
  const { isOpen, isLoading, result, error, setOpen } = useDebuggerStore()
  const { t } = useLocale()
  const td = t.ide.debugger

  if (!isOpen) return null

  return (
    <>
      <div className="debugger-backdrop" onClick={() => setOpen(false)} />
      <aside className="debugger-panel" role="dialog" aria-label={td.title} aria-modal="true">
        <div className="debugger-header">
          <div className="debugger-brand">
            <AlertCircle size={15} />
            <span className="debugger-title">{td.title}</span>
          </div>
          <button className="ide-close-btn" onClick={() => setOpen(false)} aria-label={t.ide.close}>
            <X size={15} />
          </button>
        </div>

        <div className="debugger-body">
          {isLoading && (
            <div className="debugger-loading">
              <Loader size={20} className="spin" />
              <span>{td.loading}</span>
            </div>
          )}

          {error && !isLoading && (
            <div className="debugger-error">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {result && !isLoading && (
            <>
              <div className="debugger-score-row">
                <div className="debugger-score-gauge">
                  <span className="debugger-score-number" style={{ color: scoreColor(result.score) }}>
                    {result.score}
                  </span>
                  <span className="debugger-score-label">{td.scoreLabel}</span>
                </div>
                <div className="debugger-token-delta">
                  <span>{td.wordsBefore.replace('{n}', String(result.tokensBefore))}</span>
                  {result.tokensAfter < result.tokensBefore && (
                    <span className="debugger-token-saved">
                      {td.wordsSaved.replace('{n}', String(result.tokensBefore - result.tokensAfter))}
                    </span>
                  )}
                </div>
              </div>

              {result.issues.length === 0 ? (
                <div className="debugger-no-issues">
                  <CheckCircle size={16} style={{ color: '#22c55e' }} />
                  <span>{td.noIssues}</span>
                </div>
              ) : (
                <ul className="debugger-issues">
                  {result.issues.map((issue) => (
                    <li key={issue.id} className={`debugger-issue debugger-issue--${issue.severity}`}>
                      <div className="debugger-issue-header">
                        {severityIcon(issue.severity as IssueSeverity)}
                        <span className="debugger-issue-message">{issue.message}</span>
                      </div>
                      <p className="debugger-issue-suggestion">{issue.suggestion}</p>
                    </li>
                  ))}
                </ul>
              )}

              {result.improvements.length > 0 && (
                <div className="debugger-improvements">
                  <span className="debugger-section-label">{td.suggestions}</span>
                  <ul>
                    {result.improvements.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                className="debugger-apply-btn"
                onClick={() => { onApplyFix(result.fixedPrompt); setOpen(false) }}
              >
                <Wand2 size={13} /> {td.applyFix}
              </button>
            </>
          )}

          {!isLoading && !result && !error && (
            <div className="debugger-empty">{td.empty}</div>
          )}
        </div>
      </aside>
    </>
  )
}
