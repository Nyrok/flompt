import { useState, useRef, useEffect, useCallback } from 'react'
import { BLOCK_META, DEFAULT_RESPONSE_STYLE, generateResponseStyleContent } from '@/types/blocks'
import type { BlockType } from '@/types/blocks'
import { useFlowStore } from '@/store/flowStore'
import type { FlomptNode } from '@/types/blocks'
import { useLocale } from '@/i18n/LocaleContext'

const Sidebar = () => {
  const addNode = useFlowStore((s) => s.addNode)
  const nodes   = useFlowStore((s) => s.nodes)
  const { t }   = useLocale()
  const ROW_HEIGHT = 180

  // ── Scroll + top/bottom blur effects ─────────────────────────────────────
  const listRef        = useRef<HTMLDivElement>(null)
  const [showTopBlur, setShowTopBlur]       = useState(false)
  const [showBottomBlur, setShowBottomBlur] = useState(false)

  const updateBlur = useCallback(() => {
    const el = listRef.current
    if (!el) return
    const scrollTop  = el.scrollTop
    const maxScroll  = el.scrollHeight - el.clientHeight
    setShowTopBlur(scrollTop > 6)
    setShowBottomBlur(maxScroll > 6 && scrollTop < maxScroll - 6)
  }, [])

  // Check initial state and re-check when content size changes
  useEffect(() => {
    updateBlur()
    const el = listRef.current
    if (!el) return
    const ro = new ResizeObserver(updateBlur)
    ro.observe(el)
    return () => ro.disconnect()
  }, [updateBlur])

  // ── Node creation ────────────────────────────────────────────────────────
  const createNode = (type: BlockType, position?: { x: number; y: number }): FlomptNode => {
    const tr  = t.blocks[type]
    const idx = nodes.length

    // response_style: initialize options + content on creation
    const extraData = type === 'response_style'
      ? {
          options: { ...DEFAULT_RESPONSE_STYLE } as Record<string, string | boolean>,
          content: generateResponseStyleContent(DEFAULT_RESPONSE_STYLE),
        }
      : { content: '' }

    return {
      id:       `${type}-${Date.now()}`,
      type:     'block',
      position: position ?? { x: 60, y: 60 + idx * ROW_HEIGHT },
      data:     { type, label: tr.label, description: tr.description, ...extraData },
    }
  }

  const handleAddBlock = (type: BlockType) => {
    const node = createNode(type)
    addNode(node)
    window.dispatchEvent(new CustomEvent('flompt:block-added', {
      detail: { label: node.data.label, color: BLOCK_META[type].color },
    }))
  }

  const handleDragStart = (e: React.DragEvent, type: BlockType) => {
    e.dataTransfer.setData('blockType', type)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className="sidebar">
      <h3 className="panel-title">{t.sidebar.title}</h3>
      <p className="sidebar-hint">{t.sidebar.hint}</p>

      {/* Wrapper with position:relative to anchor the blur overlays */}
      <div className="block-list-wrapper">

        {/* Top gradient — appears as soon as the user has scrolled */}
        <div
          className={`block-list-blur block-list-blur--top${showTopBlur ? ' block-list-blur--visible' : ''}`}
          aria-hidden="true"
        />

        {/* Vertically scrollable list */}
        <div
          className="block-list"
          ref={listRef}
          onScroll={updateBlur}
        >
          {(Object.keys(BLOCK_META) as BlockType[]).map((type) => {
            const meta = BLOCK_META[type]
            const tr   = t.blocks[type]
            const Icon = meta.icon
            return (
              <button
                key={type}
                className="block-pill"
                style={{ borderColor: `${meta.color}55`, color: meta.color }}
                onClick={() => handleAddBlock(type)}
                draggable
                onDragStart={(e) => handleDragStart(e, type)}
                title={tr.description}
              >
                <span
                  className="block-pill-icon"
                  style={{ background: `${meta.color}1a` }}
                >
                  <Icon size={13} />
                </span>
                {tr.label}
              </button>
            )
          })}
        </div>

        {/* Bottom gradient — appears when scrolling down is possible */}
        <div
          className={`block-list-blur block-list-blur--bottom${showBottomBlur ? ' block-list-blur--visible' : ''}`}
          aria-hidden="true"
        />
      </div>
    </aside>
  )
}

export default Sidebar
