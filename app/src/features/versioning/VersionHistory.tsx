import { useState } from 'react'
import { X, History, RotateCcw, GitCompare, Trash2, Save, Clock } from 'lucide-react'
import { useVersionStore } from './useVersionStore'
import { useLocale } from '@/i18n/LocaleContext'
import type { PromptVersion } from '@/lib/db'

function timeAgo(iso: string, tv: typeof import('@/i18n/translations').translations['en']['ide']['versioning']): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return tv.justNow
  if (mins < 60) return tv.minsAgo.replace('{n}', String(mins))
  const hours = Math.floor(mins / 60)
  if (hours < 24) return tv.hoursAgo.replace('{n}', String(hours))
  return tv.daysAgo.replace('{n}', String(Math.floor(hours / 24)))
}

interface Props {
  projectId: string
}

export default function VersionHistory({ projectId }: Props) {
  const { versions, isOpen, diffView, setOpen, save, rollback, showDiff, closeDiff, remove } = useVersionStore()
  const { t } = useLocale()
  const tv = t.ide.versioning
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
      <aside className="version-panel" role="dialog" aria-label={tv.title} aria-modal="true">
        <div className="debugger-header">
          <div className="debugger-brand">
            <History size={15} />
            <span className="debugger-title">{tv.title}</span>
          </div>
          <button className="ide-close-btn" onClick={() => { setOpen(false); closeDiff() }} aria-label={t.ide.close}>
            <X size={15} />
          </button>
        </div>

        <div className="version-save-row">
          <input
            className="make-webhook-input"
            style={{ flex: 1, fontSize: 12 }}
            placeholder={tv.messagePlaceholder}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <button className="debugger-apply-btn" style={{ margin: 0, whiteSpace: 'nowrap' }} onClick={handleSave} disabled={saving}>
            <Save size={12} /> {saving ? tv.saving : tv.save}
          </button>
        </div>

        {compareA && (
          <div className="version-compare-hint">
            <GitCompare size={12} /> {tv.compareHint}
          </div>
        )}

        {diffView && (
          <div className="version-diff">
            <div className="version-diff-header">
              <span className="debugger-section-label">{tv.diff}</span>
              <button className="ide-close-btn" style={{ width: 26, height: 26 }} onClick={closeDiff}>
                <X size={12} />
              </button>
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
            <div className="debugger-empty">{tv.noVersions}</div>
          )}
          {versions.map((v: PromptVersion) => (
            <div key={v.id} className={`version-item${compareA === v.id ? ' version-item--selected' : ''}`}>
              <div className="version-item-header">
                <span className="version-item-label">{v.label}</span>
                <span className="version-item-time"><Clock size={10} /> {timeAgo(v.createdAt, tv)}</span>
              </div>
              {v.tokenCount > 0 && (
                <span className="version-item-tokens">{v.tokenCount} tokens</span>
              )}
              <div className="version-item-actions">
                <button className="ide-action-btn" title={tv.restore} onClick={() => rollback(v)}>
                  <RotateCcw size={10} /> {tv.restore}
                </button>
                <button className="ide-action-btn" title={tv.compare} onClick={() => handleCompareSelect(v.id)}>
                  <GitCompare size={10} /> {tv.compare}
                </button>
                <button className="ide-action-btn ide-action-btn--danger" title="Delete" onClick={() => remove(v.id)}>
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
