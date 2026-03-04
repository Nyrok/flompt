import { BLOCK_META, DEFAULT_RESPONSE_STYLE, generateResponseStyleContent } from '@/types/blocks'
import type { BlockType, FlomptNode } from '@/types/blocks'
import { useFlowStore } from '@/store/flowStore'
import { useLocale } from '@/i18n/LocaleContext'

const CanvasBlockBar = () => {
  const addNode = useFlowStore(s => s.addNode)
  const nodes   = useFlowStore(s => s.nodes)
  const { t }   = useLocale()

  const handleDragStart = (e: React.DragEvent, type: BlockType) => {
    e.dataTransfer.setData('blockType', type)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleClick = (type: BlockType) => {
    const tr = t.blocks[type]
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
      position: { x: 60 + idx * 20, y: 60 + idx * 20 },
      data:     { type, label: tr.label, description: tr.description, ...extraData },
    }
    addNode(node)
  }

  return (
    <div className="canvas-block-bar" aria-label="Block types">
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
            draggable
            onDragStart={e => handleDragStart(e, type)}
            onClick={() => handleClick(type)}
          >
            <Icon size={14} aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}

export default CanvasBlockBar
