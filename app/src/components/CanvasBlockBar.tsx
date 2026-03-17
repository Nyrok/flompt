import { BLOCK_META, DEFAULT_RESPONSE_STYLE, generateResponseStyleContent } from '@/types/blocks'
import type { BlockType, FlomptNode } from '@/types/blocks'
import { useFlowStore } from '@/store/flowStore'
import { useLocale } from '@/i18n/LocaleContext'
import { Tooltip } from '@/components/ui/tooltip'
import { findFreePosition, getCanvasSize } from '@/lib/layoutNodes'

const CanvasBlockBar = ({ mobileOnly = false, toolbar = false }: { mobileOnly?: boolean; toolbar?: boolean }) => {
  const addNode = useFlowStore(s => s.addNode)
  const nodes   = useFlowStore(s => s.nodes)
  const { t }   = useLocale()

  const handleDragStart = (e: React.DragEvent, type: BlockType) => {
    e.dataTransfer.setData('blockType', type)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleClick = (type: BlockType) => {
    const tr = t.blocks[type]
    const extraData = type === 'response_style'
      ? {
          options: { ...DEFAULT_RESPONSE_STYLE } as Record<string, string | boolean>,
          content: generateResponseStyleContent(DEFAULT_RESPONSE_STYLE),
        }
      : { content: '' }

    const draft: FlomptNode = {
      id:       `${type}-${Date.now()}`,
      type:     'block',
      position: { x: 0, y: 0 },
      data:     { type, label: tr.label, description: tr.description, ...extraData },
    }
    const { w, h } = getCanvasSize()
    const node = { ...draft, position: findFreePosition(nodes, draft, w, h) }
    addNode(node)
    window.dispatchEvent(new CustomEvent('flompt:block-added', {
      detail: { label: tr.label, color: BLOCK_META[type].color },
    }))
  }

  return (
    <div className={`canvas-block-bar${mobileOnly ? ' canvas-block-bar--mobile-only' : ''}${toolbar ? ' canvas-block-bar--toolbar' : ''}`} role="toolbar" aria-label="Block types">
      {(Object.keys(BLOCK_META) as BlockType[]).map(type => {
        const meta = BLOCK_META[type]
        const Icon = meta.icon
        return (
          <Tooltip key={type} content={t.blocks[type].label} side={toolbar ? 'top' : 'right'}>
            <button
              className="canvas-block-btn"
              style={{ '--block-color': meta.color } as React.CSSProperties}
              aria-label={t.blocks[type].label}
              draggable
              onDragStart={e => handleDragStart(e, type)}
              onClick={() => handleClick(type)}
            >
              <Icon size={14} aria-hidden="true" />
            </button>
          </Tooltip>
        )
      })}
    </div>
  )
}

export default CanvasBlockBar
