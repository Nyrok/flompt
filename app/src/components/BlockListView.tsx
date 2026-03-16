import { useState } from 'react'
import { X, Plus, ChevronDown } from 'lucide-react'
import { BLOCK_META, DEFAULT_RESPONSE_STYLE, generateResponseStyleContent } from '@/types/blocks'
import type { BlockType } from '@/types/blocks'
import { useFlowStore } from '@/store/flowStore'
import type { FlomptNode } from '@/types/blocks'
import { useLocale } from '@/i18n/LocaleContext'

const BlockListView = () => {
  const { nodes, removeNode, updateNodeContent, addNode } = useFlowStore()
  const { t } = useLocale()
  const [addOpen, setAddOpen] = useState(false)

  const createNode = (type: BlockType): FlomptNode => {
    const tr = t.blocks[type]
    const extraData = type === 'response_style'
      ? {
          options: { ...DEFAULT_RESPONSE_STYLE } as Record<string, string | boolean>,
          content: generateResponseStyleContent(DEFAULT_RESPONSE_STYLE),
        }
      : { content: '' }
    return {
      id: `${type}-${Date.now()}`,
      type: 'block',
      position: { x: 60, y: 60 + nodes.length * 180 },
      data: { type, label: tr.label, description: tr.description, ...extraData },
    }
  }

  const handleAdd = (type: BlockType) => {
    addNode(createNode(type))
    setAddOpen(false)
  }

  return (
    <div className="block-list-view">
      {nodes.length === 0 ? (
        <div className="block-list-view-empty">
          <p>{t.canvas.empty}</p>
        </div>
      ) : (
        <div className="block-list-view-cards">
          {nodes.map((node) => {
            const meta = BLOCK_META[node.data.type]
            const Icon = meta.icon
            return (
              <div
                key={node.id}
                className="block-list-card"
                style={{ borderLeftColor: meta.color }}
              >
                <div className="block-list-card-header">
                  <span className="block-list-card-icon" style={{ color: meta.color, background: `${meta.color}1a` }}>
                    <Icon size={13} />
                  </span>
                  <span className="block-list-card-label" style={{ color: meta.color }}>
                    {node.data.label}
                  </span>
                  <button
                    className="block-list-card-delete"
                    onClick={() => removeNode(node.id)}
                    title="Remove block"
                    aria-label="Remove block"
                  >
                    <X size={12} />
                  </button>
                </div>
                <textarea
                  className="block-list-card-textarea"
                  value={node.data.content}
                  onChange={(e) => updateNodeContent(node.id, e.target.value)}
                  placeholder={node.data.description}
                  rows={3}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Add block */}
      <div className="block-list-view-add">
        <button
          className="block-list-view-add-btn"
          onClick={() => setAddOpen((v) => !v)}
          aria-expanded={addOpen}
        >
          <Plus size={13} />
          {t.sidebar.title}
          <ChevronDown size={11} className={addOpen ? 'chevron-open' : ''} />
        </button>

        {addOpen && (
          <div className="block-list-view-add-grid">
            {(Object.keys(BLOCK_META) as BlockType[]).map((type) => {
              const meta = BLOCK_META[type]
              const Icon = meta.icon
              const tr = t.blocks[type]
              return (
                <button
                  key={type}
                  className="block-list-add-pill"
                  style={{ borderColor: `${meta.color}55`, color: meta.color }}
                  onClick={() => handleAdd(type)}
                >
                  <span className="block-list-add-pill-icon" style={{ background: `${meta.color}1a` }}>
                    <Icon size={12} />
                  </span>
                  {tr.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default BlockListView
