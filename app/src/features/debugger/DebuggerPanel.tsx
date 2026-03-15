import { X, AlertCircle, AlertTriangle, Info, CheckCircle, Loader, Wand2 } from 'lucide-react'
import { useDebuggerStore } from './useDebuggerStore'
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

  if (!isOpen) return null

  return (
    <>
      <div className="debugger-backdrop" onClick={() => setOpen(false)} />
      <aside className="debugger-panel" role="dialog" aria-label="Prompt Debugger" aria-modal="true">
        <div className="debugger-header">
          <div className="debugger-brand">
            <AlertCircle size={15} />
            <span className="debugger-title">Prompt Debugger</span>
          </div>
          <button className="make-close-btn" onClick={() => setOpen(false)} aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <div className="debugger-body">
          {isLoading && (
            <div className="debugger-loading">
              <Loader size={20} className="spin" />
              <span>Analyzing your prompt…</span>
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
                <div className="debugger-score-gauge" style={{ '--score-color': scoreColor(result.score) } as React.CSSProperties}>
                  <span className="debugger-score-number" style={{ color: scoreColor(result.score) }}>
                    {result.score}
                  </span>
                  <span className="debugger-score-label">/ 100</span>
                </div>
                <div className="debugger-token-delta">
                  <span>Before: {result.tokensBefore} words</span>
                  {result.tokensAfter < result.tokensBefore && (
                    <span className="debugger-token-saved">
                      Fix saves ~{result.tokensBefore - result.tokensAfter} words
                    </span>
                  )}
                </div>
              </div>

              {result.issues.length === 0 ? (
                <div className="debugger-no-issues">
                  <CheckCircle size={16} style={{ color: '#22c55e' }} />
                  <span>No issues detected — great prompt!</span>
                </div>
              ) : (
                <ul className="debugger-issues">
                  {result.issues.map((issue) => (
                    <li key={issue.id} className={`debugger-issue debugger-issue--${issue.severity}`}>
                      <div className="debugger-issue-header">
                        {severityIcon(issue.severity)}
                        <span className="debugger-issue-message">{issue.message}</span>
                      </div>
                      <p className="debugger-issue-suggestion">{issue.suggestion}</p>
                    </li>
                  ))}
                </ul>
              )}

              {result.improvements.length > 0 && (
                <div className="debugger-improvements">
                  <span className="debugger-section-label">Suggestions</span>
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
                <Wand2 size={13} /> Apply Fixed Prompt
              </button>
            </>
          )}

          {!isLoading && !result && !error && (
            <div className="debugger-empty">
              Click "Debug" in the Result panel to analyze your prompt.
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
