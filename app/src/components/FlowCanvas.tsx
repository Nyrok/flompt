import { useCallback, useEffect, useRef, useState } from 'react'
import { layoutNodes } from '@/lib/layoutNodes'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Sparkles, Undo2, Redo2, Trash2 } from 'lucide-react'
import { useFlowStore } from '@/store/flowStore'
import BlockNode from './BlockNode'
import { BLOCK_META, DEFAULT_RESPONSE_STYLE, generateResponseStyleContent } from '@/types/blocks'
import type { BlockType, FlomptNode } from '@/types/blocks'
import { useLocale } from '@/i18n/LocaleContext'

const nodeTypes = { block: BlockNode }

interface BlockChip { label: string; color: string; key: number }

const CanvasInner = () => {
  const { nodes, edges, onNodesChange, setNodes, isDecomposing, addNode, activeTab, queueStatus, undo, redo, reset, past, future } = useFlowStore()
  const { t } = useLocale()
  const { fitView, screenToFlowPosition } = useReactFlow()
  const prevNodeCount = useRef(nodes.length)
  const prevIsDecomposing = useRef(isDecomposing)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [chip, setChip] = useState<BlockChip | null>(null)

  // Apply scatter layout once decomposition finishes, using real canvas dimensions
  useEffect(() => {
    const wasDecomposing = prevIsDecomposing.current
    prevIsDecomposing.current = isDecomposing
    if (wasDecomposing && !isDecomposing && nodes.length > 0) {
      const rect = wrapperRef.current?.getBoundingClientRect()
      const w = rect?.width  ?? window.innerWidth
      const h = rect?.height ?? window.innerHeight
      setNodes(layoutNodes(nodes, w, h))
      setTimeout(() => fitView({ padding: 0.15, duration: 450 }), 60)
    }
  }, [isDecomposing, nodes, setNodes, fitView])

  // Track node count (used by decompose effect above)
  useEffect(() => {
    prevNodeCount.current = nodes.length
  }, [nodes.length])

  // Show chip on explicit block-added event (dispatched from CanvasBlockBar + onDrop)
  useEffect(() => {
    const handler = (e: Event) => {
      const { label, color } = (e as CustomEvent<{ label: string; color: string }>).detail
      setChip({ label, color, key: Date.now() })
    }
    window.addEventListener('flompt:block-added', handler)
    return () => window.removeEventListener('flompt:block-added', handler)
  }, [])

  // Reset zoom when switching to canvas tab (especially on mobile)
  useEffect(() => {
    if (activeTab === 'canvas' && nodes.length > 0) {
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100)
    }
  }, [activeTab, fitView])

  // Drag-and-drop from the sidebar
  const [isDragOver, setIsDragOver] = useState(false)

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if leaving the canvas wrapper entirely (not entering a child)
    if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const type = e.dataTransfer.getData('blockType') as BlockType
    if (!type || !BLOCK_META[type]) return
    const bounds = wrapperRef.current?.getBoundingClientRect()
    if (!bounds) return
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    const tr = t.blocks[type]
    const extraData = type === 'response_style'
      ? {
          options: { ...DEFAULT_RESPONSE_STYLE } as Record<string, string | boolean>,
          content: generateResponseStyleContent(DEFAULT_RESPONSE_STYLE),
        }
      : { content: '' }
    const newNode: FlomptNode = {
      id: `${type}-${Date.now()}`,
      type: 'block',
      position,
      data: { type, label: tr.label, description: tr.description, ...extraData },
    }
    addNode(newNode)
    window.dispatchEvent(new CustomEvent('flompt:block-added', {
      detail: { label: tr.label, color: BLOCK_META[type].color },
    }))
  }, [screenToFlowPosition, addNode, t.blocks])

  return (
    <div
      role="region"
      aria-label='Prompt canvas'
      className={`flow-canvas${isDragOver ? ' flow-canvas--drag-over' : ''}`}
      ref={wrapperRef}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode="Delete"
        snapToGrid
        snapGrid={[20, 20]}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1e1e3a" />
        <Controls />
        <MiniMap
          nodeColor={(n) => BLOCK_META[(n.data as { type: BlockType }).type]?.color ?? '#7c3aed'}
          style={{ background: 'rgba(7, 7, 26, 0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}
        />
      </ReactFlow>

      {/* Block type palette — left side, vertical */}
      {/* Canvas control bar — top-left, horizontal */}
      <div className="canvas-ctrl-bar" role="toolbar" aria-label='Canvas controls'>
        <button
          className="canvas-ctrl-btn canvas-ctrl-btn--danger"
          onClick={() => { if (confirm(t.header.resetConfirm)) reset() }}
          aria-label={t.header.reset}
          disabled={nodes.length === 0}
        >
          <Trash2 size={13} aria-hidden="true" />
        </button>
        <div className="canvas-ctrl-divider" aria-hidden="true" />
        <button
          className="canvas-ctrl-btn"
          onClick={undo}
          disabled={past.length === 0}
          aria-label={t.header.undo}
        >
          <Undo2 size={13} aria-hidden="true" />
        </button>
        <button
          className="canvas-ctrl-btn"
          onClick={redo}
          disabled={future.length === 0}
          aria-label={t.header.redo}
        >
          <Redo2 size={13} aria-hidden="true" />
        </button>
      </div>

      {/* Empty state */}
      {nodes.length === 0 && !isDecomposing && (
        <div className="canvas-empty">
          <div className="canvas-empty-icon">⬡</div>
          <p className="canvas-empty-title">{t.canvas.empty}</p>
          <p className="canvas-empty-hint">
            {t.canvas.emptyHint}<strong>{t.promptInput.decompose}</strong>,<br />
            {t.canvas.emptyDecompose}
          </p>
        </div>
      )}

      {/* Loading overlay — canvas uniquement */}
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
          <p className="compile-loading-text">
            {t.promptInput.decomposing}
          </p>
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

      {/* Block-added micro chip */}
      {chip && (
        <div
          key={chip.key}
          className="block-added-chip"
          style={{ '--chip-color': chip.color } as React.CSSProperties}
          onAnimationEnd={() => setChip(null)}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="block-added-chip__dot" aria-hidden="true" />
          {chip.label}
        </div>
      )}

    </div>
  )
}

const FlowCanvas = () => (
  <ReactFlowProvider>
    <CanvasInner />
  </ReactFlowProvider>
)

export default FlowCanvas
