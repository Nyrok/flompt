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

  // ── Scroll + effets blur haut/bas ──────────────────────────────────────────
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

  // Vérifier l'état initial et re-vérifier si le contenu change de taille
  useEffect(() => {
    updateBlur()
    const el = listRef.current
    if (!el) return
    const ro = new ResizeObserver(updateBlur)
    ro.observe(el)
    return () => ro.disconnect()
  }, [updateBlur])

  // ── Création de nœud ────────────────────────────────────────────────────────
  const createNode = (type: BlockType, position?: { x: number; y: number }): FlomptNode => {
    const tr  = t.blocks[type]
    const idx = nodes.length

    // response_style : initialiser options + content dès la création
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

  const handleAddBlock  = (type: BlockType) => addNode(createNode(type))

  const handleDragStart = (e: React.DragEvent, type: BlockType) => {
    e.dataTransfer.setData('blockType', type)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className="sidebar">
      <h3 className="panel-title">{t.sidebar.title}</h3>
      <p className="sidebar-hint">{t.sidebar.hint}</p>

      {/* Wrapper avec position:relative pour ancrer les overlays blur */}
      <div className="block-list-wrapper">

        {/* Gradient haut — apparaît dès qu'on a scrollé */}
        <div
          className={`block-list-blur block-list-blur--top${showTopBlur ? ' block-list-blur--visible' : ''}`}
          aria-hidden="true"
        />

        {/* Liste scrollable verticalement */}
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

        {/* Gradient bas — apparaît si scroll possible vers le bas */}
        <div
          className={`block-list-blur block-list-blur--bottom${showBottomBlur ? ' block-list-blur--visible' : ''}`}
          aria-hidden="true"
        />
      </div>
    </aside>
  )
}

export default Sidebar
