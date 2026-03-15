export type IssueSeverity = 'error' | 'warning' | 'info'

export interface DebugIssue {
  id: string
  severity: IssueSeverity
  category: string
  message: string
  location?: string
  suggestion: string
}

export interface DebugResult {
  issues: DebugIssue[]
  score: number
  fixedPrompt: string
  improvements: string[]
  tokensBefore: number
  tokensAfter: number
}
