import { memo, useState, useRef, useLayoutEffect } from 'react'
import type { NodeProps } from 'reactflow'
import { Copy, ChevronDown, ChevronRight, X } from 'lucide-react'
import { BLOCK_META, DEFAULT_RESPONSE_STYLE, generateResponseStyleContent } from '@/types/blocks'
import type { BlockData, ResponseStyleOptions } from '@/types/blocks'
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
  // Graceful fallback if the type is unknown (should not happen, but defensive)
  if (!meta) return null
  const Icon = meta.icon
  const { t, locale } = useLocale()
  const tr = t.blocks[data.type]
  const updateNodeContent = useFlowStore((s) => s.updateNodeContent)
  const updateNodeData    = useFlowStore((s) => s.updateNodeData)
  const removeNode = useFlowStore((s) => s.removeNode)
  const addNode = useFlowStore((s) => s.addNode)
  const onNodesChange = useFlowStore((s) => s.onNodesChange)
  const nodes = useFlowStore((s) => s.nodes)
  const [collapsed, setCollapsed] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Cursor position saved in onChange (before React re-render resets it)
  const cursorPosRef = useRef<{ start: number; end: number } | null>(null)

  // Auto-resize textarea — useLayoutEffect prevents cursor jump
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el || collapsed) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
    // Restore cursor position captured before the re-render
    if (cursorPosRef.current !== null) {
      try { el.setSelectionRange(cursorPosRef.current.start, cursorPosRef.current.end) } catch {}
      cursorPosRef.current = null
    }
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
      </div>
    )
  }

  // ── Response Style block: structured UI ─────────────────────────────────────
  if (data.type === 'response_style') {
    const opts: ResponseStyleOptions = {
      ...DEFAULT_RESPONSE_STYLE,
      ...(data.options as Partial<ResponseStyleOptions> | undefined),
    }

    // Local cast to access extended block keys (BlockTranslation only covers label/description)
    const rsTr = t.blocks.response_style as unknown as Record<string, string>

    const setOpt = <K extends keyof ResponseStyleOptions>(key: K, val: ResponseStyleOptions[K]) => {
      const next = { ...opts, [key]: val }
      const content = generateResponseStyleContent(next)
      updateNodeData(id, { options: next as Record<string, string | boolean>, content })
    }

    type PillGroup<K extends keyof ResponseStyleOptions> = {
      key: K
      label: string
      options: Array<{ value: ResponseStyleOptions[K]; label: string }>
    }

    const PILL_GROUPS: PillGroup<'verbosity' | 'tone' | 'prose' | 'markdown' | 'math'>[] = [
      {
        key: 'verbosity',
        label: rsTr.verbosity ?? 'Verbosity',
        options: [
          { value: 'concise',  label: rsTr.concise  ?? 'Concise' },
          { value: 'balanced', label: rsTr.balanced  ?? 'Balanced' },
          { value: 'detailed', label: rsTr.detailed  ?? 'Detailed' },
        ],
      },
      {
        key: 'tone',
        label: rsTr.tone ?? 'Tone',
        options: [
          { value: 'conversational', label: rsTr.conversational ?? 'Conversational' },
          { value: 'neutral',        label: rsTr.neutral         ?? 'Neutral' },
          { value: 'formal',         label: rsTr.formal          ?? 'Formal' },
        ],
      },
      {
        key: 'prose',
        label: rsTr.prose ?? 'Prose',
        options: [
          { value: 'flowing',    label: rsTr.flowing    ?? 'Prose' },
          { value: 'mixed',      label: rsTr.mixed      ?? 'Mixed' },
          { value: 'structured', label: rsTr.structured ?? 'Lists' },
        ],
      },
      {
        key: 'markdown',
        label: 'Markdown',
        options: [
          { value: 'none',     label: rsTr.mdNone     ?? 'None' },
          { value: 'minimal',  label: rsTr.mdMinimal  ?? 'Minimal' },
          { value: 'standard', label: rsTr.mdStandard ?? 'Standard' },
          { value: 'rich',     label: rsTr.mdRich     ?? 'Rich' },
        ],
      },
      {
        key: 'math',
        label: rsTr.math ?? 'Math',
        options: [
          { value: 'auto',  label: rsTr.mathAuto  ?? 'Auto' },
          { value: 'latex', label: 'LaTeX' },
          { value: 'plain', label: rsTr.mathPlain ?? 'Plain text' },
        ],
      },
    ]

    return (
      <div
        data-block-type="response_style"
        style={{ '--block-color': meta.color } as React.CSSProperties}
        className={`block-node block-node--response-style ${selected ? 'selected' : ''}`}
      >
        {/* Header — clickable to collapse */}
        <div
          className="rsp-header"
          onClick={() => setCollapsed(c => !c)}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          aria-expanded={!collapsed}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCollapsed(c => !c) } }}
        >
          <span className="block-icon" aria-hidden="true"><Icon size={13} /></span>
          <span className="block-label">{tr?.label ?? 'Response Style'}</span>
          <div className="block-actions">
            <button
              className="block-collapse"
              onClick={(e) => { e.stopPropagation(); handleDuplicate() }}
              title={t.block.duplicate}
              aria-label={t.block.duplicate}
            >
              <Copy size={11} aria-hidden="true" />
            </button>
            <button
              className="block-collapse"
              onClick={(e) => { e.stopPropagation(); setCollapsed(c => !c) }}
              title={collapsed ? t.block.expand : t.block.collapse}
              aria-label={collapsed ? t.block.expand : t.block.collapse}
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
              aria-label={t.block.delete}
            >
              <X size={11} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Pill groups — hidden when collapsed */}
        {!collapsed && <div className="rsp-body nodrag nopan">
          {PILL_GROUPS.map(({ key, label, options }) => (
            <div key={key} className="rsp-row">
              <span className="rsp-row-label">{label}</span>
              <div className="rsp-pills">
                {options.map(({ value, label: pLabel }) => (
                  <button
                    key={String(value)}
                    className={`rsp-pill${opts[key] === value ? ' rsp-pill--active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setOpt(key, value) }}
                    onMouseDown={(e) => e.stopPropagation()}
                    aria-pressed={opts[key] === value}
                  >
                    {pLabel}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Skip preamble checkbox */}
          <label className="rsp-checkbox nodrag nopan" onMouseDown={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={opts.skipPreamble}
              onChange={(e) => { e.stopPropagation(); setOpt('skipPreamble', e.target.checked) }}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="rsp-checkbox-label">
              {rsTr.skipPreamble ?? 'Skip preamble ("Here is…")'}
            </span>
          </label>
        </div>}
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
            dir="auto"
            value={data.content}
            placeholder={tr.description}
            onChange={(e) => {
              cursorPosRef.current = { start: e.target.selectionStart ?? 0, end: e.target.selectionEnd ?? 0 }
              updateNodeContent(id, e.target.value)
            }}
            style={{ minHeight: '64px', height: 'auto' }}
            aria-label={displayLabel}
          />
          <div className="block-footer">
            <span className="block-char-count">{(data.content ?? '').length} {t.block.chars}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(BlockNode)
