import type { FlomptNode, FlomptEdge, CompiledPrompt, BlockType, OutputFormat, ResponseStyleOptions } from '@/types/blocks'
import { generateResponseStyleContent } from '@/types/blocks'

// ─── Claude-optimized block ordering ────────────────────────────────────────
// Anthropic best practices: documents first (grounding), then persona → task →
// data → constraints → examples → reasoning → format → language

const TYPE_PRIORITY: Record<BlockType, number> = {
  document:        0,   // XML grounding — always first
  role:            1,   // persona
  context:         2,   // background
  objective:       3,   // main task
  input:           4,   // data/variables
  constraints:     5,   // rules
  examples:        6,   // few-shot
  output_format:   7,   // response format
  format_control:  9,   // free-text style directives
  response_style:  9,   // structured style directives (same priority as format_control)
  language:        10,  // language instruction — always last
}

// ─── Topological sort (Kahn's algorithm) ────────────────────────────────────

function sortNodes(nodes: FlomptNode[], edges: FlomptEdge[]): FlomptNode[] {
  const safeEdges = edges ?? []
  if (safeEdges.length === 0) {
    // No edges: sort by TYPE_PRIORITY, then Y position as tiebreaker
    return [...nodes].sort((a, b) => {
      const pa = TYPE_PRIORITY[a.data.type] ?? 99
      const pb = TYPE_PRIORITY[b.data.type] ?? 99
      if (pa !== pb) return pa - pb
      return a.position.y - b.position.y || a.position.x - b.position.x
    })
  }

  const inDegree = new Map(nodes.map(n => [n.id, 0]))
  const adjList  = new Map(nodes.map(n => [n.id, [] as string[]]))

  for (const edge of safeEdges) {
    adjList.get(edge.source)?.push(edge.target)
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1)
  }

  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  // Start with roots (nodes with no incoming edges), sorted by TYPE_PRIORITY
  const queue = nodes
    .filter(n => (inDegree.get(n.id) ?? 0) === 0)
    .sort((a, b) => (TYPE_PRIORITY[a.data.type] ?? 99) - (TYPE_PRIORITY[b.data.type] ?? 99))
  const result: FlomptNode[] = []

  while (queue.length > 0) {
    const node = queue.shift()!
    result.push(node)
    const neighbors = (adjList.get(node.id) ?? [])
      .map(id => nodeMap.get(id)!)
      .filter(Boolean)
      .sort((a, b) => (TYPE_PRIORITY[a.data.type] ?? 99) - (TYPE_PRIORITY[b.data.type] ?? 99))

    for (const neighbor of neighbors) {
      const deg = (inDegree.get(neighbor.id) ?? 1) - 1
      inDegree.set(neighbor.id, deg)
      if (deg === 0) queue.push(neighbor)
    }
  }

  // Remaining nodes (cycles) — sorted by TYPE_PRIORITY
  const inResult  = new Set(result.map(n => n.id))
  const remaining = nodes
    .filter(n => !inResult.has(n.id))
    .sort((a, b) => (TYPE_PRIORITY[a.data.type] ?? 99) - (TYPE_PRIORITY[b.data.type] ?? 99))

  return [...result, ...remaining]
}

// ─── XML helpers ─────────────────────────────────────────────────────────────

/** Escape special XML characters */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Indent every line by `spaces` spaces */
function indent(str: string, spaces: number): string {
  const pad = ' '.repeat(spaces)
  return str.split('\n').map(l => pad + l).join('\n')
}

// ─── Shared example parser ────────────────────────────────────────────────────

/**
 * Parse "Input: [...]\nOutput: [...]" pairs from an examples block.
 * Returns an empty array if no structured pairs are found.
 */
function parseExamplePairs(content: string): Array<{ input: string; output: string }> {
  const blocks = content.trim().split(/\n{2,}/)
  const pairs: Array<{ input: string; output: string }> = []

  for (const block of blocks) {
    const inputMatch  = block.match(/^(?:Input|User|Question|Q)\s*:\s*([\s\S]*?)(?=\n(?:Output|Assistant|Answer|A)\s*:|$)/i)
    const outputMatch = block.match(/(?:Output|Assistant|Answer|A)\s*:\s*([\s\S]*?)$/i)
    if (inputMatch && outputMatch) {
      pairs.push({ input: inputMatch[1].trim(), output: outputMatch[1].trim() })
    }
  }

  return pairs
}

// ─── Claude-specific block renderers ─────────────────────────────────────────

/**
 * Render <document> blocks as proper Anthropic XML grounding format.
 * Multiple document blocks are grouped under <documents>.
 *
 * Format:
 *   <documents>
 *     <document index="1">
 *       <source>User document</source>
 *       <document_content>
 *         {content}
 *       </document_content>
 *     </document>
 *   </documents>
 */
function renderDocuments(docNodes: FlomptNode[]): string {
  const docs = docNodes
    .filter(n => n.data.content.trim())
    .map((n, i) => {
      const content = indent(escapeXml(n.data.content.trim()), 8)
      const source  = escapeXml(n.data.summary || `Document ${i + 1}`)
      return [
        `    <document index="${i + 1}">`,
        `      <source>${source}</source>`,
        `      <document_content>`,
        content,
        `      </document_content>`,
        `    </document>`,
      ].join('\n')
    })
    .join('\n')

  return `  <documents>\n${docs}\n  </documents>`
}

/**
 * Render <examples> block with structured input/output pairs.
 * Parses "Input: [...]\nOutput: [...]" format when present,
 * otherwise wraps the raw content in a single <example>.
 *
 * Format:
 *   <examples>
 *     <example>
 *       <user_input>…</user_input>
 *       <ideal_response>…</ideal_response>
 *     </example>
 *   </examples>
 */
function renderExamples(content: string): string {
  const pairs = parseExamplePairs(content)

  if (pairs.length === 0) {
    // No parseable pairs — wrap raw content
    const escaped = indent(escapeXml(content.trim()), 8)
    return [
      `  <examples>`,
      `    <example>`,
      escaped,
      `    </example>`,
      `  </examples>`,
    ].join('\n')
  }

  const xmlPairs = pairs.map(p => [
    `    <example>`,
    `      <user_input>${escapeXml(p.input)}</user_input>`,
    `      <ideal_response>${escapeXml(p.output)}</ideal_response>`,
    `    </example>`,
  ].join('\n')).join('\n')

  return `  <examples>\n${xmlPairs}\n  </examples>`
}

/**
 * Standard block renderer — wraps content in a simple XML tag.
 * format_control → <format_instructions>
 */
function renderStandardBlock(type: BlockType, content: string): string {
  const tagMap: Partial<Record<BlockType, string>> = {
    format_control:   'format_instructions',
    response_style:   'format_instructions',
    output_format:    'output_format',
  }
  const tag = tagMap[type] ?? type
  const escaped = indent(escapeXml(content.trim()), 4)
  return `  <${tag}>\n${escaped}\n  </${tag}>`
}

// ─── Markdown helpers (ChatGPT / Gemini) ─────────────────────────────────────

const MD_HEADING: Record<BlockType, string> = {
  role:             'Role',
  context:          'Context',
  objective:        'Objective',
  input:            'Input',
  constraints:      'Constraints',
  examples:         'Examples',
  output_format:    'Output Format',
  format_control:   'Style Guidelines',
  response_style:   'Style Guidelines',
  language:         'Language',
  document:         'Documents',
}

function renderMarkdownDocuments(docNodes: FlomptNode[]): string {
  const docs = docNodes
    .filter(n => n.data.content.trim())
    .map((n, i) => {
      const source = n.data.summary || `Document ${i + 1}`
      return `**Document ${i + 1}** — ${source}\n\n${n.data.content.trim()}`
    })
    .join('\n\n---\n\n')
  return `## Documents\n\n${docs}`
}

function renderMarkdownExamples(content: string): string {
  const pairs = parseExamplePairs(content)

  if (pairs.length === 0) {
    return `## Examples\n\n${content.trim()}`
  }

  const formatted = pairs
    .map((p, i) => [`**Example ${i + 1}**`, `- Input: ${p.input}`, `- Output: ${p.output}`].join('\n'))
    .join('\n\n')

  return `## Examples\n\n${formatted}`
}

function renderMarkdownBlock(type: BlockType, content: string): string {
  const heading = MD_HEADING[type] ?? type
  return `## ${heading}\n\n${content.trim()}`
}

// ─── Node content resolution ──────────────────────────────────────────────────

/**
 * For `response_style` blocks, generates content from `data.options` at compile
 * time (source of truth), not from `data.content` (which may be empty if the
 * block was just created or if all options are at their default values).
 */
function resolveContent(node: FlomptNode): string {
  if (node.data.type === 'response_style' && node.data.options) {
    return generateResponseStyleContent(node.data.options as unknown as ResponseStyleOptions)
  }
  return node.data.content
}

// ─── Internal raw builders (return string) ───────────────────────────────────

/** Builds the Claude XML from already-sorted nodes */
function buildXmlRaw(ordered: FlomptNode[]): string {
  // response_style: included if options are defined (even if content is empty)
  const withContent = ordered.filter(n =>
    n.data.type === 'response_style' ? !!n.data.options : n.data.content.trim()
  )
  const parts: string[] = []

  const docNodes = withContent.filter(n => n.data.type === 'document')
  if (docNodes.length > 0) parts.push(renderDocuments(docNodes))

  for (const node of withContent) {
    if (node.data.type === 'document') continue
    const content = resolveContent(node)
    if (!content.trim()) continue   // all options at default → nothing to emit
    if (node.data.type === 'examples') {
      parts.push(renderExamples(content))
    } else {
      parts.push(renderStandardBlock(node.data.type, content))
    }
  }

  return `<prompt>\n${parts.join('\n')}\n</prompt>`
}

/** Builds the ChatGPT/Gemini Markdown from already-sorted nodes */
function buildMarkdownRaw(ordered: FlomptNode[]): string {
  const withContent = ordered.filter(n =>
    n.data.type === 'response_style' ? !!n.data.options : n.data.content.trim()
  )
  const parts: string[] = []

  const docNodes = withContent.filter(n => n.data.type === 'document')
  if (docNodes.length > 0) parts.push(renderMarkdownDocuments(docNodes))

  for (const node of withContent) {
    if (node.data.type === 'document') continue
    const content = resolveContent(node)
    if (!content.trim()) continue
    if (node.data.type === 'examples') {
      parts.push(renderMarkdownExamples(content))
    } else {
      parts.push(renderMarkdownBlock(node.data.type, content))
    }
  }

  return parts.join('\n\n')
}

// ─── Main assembler ───────────────────────────────────────────────────────────

/**
 * Assemble blocks into all platform formats in a single pass — 100% local, no AI call.
 *
 * Returns formats for all 3 platforms simultaneously:
 * - claude  → XML Claude-optimized
 * - chatgpt → Markdown with ## headings
 * - gemini  → Markdown with ## headings (same renderer as chatgpt)
 *
 * The UI selector switches which format is displayed/copied/injected.
 */
export function assemblePrompt(nodes: FlomptNode[], edges: FlomptEdge[]): CompiledPrompt {
  const ordered = sortNodes(nodes, edges)

  const claudeRaw   = buildXmlRaw(ordered)
  const markdownRaw = buildMarkdownRaw(ordered)

  const formats: Record<OutputFormat, string> = {
    claude:  claudeRaw,
    chatgpt: markdownRaw,
    gemini:  markdownRaw,
  }

  // tokenEstimate based on the Claude XML (the longest in general)
  const tokenEstimate = Math.max(1, Math.ceil(claudeRaw.length / 4))

  return { formats, tokenEstimate, blocks: ordered.map(n => n.data) }
}
