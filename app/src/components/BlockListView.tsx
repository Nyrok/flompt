import { useState, useRef, useEffect } from 'react'
import { X, Trash2, Undo2, Redo2, LayoutList, Network, Eye, EyeOff, Copy, Play, ChevronUp, ChevronDown, Sparkles } from 'lucide-react'
import CustomSelect from '@/components/CustomSelect'
import CanvasBlockBar from '@/components/CanvasBlockBar'
import { Tooltip } from '@/components/ui/tooltip'
import { BLOCK_META, DEFAULT_RESPONSE_STYLE, generateResponseStyleContent } from '@/types/blocks'
import type { ResponseStyleOptions } from '@/types/blocks'
import { useFlowStore } from '@/store/flowStore'
import type { FlomptNode } from '@/types/blocks'
import { useLocale } from '@/i18n/LocaleContext'
import { assemblePrompt } from '@/lib/assemblePrompt'

const LANGUAGES = [
  { code: 'en', en: 'English',    fr: 'Anglais' },
  { code: 'fr', en: 'French',     fr: 'Français' },
  { code: 'es', en: 'Spanish',    fr: 'Espagnol' },
  { code: 'de', en: 'German',     fr: 'Allemand' },
  { code: 'it', en: 'Italian',    fr: 'Italien' },
  { code: 'pt', en: 'Portuguese', fr: 'Portugais' },
  { code: 'zh', en: 'Chinese',    fr: 'Chinois' },
  { code: 'ja', en: 'Japanese',   fr: 'Japonais' },
  { code: 'ko', en: 'Korean',     fr: 'Coréen' },
  { code: 'ar', en: 'Arabic',     fr: 'Arabe' },
  { code: 'ru', en: 'Russian',    fr: 'Russe' },
  { code: 'nl', en: 'Dutch',      fr: 'Néerlandais' },
  { code: 'pl', en: 'Polish',     fr: 'Polonais' },
  { code: 'sv', en: 'Swedish',    fr: 'Suédois' },
  { code: 'tr', en: 'Turkish',    fr: 'Turc' },
  { code: 'hi', en: 'Hindi',      fr: 'Hindi' },
]

interface Props {
  canvasView: 'list' | 'canvas'
  onToggleView: (v: 'list' | 'canvas') => void
}

const BlockListView = ({ canvasView, onToggleView }: Props) => {
  const {
    nodes, removeNode, updateNodeContent, updateNodeData, addNode, toggleNodeHidden,
    reset, undo, redo, past, future, setCompiledPrompt, setActiveTab,
    isDecomposing, queueStatus,
  } = useFlowStore()
  const { t, locale } = useLocale()

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  // Local visual order — purely UI, never written back to the store (avoids infinite loop)
  const [order, setOrder] = useState<string[]>(() => nodes.map(n => n.id))

  // After a keyboard/button reorder, refocus the moved card
  const focusAfterMove = useRef<string | null>(null)

  // Keep order in sync when nodes change externally (undo/redo, decompose, add, delete…)
  // Bails out if IDs haven't changed, preventing unnecessary re-renders.
  useEffect(() => {
    setOrder(prev => {
      const incoming = nodes.map(n => n.id)
      const kept  = prev.filter(id => incoming.includes(id))
      const added = incoming.filter(id => !kept.includes(id))
      const next  = [...kept, ...added]
      // Reference-stable bail-out: avoid triggering downstream effects when nothing changed
      if (next.length === prev.length && next.every((id, i) => id === prev[i])) return prev
      return next
    })
  }, [nodes])

  // Focus moved card after re-render
  useEffect(() => {
    if (!focusAfterMove.current) return
    const el = document.querySelector<HTMLElement>(`[data-block-id="${focusAfterMove.current}"]`)
    el?.focus()
    focusAfterMove.current = null
  }, [order])

  const orderedNodes = order
    .map(id => nodes.find(n => n.id === id))
    .filter(Boolean) as FlomptNode[]

  // ── Collapse ──────────────────────────────────────────────────────────────
  const toggleCollapse = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Reorder ───────────────────────────────────────────────────────────────
  const moveBlock = (id: string, idx: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= order.length) return
    setOrder(prev => {
      const next = [...prev]
      ;[next[idx], next[targetIdx]] = [next[targetIdx], next[idx]]
      return next
    })
    focusAfterMove.current = id
  }

  const handleCardKeyDown = (e: React.KeyboardEvent, id: string, idx: number) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        moveBlock(id, idx, 'down')
        break
      case 'ArrowRight':
        e.preventDefault()
        moveBlock(id, idx, 'up')
        break
      case '-':
        e.preventDefault()
        setCollapsed(prev => new Set(prev).add(id))
        break
      case '+':
      case '=':
        e.preventDefault()
        setCollapsed(prev => { const next = new Set(prev); next.delete(id); return next })
        break
      case 'Enter':
        toggleCollapse(id)
        break
    }
  }

  // ── Compile ───────────────────────────────────────────────────────────────
  const handleCompile = () => {
    const { nodes: n, edges: e } = useFlowStore.getState()
    if (n.length === 0) return
    const result = assemblePrompt(n, e)
    setCompiledPrompt(result)
    setActiveTab('output')
  }

  // ── Duplicate block ───────────────────────────────────────────────────────
  const handleDuplicate = (node: FlomptNode) => {
    addNode({
      ...node,
      id: `${node.data.type}-${Date.now()}`,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      data: { ...node.data, hidden: false },
    })
  }


  return (
    <div className="block-list-view">

      {/* ── Decomposing overlay ── */}
      {isDecomposing && (
        <div
          className="loading-overlay"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={t.promptInput.decomposing}
        >
          <div className="compile-loading-icon" aria-hidden="true">
            <Sparkles size={32} className="compile-sparkle" />
          </div>
          <p className="compile-loading-text">{t.promptInput.decomposing}</p>
          <div className="compile-loading-dots" aria-hidden="true">
            <span className="compile-dot" style={{ animationDelay: '0s' }} />
            <span className="compile-dot" style={{ animationDelay: '0.2s' }} />
            <span className="compile-dot" style={{ animationDelay: '0.4s' }} />
          </div>
          {queueStatus && (
            <div className={`queue-status${queueStatus.status === 'processing' ? ' queue-status--processing' : ''}`}>
              <span className="queue-status__dot" aria-hidden="true" />
              {queueStatus.status === 'processing' || queueStatus.position === 0
                ? t.promptInput.queueProcessing
                : t.promptInput.queuePosition(queueStatus.position)
              }
            </div>
          )}
        </div>
      )}

      {/* ── Top toolbar: actions | blocks | view toggle ── */}
      <div className="block-list-toolbar">

        {/* Left: actions */}
        <div className="block-list-toolbar-left">
          <Tooltip content={t.header.reset} side="top">
            <button
              className="canvas-ctrl-btn canvas-ctrl-btn--danger"
              onClick={() => { if (confirm(t.header.resetConfirm)) reset() }}
              title={t.header.reset}
              aria-label={t.header.reset}
              disabled={nodes.length === 0}
            >
              <Trash2 size={13} />
            </button>
          </Tooltip>
          <div className="canvas-ctrl-divider" aria-hidden="true" />
          <Tooltip content={t.header.undo} side="top">
            <button
              className="canvas-ctrl-btn"
              onClick={undo}
              disabled={past.length === 0}
              title={t.header.undo}
              aria-label={t.header.undo}
            >
              <Undo2 size={13} />
            </button>
          </Tooltip>
          <Tooltip content={t.header.redo} side="top">
            <button
              className="canvas-ctrl-btn"
              onClick={redo}
              disabled={future.length === 0}
              title={t.header.redo}
              aria-label={t.header.redo}
            >
              <Redo2 size={13} />
            </button>
          </Tooltip>
          <div className="canvas-ctrl-divider" aria-hidden="true" />
          <Tooltip content={t.promptOutput.compile} side="top">
            <button
              className="canvas-ctrl-btn canvas-ctrl-btn--compile"
              onClick={handleCompile}
              disabled={nodes.length === 0}
              title={t.promptOutput.compile}
              aria-label={t.promptOutput.compile}
            >
              <Play size={13} />
            </button>
          </Tooltip>
        </div>

        {/* Center: block type bar */}
        <CanvasBlockBar toolbar />

        {/* Right: view toggle */}
        <div className="block-list-toolbar-right">
          <div className="canvas-view-toggle" style={{ position: 'static', boxShadow: 'none' }}>
            <Tooltip content="List view" side="top">
              <button
                className={`canvas-view-btn${canvasView === 'list' ? ' canvas-view-btn--active' : ''}`}
                onClick={() => onToggleView('list')}
                title="List view"
                aria-label="List view"
              >
                <LayoutList size={13} />
              </button>
            </Tooltip>
            <Tooltip content="Canvas view" side="top">
              <button
                className={`canvas-view-btn${canvasView === 'canvas' ? ' canvas-view-btn--active' : ''}`}
                onClick={() => onToggleView('canvas')}
                title="Canvas view"
                aria-label="Canvas view"
              >
                <Network size={13} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* ── Block cards ── */}
      {nodes.length === 0 ? (
        <div className="block-list-view-empty">
          <p>{t.canvas.empty}</p>
        </div>
      ) : (
        <div className="block-list-view-cards">
          {orderedNodes.map((node, idx) => {
            const meta        = BLOCK_META[node.data.type]
            const Icon        = meta.icon
            const isCollapsed = collapsed.has(node.id)
            const isFirst     = idx === 0
            const isLast      = idx === orderedNodes.length - 1
            return (
              <div
                key={node.id}
                className={`block-list-card${isCollapsed ? ' block-list-card--collapsed' : ''}${node.data.hidden ? ' block-list-card--hidden' : ''}`}
                data-block-type={node.data.type}
                style={{ '--block-color': meta.color, borderLeftColor: meta.color, opacity: node.data.hidden ? 0.4 : 1 } as React.CSSProperties}
              >
                <div
                  className="block-list-card-header"
                  data-block-id={node.id}
                  onClick={() => toggleCollapse(node.id)}
                  onKeyDown={e => handleCardKeyDown(e, node.id, idx)}
                  role="button"
                  aria-expanded={!isCollapsed}
                  tabIndex={0}
                >
                  {/* Eye toggle — left anchor */}
                  <Tooltip content={node.data.hidden ? 'Show in prompt' : 'Hide from prompt'} side="top">
                    <button
                      className="block-list-card-eye"
                      onClick={e => { e.stopPropagation(); toggleNodeHidden(node.id) }}
                      title={node.data.hidden ? 'Show in prompt' : 'Hide from prompt'}
                      aria-label={node.data.hidden ? 'Show in prompt' : 'Hide from prompt'}
                    >
                      {node.data.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </Tooltip>

                  <span className="block-list-card-icon" style={{ color: meta.color, background: `${meta.color}1a` }}>
                    <Icon size={13} />
                  </span>
                  <span className="block-list-card-label" style={{ color: meta.color }}>
                    {(t.blocks[node.data.type as keyof typeof t.blocks] as { label: string } | undefined)?.label ?? node.data.label}
                  </span>

                  {/* Content preview when collapsed */}
                  {isCollapsed && node.data.content && (
                    <span className="block-list-card-preview">{node.data.content}</span>
                  )}

                  {/* Right actions — always pinned */}
                  <span className="block-list-card-actions">
                    {/* Ranking: up */}
                    <Tooltip content="Move up" side="top">
                      <button
                        className="block-list-card-action-btn"
                        onClick={e => { e.stopPropagation(); moveBlock(node.id, idx, 'up') }}
                        title="Move up"
                        aria-label="Move up"
                        disabled={isFirst}
                      >
                        <ChevronUp size={12} />
                      </button>
                    </Tooltip>
                    {/* Ranking: down */}
                    <Tooltip content="Move down" side="top">
                      <button
                        className="block-list-card-action-btn"
                        onClick={e => { e.stopPropagation(); moveBlock(node.id, idx, 'down') }}
                        title="Move down"
                        aria-label="Move down"
                        disabled={isLast}
                      >
                        <ChevronDown size={12} />
                      </button>
                    </Tooltip>
                    {/* Collapse/expand: − or + */}
                    <Tooltip content={isCollapsed ? 'Expand' : 'Collapse'} side="top">
                      <button
                        className="block-list-card-action-btn block-list-card-toggle"
                        onClick={e => { e.stopPropagation(); toggleCollapse(node.id) }}
                        title={isCollapsed ? 'Expand' : 'Collapse'}
                        aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                      >
                        {isCollapsed ? '+' : '−'}
                      </button>
                    </Tooltip>
                    {/* Duplicate */}
                    <Tooltip content="Duplicate block" side="top">
                      <button
                        className="block-list-card-action-btn"
                        onClick={e => { e.stopPropagation(); handleDuplicate(node) }}
                        title="Duplicate block"
                        aria-label="Duplicate block"
                      >
                        <Copy size={12} />
                      </button>
                    </Tooltip>
                    {/* Delete */}
                    <Tooltip content="Remove block" side="top">
                      <button
                        className="block-list-card-delete"
                        onClick={e => { e.stopPropagation(); removeNode(node.id) }}
                        title="Remove block"
                        aria-label="Remove block"
                      >
                        <X size={12} />
                      </button>
                    </Tooltip>
                  </span>
                </div>

                {!isCollapsed && node.data.type === 'language' && (() => {
                  const matchLang = () => {
                    const lower = node.data.content.toLowerCase().trim()
                    return LANGUAGES.find(l =>
                      l.en.toLowerCase() === lower || l.fr.toLowerCase() === lower || l.code === lower
                    )?.code || ''
                  }
                  return (
                    <div className="block-list-card-body" onClick={e => e.stopPropagation()}>
                      <CustomSelect
                        value={matchLang()}
                        onChange={code => {
                          const lang = LANGUAGES.find(l => l.code === code)
                          if (lang) updateNodeContent(node.id, lang.en)
                        }}
                        options={LANGUAGES.map(l => ({ value: l.code, label: locale === 'fr' ? l.fr : l.en }))}
                        placeholder="—"
                        triggerClassName="csel-trigger--full"
                      />
                    </div>
                  )
                })()}

                {!isCollapsed && node.data.type === 'response_style' && (() => {
                  const opts: ResponseStyleOptions = {
                    ...DEFAULT_RESPONSE_STYLE,
                    ...(node.data.options as Partial<ResponseStyleOptions> | undefined),
                  }
                  const rsTr = t.blocks.response_style as unknown as Record<string, string>
                  const setOpt = <K extends keyof ResponseStyleOptions>(key: K, val: ResponseStyleOptions[K]) => {
                    const next = { ...opts, [key]: val }
                    const content = generateResponseStyleContent(next)
                    updateNodeData(node.id, { options: next as Record<string, string | boolean>, content })
                  }

                  type PillGroup<K extends keyof ResponseStyleOptions> = {
                    key: K
                    label: string
                    options: Array<{ value: ResponseStyleOptions[K]; label: string }>
                  }
                  const PILL_GROUPS: PillGroup<'verbosity' | 'tone' | 'prose' | 'markdown' | 'math'>[] = [
                    {
                      key: 'verbosity',
                      label: rsTr.verbosity ?? 'Verbosity',
                      options: [
                        { value: 'concise',  label: rsTr.concise  ?? 'Concise' },
                        { value: 'balanced', label: rsTr.balanced  ?? 'Balanced' },
                        { value: 'detailed', label: rsTr.detailed  ?? 'Detailed' },
                      ],
                    },
                    {
                      key: 'tone',
                      label: rsTr.tone ?? 'Tone',
                      options: [
                        { value: 'conversational', label: rsTr.conversational ?? 'Conversational' },
                        { value: 'neutral',        label: rsTr.neutral        ?? 'Neutral' },
                        { value: 'formal',         label: rsTr.formal         ?? 'Formal' },
                      ],
                    },
                    {
                      key: 'prose',
                      label: rsTr.prose ?? 'Prose',
                      options: [
                        { value: 'flowing',    label: rsTr.flowing    ?? 'Prose' },
                        { value: 'mixed',      label: rsTr.mixed      ?? 'Mixed' },
                        { value: 'structured', label: rsTr.structured ?? 'Lists' },
                      ],
                    },
                    {
                      key: 'markdown',
                      label: 'Markdown',
                      options: [
                        { value: 'none',     label: rsTr.mdNone     ?? 'None' },
                        { value: 'minimal',  label: rsTr.mdMinimal  ?? 'Minimal' },
                        { value: 'standard', label: rsTr.mdStandard ?? 'Standard' },
                        { value: 'rich',     label: rsTr.mdRich     ?? 'Rich' },
                      ],
                    },
                    {
                      key: 'math',
                      label: rsTr.math ?? 'Math',
                      options: [
                        { value: 'auto',  label: rsTr.mathAuto  ?? 'Auto' },
                        { value: 'latex', label: 'LaTeX' },
                        { value: 'plain', label: rsTr.mathPlain ?? 'Plain text' },
                      ],
                    },
                  ]

                  return (
                    <div className="block-list-card-body rsp-body" onClick={e => e.stopPropagation()}>
                      {PILL_GROUPS.map(({ key, label, options }) => (
                        <div key={key} className="rsp-row">
                          <span className="rsp-row-label">{label}</span>
                          <div className="rsp-pills">
                            {options.map(({ value, label: pLabel }) => (
                              <button
                                key={String(value)}
                                className={`rsp-pill${opts[key] === value ? ' rsp-pill--active' : ''}`}
                                onClick={e => { e.stopPropagation(); setOpt(key, value) }}
                                aria-pressed={opts[key] === value}
                              >
                                {pLabel}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      <label className="rsp-checkbox">
                        <input
                          type="checkbox"
                          checked={opts.skipPreamble}
                          onChange={e => { e.stopPropagation(); setOpt('skipPreamble', e.target.checked) }}
                          onClick={e => e.stopPropagation()}
                        />
                        <span className="rsp-checkbox-label">
                          {rsTr.skipPreamble ?? 'Skip preamble ("Here is…")'}
                        </span>
                      </label>
                    </div>
                  )
                })()}

                {!isCollapsed && node.data.type !== 'language' && node.data.type !== 'response_style' && (
                  <textarea
                    className="block-list-card-textarea"
                    value={node.data.content}
                    onChange={e => updateNodeContent(node.id, e.target.value)}
                    placeholder={node.data.description}
                    rows={3}
                    onClick={e => e.stopPropagation()}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}

export default BlockListView
