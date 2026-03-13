import type { FlomptNode, BlockType } from '@/types/blocks'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TemplateMeta { name: string; description: string }

/** Shape of a single JSON file in app/templates/<category>/<id>.json */
export interface TemplateFile {
  id:       string
  category: TemplateCategory
  i18n:     { en: TemplateMeta; fr: TemplateMeta } & Record<string, TemplateMeta>
  blocks:   { type: BlockType; content: string }[]
}

/** Runtime template (nodes are hydrated from blocks on load) */
export interface Template {
  id:       string
  category: TemplateCategory
  i18n:     TemplateFile['i18n']
  nodes:    FlomptNode[]
}

// ── Categories ────────────────────────────────────────────────────────────────

export const TEMPLATE_CATEGORIES = [
  'all', 'writing', 'code', 'marketing', 'productivity',
  'design', 'education', 'sales', 'data', 'creative', 'personal',
] as const
export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number]

export const CATEGORY_COLORS: Record<string, string> = {
  writing:      '#c084fc',
  code:         '#4ade80',
  marketing:    '#ff6b9d',
  productivity: '#fbbf24',
  design:       '#38bdf8',
  education:    '#f97316',
  sales:        '#a3e635',
  data:         '#22d3ee',
  creative:     '#fb7185',
  personal:     '#e879f9',
}

// ── Language mapping (locale code → English name for the language block) ──────

export const LOCALE_TO_LANG: Record<string, string> = {
  en: 'English', fr: 'French',  es: 'Spanish',    de: 'German',
  it: 'Italian', pt: 'Portuguese', zh: 'Chinese', ja: 'Japanese',
  ko: 'Korean',  ar: 'Arabic',  ru: 'Russian',     nl: 'Dutch',
  pl: 'Polish',  sv: 'Swedish', tr: 'Turkish',     hi: 'Hindi',
}

// ── Loader ────────────────────────────────────────────────────────────────────

/**
 * Eagerly import every JSON file from app/templates/<category>/<id>.json.
 * Vite resolves the glob at build time — no runtime I/O.
 */
const RAW = import.meta.glob<TemplateFile>(
  '../../templates/**/*.json',
  { eager: true, import: 'default' },
)

/**
 * Convert a TemplateFile (flat blocks array) into a runtime Template
 * by hydrating each block into a FlomptNode with position and id.
 */
function hydrate(file: TemplateFile): Template {
  const nodes: FlomptNode[] = file.blocks.map((block, idx) => ({
    id:       `tpl-${file.id}-${block.type}-${idx}`,
    type:     'block',
    position: { x: 60, y: 60 + idx * 185 },
    data: {
      type:        block.type,
      label:       block.type,
      description: '',
      content:     block.content,
    },
  }))

  return { id: file.id, category: file.category, i18n: file.i18n, nodes }
}

export const TEMPLATES: Template[] = Object.values(RAW).map(hydrate)
