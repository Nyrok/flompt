export interface CriticDimension {
  name: string
  score: number
  feedback: string
}

export interface CriticResult {
  overallScore: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  dimensions: CriticDimension[]
  strengths: string[]
  weaknesses: string[]
  topRecommendation: string
}
