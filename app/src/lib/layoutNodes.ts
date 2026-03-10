import type { FlomptNode, BlockType } from '@/types/blocks'

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

const BLOCK_W       = 320   // block max-width
const H_PAD         = 32    // min horizontal gap between blocks
const V_PAD         = 28    // min vertical gap between blocks
const SPREAD_X      = 1360  // usable canvas width for scatter
const SPREAD_Y      = 920   // usable canvas height for scatter
const START_X       = 40
const START_Y       = 40
const MAX_TRIES     = 200   // attempts before falling back to safe row

// Mobile layout constants
const MOBILE_GAP    = 20
const MOBILE_ROW_H  = 220

/** Estimates block height from content so collision math doesn't need the DOM. */
function estimateHeight(node: FlomptNode): number {
  if (node.data.type === 'language')        return 52    // compact select, no body
  if (node.data.type === 'response_style')  return 240   // pill groups, fixed height
  const chars    = (node.data.content ?? '').length
  const textRows = Math.max(3, Math.ceil(chars / 42))
  const textH    = textRows * 21
  return 44 + textH + 32 + 40  // header + textarea + footer + safety buffer
}

function overlaps(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw + H_PAD
      && ax + aw + H_PAD > bx
      && ay < by + bh + V_PAD
      && ay + ah + V_PAD > by
}

/**
 * Sorts nodes by TYPE_PRIORITY and computes canvas positions.
 * Mobile (< 768px): single column.
 * Desktop: random scatter — "draft" look, guaranteed no collisions.
 */
export function layoutNodes(nodes: FlomptNode[]): FlomptNode[] {
  const sorted = [...nodes].sort(
    (a, b) => (TYPE_PRIORITY[a.data.type] ?? 99) - (TYPE_PRIORITY[b.data.type] ?? 99)
  )

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // ── Mobile: single column ─────────────────────────────────────────────────
  if (isMobile) {
    return sorted.map((node, i) => ({
      ...node,
      position: { x: START_X, y: START_Y + i * MOBILE_ROW_H },
    }))
  }

  // ── Desktop: scatter with collision avoidance ─────────────────────────────
  type Rect = { x: number; y: number; w: number; h: number }
  const placed: Rect[] = []

  return sorted.map((node) => {
    const h = estimateHeight(node)
    let x = START_X
    let y = START_Y
    let found = false

    for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
      const tx = START_X + Math.random() * (SPREAD_X - BLOCK_W)
      const ty = START_Y + Math.random() * (SPREAD_Y - h)
      if (!placed.some(p => overlaps(tx, ty, BLOCK_W, h, p.x, p.y, p.w, p.h))) {
        x = tx
        y = ty
        found = true
        break
      }
    }

    if (!found) {
      // Fallback: place below all existing blocks, offset slightly
      const maxBottom = placed.reduce((m, p) => Math.max(m, p.y + p.h), START_Y)
      x = START_X + Math.random() * (SPREAD_X - BLOCK_W)
      y = maxBottom + V_PAD
    }

    placed.push({ x, y, w: BLOCK_W, h })
    return { ...node, position: { x: Math.round(x), y: Math.round(y) } }
  })
}
