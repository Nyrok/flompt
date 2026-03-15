export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  content: string
  lineNumberBefore?: number
  lineNumberAfter?: number
}

export function computeLineDiff(textA: string, textB: string): DiffLine[] {
  const linesA = textA.split('\n')
  const linesB = textB.split('\n')
  const m = linesA.length, n = linesB.length

  // LCS-based diff (simple implementation)
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (linesA[i] === linesB[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1])
      }
    }
  }

  const result: DiffLine[] = []
  let i = 0, j = 0, lineA = 1, lineB = 1

  while (i < m && j < n) {
    if (linesA[i] === linesB[j]) {
      result.push({ type: 'unchanged', content: linesA[i], lineNumberBefore: lineA++, lineNumberAfter: lineB++ })
      i++; j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: 'removed', content: linesA[i], lineNumberBefore: lineA++ })
      i++
    } else {
      result.push({ type: 'added', content: linesB[j], lineNumberAfter: lineB++ })
      j++
    }
  }
  while (i < m) { result.push({ type: 'removed', content: linesA[i++], lineNumberBefore: lineA++ }) }
  while (j < n) { result.push({ type: 'added', content: linesB[j++], lineNumberAfter: lineB++ }) }

  return result
}
