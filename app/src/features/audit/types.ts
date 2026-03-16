import type { BlockType } from '@/types/blocks'

export interface AuditCheck {
  blockType: BlockType
  label: string
  present: boolean
  weight: number
  tip: string
}

export interface AuditResult {
  score: number
  checks: AuditCheck[]
}
