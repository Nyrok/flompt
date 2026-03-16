import { useState, useRef, useEffect } from 'react'
import { X, ChevronDown, ChevronRight, Trash2, Undo2, Redo2, LayoutList, Network, Eye, EyeOff, Copy } from 'lucide-react'
import { BLOCK_META, DEFAULT_RESPONSE_STYLE, generateResponseStyleContent } from '@/types/blocks'
import type { BlockType } from '@/types/blocks'
import { useFlowStore } from '@/store/flowStore'
import type { FlomptNode } from '@/types/blocks'
import { useLocale } from '@/i18n/LocaleContext'

interface Props {
  canvasView: 'list' | 'canvas'
  onToggleView: (v: 'list' | 'canvas') => void
}

const BlockListView = ({ canvasView, onToggleView }: Props) => {
  const { nodes, setNodes, removeNode, updateNodeContent, addNode, toggleNodeHidden, reset, undo, redo, past, future } = useFlowStore()
  const { t } = useLocale()

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [order, setOrder]         = useState<string[]>(() => nodes.map(n => n.id))

  // After a keyboard reorder, refocus the moved card
  const focusAfterMove = useRef<string | null>(null)

  // Keep order in sync when nodes change externally (undo/redo, decompose…)
  useEffect(() => {
    setOrder(prev => {
      const incoming = nodes.map(n => n.id)
      const kept  = prev.filter(id => incoming.includes(id))
      const added = incoming.filter(id => !kept.includes(id))
      return [...kept, ...added]
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

  // ── Reorder (keyboard) ────────────────────────────────────────────────────
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

  // Sync order back to store when it changes
  useEffect(() => {
    setNodes(order.map(id => nodes.find(n => n.id === id)).filter(Boolean) as FlomptNode[])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order])

  // ── Duplicate block ───────────────────────────────────────────────────────
  const handleDuplicate = (node: FlomptNode) => {
    addNode({
      ...node,
      id: `${node.data.type}-${Date.now()}`,
      position: { x: node.position.x + 40, y: node.position.y + 40 },
      data: { ...node.data, hidden: false },
    })
  }

  // ── Add block ─────────────────────────────────────────────────────────────
  const handleAddBlock = (type: BlockType) => {
    const tr = t.blocks[type]
    const extraData = type === 'response_style'
      ? {
          options: { ...DEFAULT_RESPONSE_STYLE } as Record<string, string | boolean>,
          content: generateResponseStyleContent(DEFAULT_RESPONSE_STYLE),
        }
      : { content: '' }
    const node: FlomptNode = {
      id:       `${type}-${Date.now()}`,
      type:     'block',
      position: { x: 60, y: 60 + nodes.length * 180 },
      data:     { type, label: tr.label, description: tr.description, ...extraData },
    }
    addNode(node)
    window.dispatchEvent(new CustomEvent('flompt:block-added', {
      detail: { label: tr.label, color: BLOCK_META[type].color },
    }))
  }

  return (
    <div className="block-list-view">

      {/* ── Top toolbar: actions | blocks | view toggle ── */}
      <div className="block-list-toolbar">

        {/* Left: actions */}
        <div className="block-list-toolbar-left">
          <button
            className="canvas-ctrl-btn canvas-ctrl-btn--danger"
            onClick={() => { if (confirm(t.header.resetConfirm)) reset() }}
            title={t.header.reset}
            aria-label={t.header.reset}
            disabled={nodes.length === 0}
          >
            <Trash2 size={13} />
          </button>
          <div className="canvas-ctrl-divider" aria-hidden="true" />
          <button
            className="canvas-ctrl-btn"
            onClick={undo}
            disabled={past.length === 0}
            title={t.header.undo}
            aria-label={t.header.undo}
          >
            <Undo2 size={13} />
          </button>
          <button
            className="canvas-ctrl-btn"
            onClick={redo}
            disabled={future.length === 0}
            title={t.header.redo}
            aria-label={t.header.redo}
          >
            <Redo2 size={13} />
          </button>
        </div>

        {/* Center: add block pills */}
        <div className="block-list-toolbar-center">
          {(Object.keys(BLOCK_META) as BlockType[]).map(type => {
            const meta = BLOCK_META[type]
            const Icon = meta.icon
            return (
              <button
                key={type}
                className="canvas-block-btn"
                style={{ '--block-color': meta.color } as React.CSSProperties}
                title={t.blocks[type].label}
                aria-label={t.blocks[type].label}
                onClick={() => handleAddBlock(type)}
              >
                <Icon size={14} aria-hidden="true" />
              </button>
            )
          })}
        </div>

        {/* Right: view toggle */}
        <div className="block-list-toolbar-right">
          <div className="canvas-view-toggle" style={{ position: 'static', boxShadow: 'none' }}>
            <button
              className={`canvas-view-btn${canvasView === 'list' ? ' canvas-view-btn--active' : ''}`}
              onClick={() => onToggleView('list')}
              title="List view"
              aria-label="List view"
            >
              <LayoutList size={13} />
            </button>
            <button
              className={`canvas-view-btn${canvasView === 'canvas' ? ' canvas-view-btn--active' : ''}`}
              onClick={() => onToggleView('canvas')}
              title="Canvas view"
              aria-label="Canvas view"
            >
              <Network size={13} />
            </button>
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
            return (
              <div
                key={node.id}
                className={`block-list-card${isCollapsed ? ' block-list-card--collapsed' : ''}${node.data.hidden ? ' block-list-card--hidden' : ''}`}
                style={{ borderLeftColor: meta.color, opacity: node.data.hidden ? 0.4 : 1 }}
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
                  {/* Eye toggle — left anchor, where grip handle was */}
                  <button
                    className="block-list-card-eye"
                    onClick={e => { e.stopPropagation(); toggleNodeHidden(node.id) }}
                    title={node.data.hidden ? 'Show in prompt' : 'Hide from prompt'}
                    aria-label={node.data.hidden ? 'Show in prompt' : 'Hide from prompt'}
                  >
                    {node.data.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>

                  <span className="block-list-card-icon" style={{ color: meta.color, background: `${meta.color}1a` }}>
                    <Icon size={13} />
                  </span>
                  <span className="block-list-card-label" style={{ color: meta.color }}>
                    {node.data.label}
                  </span>

                  {/* Content preview when collapsed */}
                  {isCollapsed && node.data.content && (
                    <span className="block-list-card-preview">{node.data.content}</span>
                  )}

                  {/* Right actions — always pinned */}
                  <span className="block-list-card-actions">
                    <span className="block-list-card-chevron">
                      {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    </span>
                    <button
                      className="block-list-card-action-btn"
                      onClick={e => { e.stopPropagation(); handleDuplicate(node) }}
                      title="Duplicate block"
                      aria-label="Duplicate block"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      className="block-list-card-delete"
                      onClick={e => { e.stopPropagation(); removeNode(node.id) }}
                      title="Remove block"
                      aria-label="Remove block"
                    >
                      <X size={12} />
                    </button>
                  </span>
                </div>

                {!isCollapsed && (
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
