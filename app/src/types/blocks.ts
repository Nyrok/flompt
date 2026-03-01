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
  | 'examples'
  | 'chain_of_thought'
  | 'language'

export interface BlockData {
  type: BlockType
  label: string
  content: string
  description: string
  summary?: string
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
    description: 'Directives Claude : ton, verbosité, markdown',
    color: '#fdba74',   // orange-300 — style, mise en forme
    icon: SlidersHorizontal,
  },
  language: {
    label: 'Langue',
    description: 'Langue de réponse de l\'IA',
    color: '#38bdf8',   // sky-400 — international, communication
    icon: Globe,
  },
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
