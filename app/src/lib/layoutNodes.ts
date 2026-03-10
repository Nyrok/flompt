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

const BLOCK_W    = 320   // block max-width
const H_PAD      = 40    // min horizontal gap between blocks
const V_PAD      = 36    // min vertical gap between blocks
const MAX_TRIES  = 300   // attempts before falling back to safe row

// Flow coordinate space — independent of canvas pixel size.
// fitView() zooms to fit everything, so we can use large values freely.
const FLOW_W     = 2000  // horizontal scatter range
const FLOW_H     = 1400  // vertical scatter range

// Mobile layout constants
const MOBILE_GAP = 20
const MOBILE_ROW = 220

/** Estimates block height from content so collision math doesn't need the DOM. */
function estimateHeight(node: FlomptNode): number {
  if (node.data.type === 'language')        return 52
  if (node.data.type === 'response_style')  return 240
  const chars    = (node.data.content ?? '').length
  const textRows = Math.max(3, Math.ceil(chars / 42))
  return 44 + textRows * 21 + 32 + 40   // header + textarea + footer + buffer
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
 * Desktop: random scatter using the actual canvas dimensions — no collisions guaranteed.
 *
 * @param canvasWidth  — real pixel width of the canvas container
 * @param canvasHeight — real pixel height of the canvas container
 */
export function layoutNodes(
  nodes: FlomptNode[],
  canvasWidth  = 900,
  canvasHeight = 700,
): FlomptNode[] {
  const sorted = [...nodes].sort(
    (a, b) => (TYPE_PRIORITY[a.data.type] ?? 99) - (TYPE_PRIORITY[b.data.type] ?? 99)
  )

  const isMobile = canvasWidth < 768

  // ── Mobile: single column ─────────────────────────────────────────────────
  if (isMobile) {
    return sorted.map((node, i) => ({
      ...node,
      position: { x: 40, y: 40 + i * (MOBILE_ROW + MOBILE_GAP) },
    }))
  }

  // ── Desktop: scatter in flow coordinate space (not pixels) ───────────────
  // fitView() handles zoom — positions can be much larger than the viewport.
  // Use canvas aspect ratio to shape the scatter area, but keep it large.
  const aspect  = canvasWidth > 0 ? canvasWidth / canvasHeight : 16 / 9
  const spreadX = FLOW_W
  const spreadY = Math.round(FLOW_W / aspect)

  type Rect = { x: number; y: number; w: number; h: number }
  const placed: Rect[] = []

  return sorted.map((node) => {
    const h = estimateHeight(node)
    let x = 40
    let y = 40
    let found = false

    for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
      const tx = 40 + Math.random() * spreadX
      const ty = 40 + Math.random() * spreadY
      if (!placed.some(p => overlaps(tx, ty, BLOCK_W, h, p.x, p.y, p.w, p.h))) {
        x = tx
        y = ty
        found = true
        break
      }
    }

    if (!found) {
      const maxBottom = placed.reduce((m, p) => Math.max(m, p.y + p.h), 40)
      x = 40 + Math.random() * spreadX
      y = maxBottom + V_PAD
    }

    placed.push({ x, y, w: BLOCK_W, h })
    return { ...node, position: { x: Math.round(x), y: Math.round(y) } }
  })
}
