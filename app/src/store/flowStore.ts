import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow'
import type { Connection, NodeChange, EdgeChange } from 'reactflow'
import type { FlomptNode, FlomptEdge, CompiledPrompt, OutputFormat } from '@/types/blocks'

// ── Snapshot type pour undo/redo ─────────────────────────────────────────────
interface Snapshot {
  nodes: FlomptNode[]
  edges: FlomptEdge[]
}

export type Tab = 'input' | 'canvas' | 'output'

export interface QueueStatus {
  position: number  // 1 = prochain en file, 0 = en cours de traitement / analyzing
  status: 'analyzing' | 'queued' | 'processing'
}

interface FlowState {
  nodes: FlomptNode[]
  edges: FlomptEdge[]
  rawPrompt: string
  compiledPrompt: CompiledPrompt | null
  isDecomposing: boolean
  activeTab: Tab
  queueStatus: QueueStatus | null
  outputFormat: OutputFormat

  // Historique undo/redo
  past: Snapshot[]
  future: Snapshot[]

  // Actions
  setRawPrompt: (prompt: string) => void
  setNodes: (nodes: FlomptNode[]) => void
  setEdges: (edges: FlomptEdge[]) => void
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  updateNodeContent: (id: string, content: string) => void
  updateNodeData: (id: string, patch: Partial<import('@/types/blocks').BlockData>) => void
  addNode: (node: FlomptNode) => void
  removeNode: (id: string) => void
  setCompiledPrompt: (prompt: CompiledPrompt | null) => void
  setIsDecomposing: (v: boolean) => void
  setActiveTab: (tab: Tab) => void
  setQueueStatus: (status: QueueStatus | null) => void
  setOutputFormat: (format: OutputFormat) => void
  reset: () => void
  undo: () => void
  redo: () => void
}

const snapshot = (state: FlowState): Snapshot => ({
  nodes: state.nodes,
  edges: state.edges,
})

const MAX_HISTORY = 30

export const useFlowStore = create<FlowState>()(
  persist(
    (set) => ({
      nodes: [],
      edges: [],
      rawPrompt: '',
      compiledPrompt: null,
      isDecomposing: false,
      activeTab: 'input' as Tab,
      queueStatus: null,
      outputFormat: 'claude' as OutputFormat,
      past: [],
      future: [],

      setRawPrompt: (prompt) => set({ rawPrompt: prompt }),

      setNodes: (nodes) =>
        set((state) => ({
          past: [...state.past.slice(-MAX_HISTORY), snapshot(state)],
          future: [],
          nodes,
          compiledPrompt: null,
        })),

      setEdges: (edges) =>
        set((state) => ({
          past: [...state.past.slice(-MAX_HISTORY), snapshot(state)],
          future: [],
          edges,
          compiledPrompt: null,
        })),

      onNodesChange: (changes) =>
        set((state) => {
          const isStructural = changes.some((c) => c.type === 'remove' || c.type === 'add')
          return {
            nodes: applyNodeChanges(changes, state.nodes) as FlomptNode[],
            ...(isStructural ? { compiledPrompt: null } : {}),
          }
        }),

      onEdgesChange: (changes) =>
        set((state) => {
          const isStructural = changes.some((c) => c.type === 'remove' || c.type === 'add')
          return {
            edges: applyEdgeChanges(changes, state.edges) as FlomptEdge[],
            ...(isStructural ? { compiledPrompt: null } : {}),
          }
        }),

      onConnect: (connection) =>
        set((state) => ({
          edges: addEdge({ ...connection, type: 'custom' }, state.edges) as FlomptEdge[],
          compiledPrompt: null,
        })),

      updateNodeContent: (id, content) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, content } } : n
          ),
          compiledPrompt: null,
        })),

      updateNodeData: (id, patch) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
          ),
          compiledPrompt: null,
        })),

      addNode: (node) =>
        set((state) => ({
          past: [...state.past.slice(-MAX_HISTORY), snapshot(state)],
          future: [],
          nodes: [...state.nodes, node],
          compiledPrompt: null,
        })),

      removeNode: (id) =>
        set((state) => ({
          past: [...state.past.slice(-MAX_HISTORY), snapshot(state)],
          future: [],
          nodes: state.nodes.filter((n) => n.id !== id),
          edges: state.edges.filter((e) => e.source !== id && e.target !== id),
          compiledPrompt: null,
        })),

      setCompiledPrompt: (prompt) => set({ compiledPrompt: prompt }),
      setIsDecomposing: (v) => set({ isDecomposing: v }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setQueueStatus: (status) => set({ queueStatus: status }),
      // Ne pas reset compiledPrompt — tous les formats sont déjà générés en une passe
      setOutputFormat: (format) => set({ outputFormat: format }),

      reset: () =>
        set({
          nodes: [],
          edges: [],
          rawPrompt: '',
          compiledPrompt: null,
          past: [],
          future: [],
        }),

      undo: () =>
        set((state) => {
          if (state.past.length === 0) return state
          const prev = state.past[state.past.length - 1]
          return {
            past: state.past.slice(0, -1),
            future: [snapshot(state), ...state.future].slice(0, MAX_HISTORY),
            nodes: prev.nodes,
            edges: prev.edges,
          }
        }),

      redo: () =>
        set((state) => {
          if (state.future.length === 0) return state
          const next = state.future[0]
          return {
            past: [...state.past.slice(-MAX_HISTORY), snapshot(state)],
            future: state.future.slice(1),
            nodes: next.nodes,
            edges: next.edges,
          }
        }),
    }),
    {
      name: 'flompt-session',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        rawPrompt: state.rawPrompt,
        compiledPrompt: state.compiledPrompt,
        outputFormat: state.outputFormat,
        // isDecomposing / past / future : états transitoires, non persistés
      }),
    }
  )
)
