import { useState } from 'react'
import { X, Wand2, Copy, CheckCircle, Loader } from 'lucide-react'
import { useSystemPromptStore } from './useSystemPromptStore'

const SECTION_COLORS: Record<string, string> = {
  SYSTEM:        '#c084fc',
  ROLE:          '#93c5fd',
  CONTEXT:       '#94a3b8',
  OBJECTIVE:     '#fbbf24',
  CONSTRAINTS:   '#fb7185',
  OUTPUT_FORMAT: '#ff6b9d',
}

interface Props {
  onApplyToCanvas: (sections: Array<{ name: string; content: string }>) => void
}

export default function SystemPromptModal({ onApplyToCanvas }: Props) {
  const { isOpen, isLoading, result, error, editedSections, setOpen, updateSection } = useSystemPromptStore()
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = () => {
    const full = editedSections.map(s => `## ${s.name}\n${s.content}`).join('\n\n')
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="compressor-overlay" role="dialog" aria-modal="true" aria-label="System Prompt Generator">
      <div className="compressor-backdrop" onClick={() => setOpen(false)} />
      <div className="compressor-modal" style={{ maxWidth: 700 }}>
        <div className="compressor-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wand2 size={15} />
            <span className="compressor-title">System Prompt Generator</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {result && !isLoading && (
              <>
                <button className="btn btn-secondary export-btn" style={{ fontSize: 11 }} onClick={handleCopy}>
                  {copied ? <><CheckCircle size={11} /> Copied!</> : <><Copy size={11} /> Copy all</>}
                </button>
                <button className="debugger-apply-btn" style={{ margin: 0 }} onClick={() => { onApplyToCanvas(editedSections); setOpen(false) }}>
                  Apply to canvas
                </button>
              </>
            )}
            <button className="make-close-btn" onClick={() => setOpen(false)} aria-label="Close">
              <X size={14} />
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="debugger-loading" style={{ padding: 40 }}>
            <Loader size={20} className="spin" />
            <span>Generating system prompt…</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="debugger-error" style={{ margin: 16 }}>{error}</div>
        )}

        {editedSections.length > 0 && !isLoading && (
          <div className="sysprompt-sections">
            {editedSections.map(s => (
              <div key={s.name} className="sysprompt-section">
                <div className="sysprompt-section-label" style={{ '--section-color': SECTION_COLORS[s.name] ?? '#888' } as React.CSSProperties}>
                  {s.name}
                </div>
                <textarea
                  className="sysprompt-textarea"
                  value={s.content}
                  onChange={e => updateSection(s.name, e.target.value)}
                  rows={4}
                />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !result && !error && (
          <div className="debugger-empty" style={{ padding: 32 }}>
            Click "Generate System Prompt" in the Prompt input to get started.
          </div>
        )}
      </div>
    </div>
  )
}
