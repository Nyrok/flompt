import type { FlomptNode, BlockType } from '@/types/blocks'
import type { AuditCheck, AuditResult } from './types'

interface CheckDef {
  blockType: BlockType
  label: string
  weight: number
  tip: string
}

const CHECKS: CheckDef[] = [
  {
    blockType: 'role',
    label:     'Role defined',
    weight:    20,
    tip:       'Define the AI persona — consistent behavior starts here.',
  },
  {
    blockType: 'objective',
    label:     'Objective clear',
    weight:    20,
    tip:       'State exactly what you want the AI to accomplish.',
  },
  {
    blockType: 'constraints',
    label:     'Constraints set',
    weight:    15,
    tip:       'Rules and limits narrow the output and reduce hallucinations.',
  },
  {
    blockType: 'output_format',
    label:     'Output format',
    weight:    15,
    tip:       'Specify the expected format: list, JSON, markdown, prose…',
  },
  {
    blockType: 'examples',
    label:     'Examples provided',
    weight:    15,
    tip:       'Few-shot examples are one of the highest-impact prompt additions.',
  },
  {
    blockType: 'context',
    label:     'Context added',
    weight:    10,
    tip:       'Background info helps the AI understand your situation.',
  },
  {
    blockType: 'input',
    label:     'Input defined',
    weight:    5,
    tip:       'Clearly mark what data the AI will process.',
  },
]

export { CHECKS }

export function computeAudit(nodes: FlomptNode[]): AuditResult {
  const presentTypes = new Set<BlockType>(
    nodes.filter(n => !n.data.hidden).map(n => n.data.type)
  )

  const checks: AuditCheck[] = CHECKS.map(c => ({
    ...c,
    present: presentTypes.has(c.blockType),
  }))

  const maxScore   = CHECKS.reduce((s, c) => s + c.weight, 0)
  const earned     = checks.filter(c => c.present).reduce((s, c) => s + c.weight, 0)
  const score      = Math.round((earned / maxScore) * 100)

  return { score, checks }
}
