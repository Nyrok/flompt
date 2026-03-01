import { memo, useState, useCallback } from 'react'
import { getBezierPath, EdgeLabelRenderer, BaseEdge, useReactFlow } from 'reactflow'
import type { EdgeProps } from 'reactflow'
import { BLOCK_META } from '@/types/blocks'
import type { BlockType } from '@/types/blocks'
import { useFlowStore } from '@/store/flowStore'
import { useLocale } from '@/i18n/LocaleContext'

const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  target,
  selected,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
  const [hovered, setHovered] = useState(false)
  const { getNode } = useReactFlow()
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange)
  const { t } = useLocale()

  const sourceNode = getNode(source)
  const targetNode = getNode(target)
  const sourceColor = BLOCK_META[(sourceNode?.data as { type: BlockType })?.type]?.color ?? '#7c3aed'
  const targetColor = BLOCK_META[(targetNode?.data as { type: BlockType })?.type]?.color ?? '#4f46e5'

  const gradientId = `edge-gradient-${id}`

  // Show delete on hover (desktop) or when selected/tapped (mobile)
  const showDelete = hovered || selected

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onEdgesChange([{ id, type: 'remove' }])
  }, [id, onEdgesChange])

  return (
    <>
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={sourceX} y1={sourceY} x2={targetX} y2={targetY}>
          <stop offset="0%" stopColor={sourceColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={targetColor} stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Glow layer */}
      <BaseEdge
        path={edgePath}
        style={{
          stroke: sourceColor,
          strokeWidth: showDelete ? 6 : 4,
          strokeOpacity: 0.18,
          filter: `drop-shadow(0 0 4px ${sourceColor})`,
          transition: 'stroke-width 0.15s ease',
        }}
      />

      {/* Main edge */}
      <BaseEdge
        path={edgePath}
        style={{
          stroke: `url(#${gradientId})`,
          strokeWidth: showDelete ? 2.5 : 1.8,
          strokeDasharray: showDelete ? '0' : '6 3',
          strokeDashoffset: 0,
          transition: 'stroke-width 0.15s ease',
          animation: 'edge-flow 1.5s linear infinite',
        }}
        interactionWidth={isTouchDevice() ? 40 : 20}
        markerEnd="none"
      />

      {/* Invisible wider hit zone — extra wide on touch */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={isTouchDevice() ? 44 : 24}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer' }}
      />

      {/* Delete button — hover (desktop) or tap/select (mobile) */}
      {showDelete && (
        <EdgeLabelRenderer>
          <div
            style={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`, pointerEvents: 'all' }}
            className="edge-delete-btn nodrag nopan"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <button onClick={handleDelete} title={t.block.deleteConnection} aria-label={t.block.deleteConnection}>
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export default memo(CustomEdge)
