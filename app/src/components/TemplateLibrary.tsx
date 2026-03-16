import { useState } from 'react'
import { Wand2, X } from 'lucide-react'
import CustomSelect from '@/components/CustomSelect'
import { TEMPLATES, TEMPLATE_CATEGORIES, CATEGORY_COLORS, LOCALE_TO_LANG } from '@/lib/templates'
import type { TemplateCategory } from '@/lib/templates'
import { useFlowStore } from '@/store/flowStore'
import { useLocale } from '@/i18n/LocaleContext'
import type { FlomptNode } from '@/types/blocks'

const TemplateLibrary = ({ onClose }: { onClose?: () => void }) => {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all')
  const [loadedId, setLoadedId]             = useState<string | null>(null)
  const [outputLang, setOutputLang]         = useState<string>('')

  const { setNodes, setEdges, setCompiledPrompt, setActiveTab } = useFlowStore()
  const { t, locale } = useLocale()

  const filtered = activeCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeCategory)

  const handleUse = (templateId: string) => {
    const tpl = TEMPLATES.find(t => t.id === templateId)
    if (!tpl) return

    let nodes: FlomptNode[] = [...tpl.nodes]

    // Append a language block if a response language is selected
    if (outputLang) {
      const langNode: FlomptNode = {
        id:       `language-${Date.now()}`,
        type:     'block',
        position: { x: 60, y: 60 + nodes.length * 185 },
        data:     { type: 'language', label: 'Language', description: '', content: outputLang },
      }
      nodes = [...nodes, langNode]
    }

    setNodes(nodes)
    setEdges([])
    setCompiledPrompt(null)
    setLoadedId(templateId)
    setTimeout(() => {
      setActiveTab('canvas')
      setLoadedId(null)
      onClose?.()
    }, 500)
  }

  // Locale-aware template label: prefer user locale, fallback to 'en'
  const tplLabel = (tpl: typeof TEMPLATES[number]) =>
    tpl.i18n[locale] ?? tpl.i18n.en

  return (
    <div className="library-panel">
      <div className="library-panel-header">
        <h2 className="panel-title" style={{ margin: 0 }}>Templates</h2>
        {onClose && (
          <button className="library-close-btn" onClick={onClose} aria-label="Close">
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>
      <p className="library-hint">{t.library.hint}</p>

      {/* Response language selector */}
      <div className="library-lang-row">
        <label className="library-lang-label" htmlFor="library-lang-select">
          {t.library.outputLang}
        </label>
        <CustomSelect
          id="library-lang-select"
          value={outputLang}
          onChange={setOutputLang}
          options={[
            { value: '', label: t.library.noLang },
            ...Object.entries(LOCALE_TO_LANG).map(([code, name]) => ({ value: name, label: name, key: code })),
          ]}
          triggerClassName="csel-trigger--lib"
          className="csel--flex"
        />
      </div>

      {/* Category filters */}
      <div className="library-filters" role="group" aria-label="Filter by category">
        {TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`library-filter-btn${activeCategory === cat ? ' library-filter-btn--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
            aria-pressed={activeCategory === cat}
          >
            {t.library.categories[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="template-grid">
        {filtered.map(tpl => {
          const color   = CATEGORY_COLORS[tpl.category]
          const isLoaded = loadedId === tpl.id
          const meta    = tplLabel(tpl)
          return (
            <div
              key={tpl.id}
              className="template-card"
              style={{ '--tpl-color': color } as React.CSSProperties}
            >
              <span
                className="template-card-category"
                style={{ color, background: `${color}18` }}
              >
                {t.library.categories[tpl.category] ?? tpl.category}
              </span>
              <p className="template-card-name">{meta.name}</p>
              <p className="template-card-desc">{meta.description}</p>
              <button
                className={`template-card-use${isLoaded ? ' template-card-use--loaded' : ''}`}
                onClick={() => handleUse(tpl.id)}
                disabled={isLoaded}
              >
                {isLoaded
                  ? '✓ Loaded'
                  : <><Wand2 size={11} aria-hidden="true" /> Use</>
                }
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TemplateLibrary
