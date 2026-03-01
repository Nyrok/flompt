import { memo, useState, useRef, useLayoutEffect } from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeProps } from 'reactflow'
import { Copy, ChevronDown, ChevronRight, X } from 'lucide-react'
import { BLOCK_META } from '@/types/blocks'
import type { BlockData } from '@/types/blocks'
import { useFlowStore } from '@/store/flowStore'
import { useLocale } from '@/i18n/LocaleContext'

const LANGUAGES = [
  { code: 'en', en: 'English',    fr: 'Anglais' },
  { code: 'fr', en: 'French',     fr: 'Français' },
  { code: 'es', en: 'Spanish',    fr: 'Espagnol' },
  { code: 'de', en: 'German',     fr: 'Allemand' },
  { code: 'it', en: 'Italian',    fr: 'Italien' },
  { code: 'pt', en: 'Portuguese', fr: 'Portugais' },
  { code: 'zh', en: 'Chinese',    fr: 'Chinois' },
  { code: 'ja', en: 'Japanese',   fr: 'Japonais' },
  { code: 'ko', en: 'Korean',     fr: 'Coréen' },
  { code: 'ar', en: 'Arabic',     fr: 'Arabe' },
  { code: 'ru', en: 'Russian',    fr: 'Russe' },
  { code: 'nl', en: 'Dutch',      fr: 'Néerlandais' },
  { code: 'pl', en: 'Polish',     fr: 'Polonais' },
  { code: 'sv', en: 'Swedish',    fr: 'Suédois' },
  { code: 'tr', en: 'Turkish',    fr: 'Turc' },
  { code: 'hi', en: 'Hindi',      fr: 'Hindi' },
]

const BlockNode = ({ id, data, selected }: NodeProps<BlockData>) => {
  const meta = BLOCK_META[data.type as keyof typeof BLOCK_META]
  // Fallback gracieux si le type est inconnu (ne devrait pas arriver, mais défensif)
  if (!meta) return null
  const Icon = meta.icon
  const { t, locale } = useLocale()
  const tr = t.blocks[data.type]
  const updateNodeContent = useFlowStore((s) => s.updateNodeContent)
  const removeNode = useFlowStore((s) => s.removeNode)
  const addNode = useFlowStore((s) => s.addNode)
  const onNodesChange = useFlowStore((s) => s.onNodesChange)
  const nodes = useFlowStore((s) => s.nodes)
  // Collapsed by default if block has an AI-generated summary
  const [collapsed, setCollapsed] = useState(!!data.summary)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea — useLayoutEffect prevents cursor jump
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el || collapsed) return
    const start = el.selectionStart
    const end = el.selectionEnd
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
    // Restore cursor position after height change
    try { el.setSelectionRange(start, end) } catch {}
  }, [data.content, collapsed])

  const handleDuplicate = () => {
    const currentNode = nodes.find((n) => n.id === id)
    if (!currentNode) return
    onNodesChange([{ id, type: 'select', selected: false }])
    addNode({
      ...currentNode,
      id: `${data.type}-${Date.now()}`,
      position: { x: currentNode.position.x + 40, y: currentNode.position.y + 40 },
      data: { ...data },
    })
  }

  // Display: summary if available, otherwise the block type label
  const displayLabel = data.summary || tr.label

  // ── Language block: compact select ──
  if (data.type === 'language') {
    // Match current content to a language option
    const matchLang = () => {
      const lower = data.content.toLowerCase().trim()
      const found = LANGUAGES.find(
        (l) => l.en.toLowerCase() === lower || l.fr.toLowerCase() === lower || l.code === lower
      )
      return found?.code || ''
    }

    const handleLangChange = (code: string) => {
      const lang = LANGUAGES.find((l) => l.code === code)
      if (lang) updateNodeContent(id, lang.en)
    }

    return (
      <div
        data-block-type="language"
        style={{ '--block-color': meta.color } as React.CSSProperties}
        className={`block-node block-node--language ${selected ? 'selected' : ''}`}
      >
        <Handle type="target" position={Position.Top} />
        <div className="language-block-inner">
          <span className="block-icon">
            <Icon size={13} />
          </span>
          <span className="block-label">{tr.label}</span>
          <select
            className="language-select nodrag nopan"
            value={matchLang()}
            onChange={(e) => { e.stopPropagation(); handleLangChange(e.target.value) }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            aria-label={tr.label}
          >
            <option value="" disabled>—</option>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {locale === 'fr' ? l.fr : l.en}
              </option>
            ))}
          </select>
          <button
            className="block-remove"
            onClick={(e) => { e.stopPropagation(); removeNode(id) }}
            title={t.block.delete}
            aria-label={t.block.delete}
          >
            <X size={11} aria-hidden="true" />
          </button>
        </div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    )
  }

  // ── Standard blocks ──
  return (
    <div
      data-block-type={data.type}
      style={{ '--block-color': meta.color } as React.CSSProperties}
      className={`block-node ${selected ? 'selected' : ''}`}
    >
      <Handle type="target" position={Position.Top} />

      <div
        className="block-header"
        onClick={() => setCollapsed((c) => !c)}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        aria-label={`${displayLabel} — ${collapsed ? t.block.expand : t.block.collapse}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCollapsed((c) => !c) } }}
      >
        <div className="block-header-left">
          <span className="block-icon" aria-hidden="true">
            <Icon size={13} />
          </span>
          {data.summary ? (
            <div className="block-label-wrap">
              <span className="block-label">{displayLabel}</span>
              <span className="block-type-badge">{tr.label}</span>
            </div>
          ) : (
            <span className="block-label">{displayLabel}</span>
          )}
        </div>
        <div className="block-actions">
          <button
            className="block-collapse"
            onClick={(e) => { e.stopPropagation(); handleDuplicate() }}
            title={t.block.duplicate}
            aria-label={`${t.block.duplicate} ${displayLabel}`}
          >
            <Copy size={11} aria-hidden="true" />
          </button>
          <button
            className="block-collapse"
            onClick={(e) => { e.stopPropagation(); setCollapsed((c) => !c) }}
            title={collapsed ? t.block.expand : t.block.collapse}
            aria-label={collapsed ? t.block.expand : t.block.collapse}
            aria-expanded={!collapsed}
          >
            {collapsed
              ? <ChevronRight size={12} aria-hidden="true" />
              : <ChevronDown size={12} aria-hidden="true" />
            }
          </button>
          <button
            className="block-remove"
            onClick={(e) => { e.stopPropagation(); removeNode(id) }}
            title={t.block.delete}
            aria-label={`${t.block.delete} ${displayLabel}`}
          >
            <X size={11} aria-hidden="true" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="block-body">
          <label htmlFor={`block-content-${id}`} className="sr-only">
            {displayLabel}
          </label>
          <textarea
            id={`block-content-${id}`}
            ref={textareaRef}
            className="block-content"
            value={data.content}
            placeholder={tr.description}
            onChange={(e) => updateNodeContent(id, e.target.value)}
            style={{ minHeight: '64px', height: 'auto' }}
            aria-label={displayLabel}
          />
          <div className="block-footer">
            <span className="block-char-count">{(data.content ?? '').length} {t.block.chars}</span>
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default memo(BlockNode)
