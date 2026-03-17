import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { getDB, type PromptVersion } from '@/lib/db'
import { useFlowStore } from '@/store/flowStore'
import { computeLineDiff, type DiffLine } from '@/lib/diff'

interface VersionState {
  versions: PromptVersion[]
  isOpen: boolean
  isLoaded: boolean
  diffView: { idA: string; idB: string; lines: DiffLine[] } | null
  setOpen: (open: boolean) => void
  load: (projectId: string) => Promise<void>
  save: (projectId: string, message?: string) => Promise<void>
  rollback: (version: PromptVersion) => void
  showDiff: (idA: string, idB: string) => void
  closeDiff: () => void
  remove: (id: string) => Promise<void>
}

export const useVersionStore = create<VersionState>((set, get) => ({
  versions: [],
  isOpen: false,
  isLoaded: false,
  diffView: null,

  setOpen: (isOpen) => set({ isOpen }),

  load: async (projectId) => {
    const db = await getDB()
    const all = await db.getAllFromIndex('versions', 'by-project', projectId)
    all.sort((a, b) => b.version - a.version)
    set({ versions: all, isLoaded: true })
  },

  save: async (projectId, message) => {
    const { nodes, edges, rawPrompt, compiledPrompt } = useFlowStore.getState()
    const existing = get().versions.filter(v => v.projectId === projectId)
    const versionNum = (existing[0]?.version ?? 0) + 1
    const compiledOutput = compiledPrompt
      ? (compiledPrompt.formats.claude ?? Object.values(compiledPrompt.formats)[0] ?? rawPrompt)
      : rawPrompt
    const version: PromptVersion = {
      id: nanoid(),
      projectId,
      version: versionNum,
      label: message ?? `v${versionNum}`,
      message: message ?? '',
      prompt: rawPrompt,
      output: compiledOutput,
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      tokenCount: compiledPrompt?.tokenEstimate ?? 0,
      createdAt: new Date().toISOString(),
      tags: [],
    }
    const db = await getDB()
    await db.put('versions', version)
    set(state => ({ versions: [version, ...state.versions] }))
  },

  rollback: (version) => {
    const store = useFlowStore.getState()
    store.setNodes(version.nodes)
    store.setEdges(version.edges)
  },

  showDiff: (idA, idB) => {
    const versions = get().versions
    const vA = versions.find(v => v.id === idA)
    const vB = versions.find(v => v.id === idB)
    if (!vA || !vB) return
    const lines = computeLineDiff(vA.output ?? vA.prompt, vB.output ?? vB.prompt)
    set({ diffView: { idA, idB, lines } })
  },

  closeDiff: () => set({ diffView: null }),

  remove: async (id) => {
    const db = await getDB()
    await db.delete('versions', id)
    set(state => ({ versions: state.versions.filter(v => v.id !== id) }))
  },
}))
