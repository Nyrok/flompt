import type { FlomptNode, BlockType } from '@/types/blocks'

// Mirrors TYPE_PRIORITY from assemblePrompt.ts — used to sort blocks spatially
const TYPE_PRIORITY: Record<BlockType, number> = {
  document:         0,
  role:             1,
  audience:         2,
  context:          3,
  objective:        4,
  goal:             5,
  input:            6,
  constraints:      7,
  examples:         8,
  chain_of_thought: 9,
  output_format:    10,
  response_style:   11,
  language:         12,
}

const COL_WIDTH   = 340  // matches block max-width (320px) + 20px margin
const COL_GAP     = 40   // horizontal gap between columns
const ROW_HEIGHT  = 240  // estimated height per block (expanded, avg content)
const START_X     = 40
const START_Y     = 40

/**
 * Sorts nodes by TYPE_PRIORITY and computes canvas positions.
 * Mobile (< 768px): single column.
 * Desktop: 2-column grid (left→right, top→bottom).
 */
export function layoutNodes(nodes: FlomptNode[]): FlomptNode[] {
  const sorted = [...nodes].sort(
    (a, b) => (TYPE_PRIORITY[a.data.type] ?? 99) - (TYPE_PRIORITY[b.data.type] ?? 99)
  )

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const cols = isMobile ? 1 : 2

  return sorted.map((node, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    return {
      ...node,
      position: {
        x: START_X + col * (COL_WIDTH + COL_GAP),
        y: START_Y + row * ROW_HEIGHT,
      },
    }
  })
}
