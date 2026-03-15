import { X, Scissors, Trash2, GitMerge, Loader } from 'lucide-react'
import { useCompressorStore } from './useCompressorStore'
import type { CompressChange } from './types'

function changeIcon(type: CompressChange['type']) {
  if (type === 'removed') return <Trash2 size={11} style={{ color: '#ef4444' }} />
  if (type === 'optimized') return <Scissors size={11} style={{ color: '#f59e0b' }} />
  return <GitMerge size={11} style={{ color: '#60a5fa' }} />
}

interface Props {
  onApply: (compressed: string) => void
}

export default function CompressorModal({ onApply }: Props) {
  const { isOpen, isLoading, result, error, targetReduction, setOpen, setTargetReduction } = useCompressorStore()

  if (!isOpen) return null

  const reductionOptions = [
    { value: 0.3, label: '30%' },
    { value: 0.5, label: '50%' },
    { value: 0.7, label: '70%' },
  ]

  return (
    <div className="compressor-overlay" role="dialog" aria-modal="true" aria-label="Prompt Compressor">
      <div className="compressor-backdrop" onClick={() => setOpen(false)} />
      <div className="compressor-modal">
        <div className="compressor-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Scissors size={15} />
            <span className="compressor-title">Prompt Compressor</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="compressor-target-row">
              <span className="debugger-section-label">Target reduction:</span>
              {reductionOptions.map(opt => (
                <button
                  key={opt.value}
                  className={`format-btn${targetReduction === opt.value ? ' format-btn-active' : ''}`}
                  onClick={() => setTargetReduction(opt.value)}
                  style={{ padding: '2px 8px', fontSize: 11 }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button className="make-close-btn" onClick={() => setOpen(false)} aria-label="Close">
              <X size={14} />
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="debugger-loading" style={{ padding: 40 }}>
            <Loader size={20} className="spin" />
            <span>Compressing…</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="debugger-error" style={{ margin: 16 }}>{error}</div>
        )}

        {result && !isLoading && (
          <div className="compressor-body">
            <div className="compressor-stats">
              <div className="compressor-stat">
                <span className="compressor-stat-label">Before</span>
                <span className="compressor-stat-value">{result.tokensBefore} words</span>
              </div>
              <div className="compressor-stat">
                <span className="compressor-stat-label">After</span>
                <span className="compressor-stat-value" style={{ color: '#22c55e' }}>{result.tokensAfter} words</span>
              </div>
              <div className="compressor-stat">
                <span className="compressor-stat-label">Saved</span>
                <span className="compressor-stat-value" style={{ color: '#22c55e' }}>-{result.reductionPercent}%</span>
              </div>
            </div>

            <div className="compressor-columns">
              <div className="compressor-col">
                <span className="debugger-section-label">Original</span>
                <pre className="compressor-pre">{result.changes.map(c => c.original).join('\n') || '(no changes)'}</pre>
              </div>
              <div className="compressor-col">
                <span className="debugger-section-label">Compressed prompt</span>
                <pre className="compressor-pre">{result.compressedPrompt}</pre>
              </div>
            </div>

            {result.changes.length > 0 && (
              <div className="compressor-changes">
                <span className="debugger-section-label">Changes ({result.changes.length})</span>
                <ul className="compressor-change-list">
                  {result.changes.map((c, i) => (
                    <li key={i} className="compressor-change-item">
                      {changeIcon(c.type)}
                      <span className="compressor-change-type">{c.type}</span>
                      <span className="compressor-change-reason">{c.reason}</span>
                      <span className="compressor-change-saved">-{c.tokensSaved}w</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              className="debugger-apply-btn"
              style={{ margin: '12px 16px 16px' }}
              onClick={() => { onApply(result.compressedPrompt); setOpen(false) }}
            >
              Apply Compressed Prompt
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
