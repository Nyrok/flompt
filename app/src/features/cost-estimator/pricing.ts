export interface ModelPricing {
  id: string
  name: string
  inputPricePer1M: number
  outputPricePer1M: number
}

export const MODELS: ModelPricing[] = [
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', inputPricePer1M: 3.00,  outputPricePer1M: 15.00 },
  { id: 'claude-3-5-haiku',  name: 'Claude 3.5 Haiku',  inputPricePer1M: 0.80,  outputPricePer1M:  4.00 },
  { id: 'gpt-4o',            name: 'GPT-4o',            inputPricePer1M: 2.50,  outputPricePer1M: 10.00 },
  { id: 'gpt-4o-mini',       name: 'GPT-4o mini',       inputPricePer1M: 0.15,  outputPricePer1M:  0.60 },
  { id: 'gemini-1.5-pro',    name: 'Gemini 1.5 Pro',    inputPricePer1M: 1.25,  outputPricePer1M:  5.00 },
  { id: 'gemini-1.5-flash',  name: 'Gemini 1.5 Flash',  inputPricePer1M: 0.075, outputPricePer1M:  0.30 },
]

export function estimateCost(tokens: number, model: ModelPricing): number {
  return (tokens / 1_000_000) * model.inputPricePer1M
}

export function formatCost(usd: number): string {
  if (usd < 0.0001) return '<$0.0001'
  if (usd < 0.01)   return `$${usd.toFixed(4)}`
  return `$${usd.toFixed(3)}`
}

export function tokenBadgeColor(tokens: number): string {
  if (tokens < 1000) return '#22c55e'
  if (tokens < 5000) return '#f59e0b'
  return '#ef4444'
}
