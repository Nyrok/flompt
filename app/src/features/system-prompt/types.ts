export interface SystemSection {
  name: string
  content: string
}

export interface SystemPromptResult {
  sections: SystemSection[]
  fullPrompt: string
  totalTokens: number
}
