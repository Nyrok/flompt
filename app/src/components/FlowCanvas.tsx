import { useCallback, useEffect, useRef } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ConnectionMode,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Play, Sparkles, ShieldCheck, Undo2, Redo2, Trash2 } from 'lucide-react'
import { useFlowStore } from '@/store/flowStore'
import { assemblePrompt } from '@/lib/assemblePrompt'
import BlockNode from './BlockNode'
import CustomEdge from './CustomEdge'
import CanvasBlockBar from './CanvasBlockBar'
import { BLOCK_META, DEFAULT_RESPONSE_STYLE, generateResponseStyleContent } from '@/types/blocks'
import type { BlockType, FlomptNode } from '@/types/blocks'
import { useLocale } from '@/i18n/LocaleContext'
import { STAR_EVENT } from '@/components/StarPopup'

const nodeTypes = { block: BlockNode }
const edgeTypes = { custom: CustomEdge }

const CanvasInner = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, isDecomposing, addNode, activeTab, queueStatus, undo, redo, reset, past, future } = useFlowStore()
  const { t } = useLocale()
  const { fitView, screenToFlowPosition } = useReactFlow()
  const prevNodeCount = useRef(nodes.length)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Auto-fit when nodes change (decomposition)
  useEffect(() => {
    if (nodes.length > 0 && nodes.length !== prevNodeCount.current) {
      setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50)
    }
    prevNodeCount.current = nodes.length
  }, [nodes.length, fitView])

  // Reset zoom when switching to canvas tab (especially on mobile)
  useEffect(() => {
    if (activeTab === 'canvas' && nodes.length > 0) {
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100)
    }
  }, [activeTab, fitView])

  // Drag-and-drop from the sidebar
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
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
  }, [screenToFlowPosition, addNode, t.blocks])

  return (
    <div className="flow-canvas" ref={wrapperRef} onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode="Delete"
        snapToGrid
        snapGrid={[20, 20]}
        connectionMode={ConnectionMode.Loose}
        connectOnClick={true}
        defaultEdgeOptions={{ type: 'custom' }}
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
      <CanvasBlockBar />

      {/* Canvas control bar — top-left, horizontal */}
      <div className="canvas-ctrl-bar">
        <button
          className="canvas-ctrl-btn canvas-ctrl-btn--danger"
          onClick={() => { if (confirm(t.header.resetConfirm)) reset() }}
          title={t.header.reset}
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
          title={t.header.undo}
          aria-label={t.header.undo}
        >
          <Undo2 size={13} aria-hidden="true" />
        </button>
        <button
          className="canvas-ctrl-btn"
          onClick={redo}
          disabled={future.length === 0}
          title={t.header.redo}
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
          aria-label={queueStatus?.status === 'analyzing'
            ? t.promptInput.queueAnalyzing
            : t.promptInput.decomposing
          }
        >
          <div className="compile-loading-icon" aria-hidden="true">
            {queueStatus?.status === 'analyzing'
              ? <ShieldCheck size={32} className="compile-sparkle" />
              : <Sparkles size={32} className="compile-sparkle" />
            }
          </div>
          <p className="compile-loading-text">
            {queueStatus?.status === 'analyzing'
              ? t.promptInput.queueAnalyzing
              : t.promptInput.decomposing
            }
          </p>
          <div className="compile-loading-dots" aria-hidden="true">
            <span className="compile-dot" style={{ animationDelay: '0s' }} />
            <span className="compile-dot" style={{ animationDelay: '0.2s' }} />
            <span className="compile-dot" style={{ animationDelay: '0.4s' }} />
          </div>
          {queueStatus && queueStatus.status !== 'analyzing' && (
            <div className={`queue-status${queueStatus.status === 'processing' ? ' queue-status--processing' : ''}`}>
              <span className="queue-status__dot" aria-hidden="true" />
              {queueStatus.status === 'processing'
                ? t.promptInput.queueProcessing
                : t.promptInput.queuePosition(queueStatus.position)
              }
            </div>
          )}
        </div>
      )}

      {/* Mobile FAB: assemble & navigate to output */}
      {nodes.length > 0 && (
        <button
          className="canvas-fab"
          onClick={() => {
            const { nodes: currentNodes, edges: currentEdges, setCompiledPrompt: setResult, setActiveTab: switchTab } = useFlowStore.getState()
            if (currentNodes.length === 0) return
            const result = assemblePrompt(currentNodes, currentEdges)
            setResult(result)
            switchTab('output')
            window.dispatchEvent(new CustomEvent(STAR_EVENT))
          }}
          title={t.promptOutput.compile}
          aria-label={t.promptOutput.compile}
        >
          <Play size={22} aria-hidden="true" />
        </button>
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
