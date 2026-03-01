import {
  UserRound,
  Layers,
  Target,
  LogIn,
  ShieldAlert,
  LogOut,
  Lightbulb,
  GitBranch,
  Globe,
  FileText,
  SlidersHorizontal,
  Wand2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ─── Block Types ────────────────────────────────────────────────────────────

export type BlockType =
  | 'role'
  | 'context'
  | 'objective'
  | 'input'
  | 'document'
  | 'constraints'
  | 'output_format'
  | 'format_control'
  | 'response_style'
  | 'examples'
  | 'chain_of_thought'
  | 'language'

export interface BlockData {
  type: BlockType
  label: string
  content: string
  description: string
  summary?: string
  /** Options structurées pour les blocs avec UI riche (ex: response_style) */
  options?: Record<string, string | boolean>
}

export interface FlomptNode {
  id: string
  type: 'block'
  position: { x: number; y: number }
  data: BlockData
}

export interface FlomptEdge {
  id: string
  source: string
  target: string
  animated?: boolean
}

// ─── Block Metadata ──────────────────────────────────────────────────────────

// Palette harmonisée DA Mermaid — tons doux sur fond sombre, accent pink #FF3570
export const BLOCK_META: Record<BlockType, { label: string; description: string; color: string; icon: LucideIcon }> = {
  document: {
    label: 'Document',
    description: 'Contenu externe injecté via XML <document>',
    color: '#86efac',   // green-300 — grounding, source
    icon: FileText,
  },
  input: {
    label: 'Entrée',
    description: "Données fournies à l'IA",
    color: '#4ade80',   // green-400 — signal « start »
    icon: LogIn,
  },
  role: {
    label: 'Rôle',
    description: "Définit la persona / le rôle de l'IA",
    color: '#c084fc',   // violet-400 — persona
    icon: UserRound,
  },
  context: {
    label: 'Contexte',
    description: 'Fournit le contexte de la tâche',
    color: '#94a3b8',   // slate-400 — neutre, informatif
    icon: Layers,
  },
  objective: {
    label: 'Objectif',
    description: "Ce qu'on veut accomplir",
    color: '#fbbf24',   // amber-400 — cible, chaleureux
    icon: Target,
  },
  constraints: {
    label: 'Contraintes',
    description: 'Règles et limites à respecter',
    color: '#fb7185',   // rose-400 — proche accent Mermaid
    icon: ShieldAlert,
  },
  examples: {
    label: 'Exemples',
    description: 'Few-shot input/output pairs',
    color: '#c4b5fd',   // violet-300 — doux, pédagogique
    icon: Lightbulb,
  },
  chain_of_thought: {
    label: 'Raisonnement',
    description: 'Instructions de raisonnement pas à pas',
    color: '#67e8f9',   // cyan-300 — logique, réflexion
    icon: GitBranch,
  },
  output_format: {
    label: 'Sortie',
    description: 'Format attendu de la réponse',
    color: '#ff6b9d',   // accent-light — signal « fin », aligné DA
    icon: LogOut,
  },
  format_control: {
    label: 'Format Control',
    description: 'Directives Claude libres : ton, verbosité, markdown',
    color: '#fdba74',   // orange-300 — style, mise en forme
    icon: SlidersHorizontal,
  },
  response_style: {
    label: 'Response Style',
    description: 'Verbosité, ton, prose, markdown, LaTeX',
    color: '#2dd4bf',   // teal-400 — style & UX
    icon: Wand2,
  },
  language: {
    label: 'Langue',
    description: 'Langue de réponse de l\'IA',
    color: '#38bdf8',   // sky-400 — international, communication
    icon: Globe,
  },
}

// ─── Response Style ───────────────────────────────────────────────────────────

export interface ResponseStyleOptions {
  verbosity:    'concise' | 'balanced' | 'detailed'
  tone:         'conversational' | 'neutral' | 'formal'
  prose:        'flowing' | 'mixed' | 'structured'
  markdown:     'none' | 'minimal' | 'standard' | 'rich'
  math:         'auto' | 'latex' | 'plain'
  skipPreamble: boolean
}

export const DEFAULT_RESPONSE_STYLE: ResponseStyleOptions = {
  verbosity:    'balanced',
  tone:         'neutral',
  prose:        'mixed',
  markdown:     'standard',
  math:         'auto',
  skipPreamble: true,   // activé par défaut — quasi-universellement souhaité
}

/**
 * Génère les directives Claude à partir des options structurées.
 * Seules les valeurs non-default produisent du texte.
 */
export function generateResponseStyleContent(opts: ResponseStyleOptions): string {
  const parts: string[] = []

  // Verbosity
  if (opts.verbosity === 'concise') {
    parts.push('Be concise and direct. Skip preamble, verbose qualifications, and unnecessary elaboration.')
  } else if (opts.verbosity === 'detailed') {
    parts.push('Be thorough and detailed. Provide comprehensive explanations and cover edge cases.')
  }

  // Tone
  if (opts.tone === 'conversational') {
    parts.push('Use a conversational, natural tone — fluent and human-like rather than machine-like.')
  } else if (opts.tone === 'formal') {
    parts.push('Use a formal, professional tone. Avoid colloquialisms and contractions.')
  }

  // Prose style
  if (opts.prose === 'flowing') {
    parts.push(
      'Write in flowing prose paragraphs. Reserve bullet points and numbered lists only for truly discrete items. ' +
      'Incorporate information naturally into sentences rather than fragmenting it into isolated points.'
    )
  } else if (opts.prose === 'structured') {
    parts.push('Structure your response with bullet points and numbered lists for maximum clarity and scannability.')
  }

  // Markdown
  if (opts.markdown === 'none') {
    parts.push('Do not use any markdown formatting. Plain text only — no bold, italics, headers, or code blocks.')
  } else if (opts.markdown === 'minimal') {
    parts.push('Use minimal markdown. Limit to `inline code` and code blocks (```). Avoid bold, italics, and headers.')
  } else if (opts.markdown === 'rich') {
    parts.push('Use rich markdown: headers (##, ###), **bold**, *italics*, tables, and lists where they add clarity.')
  }

  // Math / LaTeX
  if (opts.math === 'latex') {
    parts.push('Use LaTeX notation for all mathematical expressions, equations, and technical formulas.')
  } else if (opts.math === 'plain') {
    parts.push(
      'Format all math in plain text only. No LaTeX, MathJax, or markup notation (no \\(...\\), $, \\frac{}{}). ' +
      'Use "/" for division, "*" for multiplication, "^" for exponents.'
    )
  }

  // Skip preamble
  if (opts.skipPreamble) {
    parts.push(
      'Respond directly without preamble. Do not start with phrases like ' +
      '"Here is...", "Based on...", "Certainly!", "Of course!", "Sure!", etc.'
    )
  }

  return parts.join('\n')
}

// ─── Output Format ───────────────────────────────────────────────────────────

/** Format de sortie du prompt assemblé selon la plateforme cible */
export type OutputFormat = 'claude' | 'chatgpt' | 'gemini'

// ─── Compiled Prompt ─────────────────────────────────────────────────────────

export interface CompiledPrompt {
  /** Prompt assemblé pour chaque plateforme — généré en une seule passe */
  formats: Record<OutputFormat, string>
  tokenEstimate: number
  blocks: BlockData[]
}
