import { useState } from 'react'
import { X, History, RotateCcw, GitCompare, Trash2, Save, Clock } from 'lucide-react'
import { useVersionStore } from './useVersionStore'
import type { PromptVersion } from '@/lib/db'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

interface Props {
  projectId: string
}

export default function VersionHistory({ projectId }: Props) {
  const { versions, isOpen, diffView, setOpen, save, rollback, showDiff, closeDiff, remove } = useVersionStore()
  const [message, setMessage] = useState('')
  const [compareA, setCompareA] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    setSaving(true)
    await save(projectId, message.trim() || undefined)
    setMessage('')
    setSaving(false)
  }

  const handleCompareSelect = (id: string) => {
    if (!compareA) {
      setCompareA(id)
    } else {
      showDiff(compareA, id)
      setCompareA(null)
    }
  }

  return (
    <>
      <div className="debugger-backdrop" onClick={() => { setOpen(false); closeDiff() }} />
      <aside className="version-panel" role="dialog" aria-label="Version History" aria-modal="true">
        <div className="debugger-header">
          <div className="debugger-brand">
            <History size={15} />
            <span className="debugger-title">Version History</span>
          </div>
          <button className="make-close-btn" onClick={() => { setOpen(false); closeDiff() }} aria-label="Close">
            <X size={14} />
          </button>
        </div>

        <div className="version-save-row">
          <input
            className="make-webhook-input"
            style={{ flex: 1, fontSize: 12 }}
            placeholder="Version message (optional)"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <button className="debugger-apply-btn" style={{ margin: 0, whiteSpace: 'nowrap' }} onClick={handleSave} disabled={saving}>
            <Save size={12} /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        {compareA && (
          <div className="version-compare-hint">
            <GitCompare size={12} /> Select second version to compare
          </div>
        )}

        {diffView && (
          <div className="version-diff">
            <div className="version-diff-header">
              <span className="debugger-section-label">Diff</span>
              <button className="make-close-btn" onClick={closeDiff}><X size={12} /></button>
            </div>
            <div className="version-diff-body">
              {diffView.lines.map((line, i) => (
                <div key={i} className={`diff-line diff-line--${line.type}`}>
                  <span className="diff-line-num">{line.lineNumberBefore ?? ' '}</span>
                  <span className="diff-line-num">{line.lineNumberAfter ?? ' '}</span>
                  <span className="diff-line-marker">
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                  </span>
                  <span className="diff-line-content">{line.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="version-list">
          {versions.length === 0 && (
            <div className="debugger-empty">No saved versions yet.</div>
          )}
          {versions.map((v: PromptVersion) => (
            <div key={v.id} className={`version-item${compareA === v.id ? ' version-item--selected' : ''}`}>
              <div className="version-item-header">
                <span className="version-item-label">{v.label}</span>
                <span className="version-item-time"><Clock size={10} /> {timeAgo(v.createdAt)}</span>
              </div>
              {v.tokenCount > 0 && (
                <span className="version-item-tokens">{v.tokenCount} tokens</span>
              )}
              <div className="version-item-actions">
                <button className="btn btn-secondary export-btn" style={{ fontSize: 10, padding: '2px 6px' }} title="Rollback to this version" onClick={() => rollback(v)}>
                  <RotateCcw size={10} /> Restore
                </button>
                <button className="btn btn-secondary export-btn" style={{ fontSize: 10, padding: '2px 6px' }} title="Compare" onClick={() => handleCompareSelect(v.id)}>
                  <GitCompare size={10} /> Compare
                </button>
                <button className="make-close-btn" title="Delete version" onClick={() => remove(v.id)}>
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
