import type { FlomptNode, BlockType } from '@/types/blocks'

const TYPE_PRIORITY: Record<BlockType, number> = {
  document:         0,
  role:             1,
  tools:            2,
  audience:         3,
  context:          4,
  environment:      5,
  objective:        6,
  goal:             7,
  input:            8,
  constraints:      9,
  guardrails:       10,
  examples:         11,
  chain_of_thought: 12,
  output_format:    13,
  response_style:   14,
  language:         15,
}

const BLOCK_W    = 320   // block max-width
const H_PAD      = 120   // min horizontal gap between blocks
const V_PAD      = 100   // min vertical gap between blocks
const MAX_TRIES  = 400   // attempts before falling back to safe row

const MARGIN     = 150   // extra scatter padding beyond canvas edges

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

  // ── Desktop: scatter proportional to the real canvas size ────────────────
  const spreadX = canvasWidth  + MARGIN
  const spreadY = canvasHeight + MARGIN

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

/** Reads current canvas dimensions from the DOM, with safe fallbacks. */
export function getCanvasSize(): { w: number; h: number } {
  const el = document.querySelector('.flow-canvas') ?? document.querySelector('.react-flow')
  if (el) {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) return { w: r.width, h: r.height }
  }
  return { w: 900, h: 700 }
}

/**
 * Finds a collision-free position for a single new node given existing nodes.
 * Uses the same scatter + collision logic as layoutNodes.
 */
export function findFreePosition(
  existingNodes: FlomptNode[],
  newNode: FlomptNode,
  canvasWidth  = 900,
  canvasHeight = 700,
): { x: number; y: number } {
  const h = estimateHeight(newNode)
  const spreadX = canvasWidth  + MARGIN
  const spreadY = canvasHeight + MARGIN

  type Rect = { x: number; y: number; w: number; h: number }
  const placed: Rect[] = existingNodes.map(n => ({
    x: n.position.x,
    y: n.position.y,
    w: BLOCK_W,
    h: estimateHeight(n),
  }))

  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const tx = 40 + Math.random() * spreadX
    const ty = 40 + Math.random() * spreadY
    if (!placed.some(p => overlaps(tx, ty, BLOCK_W, h, p.x, p.y, p.w, p.h))) {
      return { x: Math.round(tx), y: Math.round(ty) }
    }
  }

  // Fallback: stack below the lowest existing block
  const maxBottom = placed.reduce((m, p) => Math.max(m, p.y + p.h), 40)
  return {
    x: Math.round(40 + Math.random() * Math.min(spreadX, 400)),
    y: Math.round(maxBottom + V_PAD),
  }
}
