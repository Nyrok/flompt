import { useState, useRef, useEffect } from 'react'
import { X, ChevronDown, ChevronRight, Trash2, Undo2, Redo2, GripVertical, LayoutList, Network } from 'lucide-react'
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
  const { nodes, setNodes, removeNode, updateNodeContent, addNode, reset, undo, redo, past, future } = useFlowStore()
  const { t } = useLocale()

  const [collapsed, setCollapsed]     = useState<Set<string>>(new Set())
  // Local visual order — array of node IDs
  const [order, setOrder]             = useState<string[]>(() => nodes.map(n => n.id))

  // Keep order in sync when nodes change externally (decompose, undo/redo, etc.)
  useEffect(() => {
    setOrder(prev => {
      const incoming = nodes.map(n => n.id)
      // Keep existing order for IDs already present, append new ones
      const kept    = prev.filter(id => incoming.includes(id))
      const added   = incoming.filter(id => !kept.includes(id))
      return [...kept, ...added]
    })
  }, [nodes])

  // Ordered list of nodes for rendering
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

  // ── Drag to reorder ───────────────────────────────────────────────────────
  const dragIdx  = useRef<number | null>(null)
  const overIdx  = useRef<number | null>(null)
  const canDrag  = useRef(false)

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    if (!canDrag.current) { e.preventDefault(); return }
    dragIdx.current = idx
    e.dataTransfer.effectAllowed = 'move'
    // Transparent drag ghost
    const ghost = document.createElement('div')
    ghost.style.cssText = 'position:fixed;top:-9999px'
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    setTimeout(() => document.body.removeChild(ghost), 0)
  }

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    overIdx.current = idx
    if (dragIdx.current === null || dragIdx.current === idx) return
    setOrder(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIdx.current!, 1)
      next.splice(idx, 0, moved)
      dragIdx.current = idx
      return next
    })
  }

  const handleDragEnd = () => {
    canDrag.current = false
    dragIdx.current = null
    overIdx.current = null
    // Sync visual order back to the store (no assembly impact — TYPE_PRIORITY governs that)
    setNodes(order.map(id => nodes.find(n => n.id === id)).filter(Boolean) as FlomptNode[])
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
            const meta       = BLOCK_META[node.data.type]
            const Icon       = meta.icon
            const isCollapsed = collapsed.has(node.id)
            return (
              <div
                key={node.id}
                className={`block-list-card${isCollapsed ? ' block-list-card--collapsed' : ''}`}
                style={{ borderLeftColor: meta.color }}
                draggable
                onDragStart={e => handleDragStart(e, idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
              >
                <div
                  className="block-list-card-header"
                  onClick={() => toggleCollapse(node.id)}
                  role="button"
                  aria-expanded={!isCollapsed}
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && toggleCollapse(node.id)}
                >
                  {/* Drag handle — only this triggers drag */}
                  <span
                    className="block-list-drag-handle"
                    onMouseDown={e => { e.stopPropagation(); canDrag.current = true }}
                    onMouseUp={() => { canDrag.current = false }}
                    onClick={e => e.stopPropagation()}
                    aria-hidden="true"
                  >
                    <GripVertical size={13} />
                  </span>

                  <span className="block-list-card-icon" style={{ color: meta.color, background: `${meta.color}1a` }}>
                    <Icon size={13} />
                  </span>
                  <span className="block-list-card-label" style={{ color: meta.color }}>
                    {node.data.label}
                  </span>

                  {/* Content preview when collapsed — takes remaining space */}
                  {isCollapsed && node.data.content && (
                    <span className="block-list-card-preview">{node.data.content}</span>
                  )}

                  {/* Right actions — always pinned to the right */}
                  <span className="block-list-card-actions">
                    <span className="block-list-card-chevron">
                      {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    </span>
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
