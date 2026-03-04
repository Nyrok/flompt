import {
  UserRound,
  Layers,
  Target,
  LogIn,
  ShieldAlert,
  LogOut,
  Lightbulb,
  Languages,
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
  | 'language'

export interface BlockData {
  type: BlockType
  label: string
  content: string
  description: string
  summary?: string
  /** Structured options for blocks with rich UI (e.g. response_style) */
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

// Harmonized Mermaid design palette — soft tones on dark background, accent pink #FF3570
export const BLOCK_META: Record<BlockType, { label: string; description: string; color: string; icon: LucideIcon }> = {
  document: {
    label: 'Document',
    description: 'External content injected via XML <document>',
    color: '#86efac',   // green-300 — grounding, source
    icon: FileText,
  },
  input: {
    label: 'Input',
    description: 'Data provided to the AI',
    color: '#4ade80',   // green-400 — "start" signal
    icon: LogIn,
  },
  role: {
    label: 'Role',
    description: "Defines the AI's persona / role",
    color: '#c084fc',   // violet-400 — persona
    icon: UserRound,
  },
  context: {
    label: 'Context',
    description: 'Provides background context for the task',
    color: '#94a3b8',   // slate-400 — neutral, informational
    icon: Layers,
  },
  objective: {
    label: 'Objective',
    description: 'What we want to accomplish',
    color: '#fbbf24',   // amber-400 — target, warm
    icon: Target,
  },
  constraints: {
    label: 'Constraints',
    description: 'Rules and limits to respect',
    color: '#fb7185',   // rose-400 — close to Mermaid accent
    icon: ShieldAlert,
  },
  examples: {
    label: 'Examples',
    description: 'Few-shot input/output pairs',
    color: '#c4b5fd',   // violet-300 — soft, pedagogical
    icon: Lightbulb,
  },
  output_format: {
    label: 'Output Format',
    description: 'Expected format of the response',
    color: '#ff6b9d',   // accent-light — "end" signal, aligned with design system
    icon: LogOut,
  },
  format_control: {
    label: 'Format Control',
    description: 'Free-form Claude directives: tone, verbosity, markdown',
    color: '#fdba74',   // orange-300 — style, formatting
    icon: SlidersHorizontal,
  },
  response_style: {
    label: 'Response Style',
    description: 'Verbosity, tone, prose, markdown, LaTeX',
    color: '#2dd4bf',   // teal-400 — style & UX
    icon: Wand2,
  },
  language: {
    label: 'Language',
    description: 'Language the AI should respond in',
    color: '#38bdf8',   // sky-400 — international, communication
    icon: Languages,
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
  skipPreamble: true,   // enabled by default — almost universally desired
}

/**
 * Generates Claude directives from the structured options.
 * Only non-default values produce output text.
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

/** Output format of the assembled prompt according to the target platform */
export type OutputFormat = 'claude' | 'chatgpt' | 'gemini'

// ─── Compiled Prompt ─────────────────────────────────────────────────────────

export interface CompiledPrompt {
  /** Assembled prompt for each platform — generated in a single pass */
  formats: Record<OutputFormat, string>
  tokenEstimate: number
  blocks: BlockData[]
}
