export interface CompressChange {
  type: 'removed' | 'optimized' | 'merged'
  original: string
  replacement: string | null
  reason: string
  tokensSaved: number
}

export interface CompressResult {
  compressedPrompt: string
  changes: CompressChange[]
  tokensBefore: number
  tokensAfter: number
  reductionPercent: number
}
