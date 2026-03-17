import { useState } from 'react'
import { X, CheckCircle2, XCircle, Plus, ShieldCheck } from 'lucide-react'
import { useAuditStore } from './useAuditStore'
import { useFlowStore } from '@/store/flowStore'
import { useLocale } from '@/i18n/LocaleContext'
import { BLOCK_META, DEFAULT_RESPONSE_STYLE, generateResponseStyleContent } from '@/types/blocks'
import type { BlockType, FlomptNode } from '@/types/blocks'

function scoreColor(score: number): string {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Good'
  if (score >= 60) return 'Needs work'
  return 'Incomplete'
}

export default function AuditPanel() {
  const { isOpen, result, setOpen } = useAuditStore()
  const { addNode, nodes } = useFlowStore()
  const { t } = useLocale()
  const [added, setAdded] = useState<Set<BlockType>>(new Set())

  if (!isOpen || !result) return null

  const { score, checks } = result
  const color = scoreColor(score)
  const missing = checks.filter(c => !c.present)
  const present = checks.filter(c => c.present)

  const handleAddBlock = (type: BlockType) => {
    const tr  = t.blocks[type]
    const idx = nodes.length

    const extraData = type === 'response_style'
      ? {
          options: { ...DEFAULT_RESPONSE_STYLE } as Record<string, string | boolean>,
          content: generateResponseStyleContent(DEFAULT_RESPONSE_STYLE),
        }
      : { content: '' }

    const node: FlomptNode = {
      id:       `${type}-${Date.now()}`,
      type:     'block',
      position: { x: 60, y: 60 + idx * 220 },
      data:     { type, label: tr.label, description: tr.description, ...extraData },
    }

    addNode(node)
    setAdded(prev => new Set(prev).add(type))
  }

  return (
    <>
      <div className="audit-backdrop" onClick={() => setOpen(false)} />
      <aside className="audit-panel" role="dialog" aria-label="Prompt audit" aria-modal="true">

        {/* Header */}
        <div className="audit-header">
          <div className="audit-brand">
            <ShieldCheck size={15} />
            <span className="audit-title">{t.audit.title}</span>
          </div>
          <button className="ide-close-btn" onClick={() => setOpen(false)} aria-label={t.ide.close}>
            <X size={15} />
          </button>
        </div>

        <div className="audit-body">

          {/* Score gauge */}
          <div className="audit-score-section">
            <div className="audit-score-gauge">
              <span className="audit-score-number" style={{ color }}>{score}</span>
              <span className="audit-score-slash">/100</span>
            </div>
            <div className="audit-score-meta">
              <span className="audit-score-label" style={{ color }}>{scoreLabel(score)}</span>
              <div className="audit-score-bar">
                <div
                  className="audit-score-fill"
                  style={{ width: `${score}%`, background: color }}
                />
              </div>
            </div>
          </div>

          {/* Before / after hint if score < 70 */}
          {score < 70 && (
            <div className="audit-hint">
              <span>{t.audit.hint.replace('{n}', String(missing.length))}</span>
            </div>
          )}

          {/* Checklist */}
          <div className="audit-checklist">
            {checks.map(check => (
              <div key={check.blockType} className={`audit-check${check.present ? ' audit-check--ok' : ' audit-check--miss'}`}>
                <div className="audit-check-left">
                  {check.present
                    ? <CheckCircle2 size={14} className="audit-check-icon audit-check-icon--ok" />
                    : <XCircle      size={14} className="audit-check-icon audit-check-icon--miss" />
                  }
                  <div className="audit-check-info">
                    <span className="audit-check-label">{check.label}</span>
                    {!check.present && (
                      <span className="audit-check-tip">{check.tip}</span>
                    )}
                  </div>
                </div>
                {!check.present && (
                  <button
                    className={`audit-add-btn${added.has(check.blockType) ? ' audit-add-btn--added' : ''}`}
                    style={added.has(check.blockType)
                      ? undefined
                      : { borderColor: `${BLOCK_META[check.blockType].color}55`, color: BLOCK_META[check.blockType].color }
                    }
                    onClick={() => handleAddBlock(check.blockType)}
                    disabled={added.has(check.blockType)}
                    aria-label={`Add ${check.label} block`}
                  >
                    {added.has(check.blockType)
                      ? <><CheckCircle2 size={11} />{t.audit.addedBlock}</>
                      : <><Plus size={11} />{t.audit.addBlock}</>
                    }
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          {score === 100 && (
            <div className="audit-perfect">
              <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
              <span>{t.audit.perfect}</span>
            </div>
          )}

          {missing.length > 0 && (
            <p className="audit-summary">
              {present.length}/{checks.length} {t.audit.blocksPresent}
            </p>
          )}

        </div>
      </aside>
    </>
  )
}
