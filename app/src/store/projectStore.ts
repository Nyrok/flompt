import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useFlowStore } from '@/store/flowStore'
import type { FlomptNode, FlomptEdge, CompiledPrompt, OutputFormat } from '@/types/blocks'

export interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  // Workspace snapshot
  nodes: FlomptNode[]
  edges: FlomptEdge[]
  rawPrompt: string
  compiledPrompt: CompiledPrompt | null
  outputFormat: OutputFormat
}

interface ProjectState {
  projects: Project[]
  currentProjectId: string | null

  createProject: (name?: string) => void
  switchProject: (id: string) => void
  renameProject: (id: string, name: string) => void
  deleteProject: (id: string) => void
  saveCurrentProject: () => void
}

/** Snapshot the current flowStore state into a Project shape. */
function snapshotFlow(): Pick<Project, 'nodes' | 'edges' | 'rawPrompt' | 'compiledPrompt' | 'outputFormat'> {
  const f = useFlowStore.getState()
  return {
    nodes: f.nodes,
    edges: f.edges,
    rawPrompt: f.rawPrompt,
    compiledPrompt: f.compiledPrompt,
    outputFormat: f.outputFormat,
  }
}

/** Load a project's workspace state into flowStore (bypasses undo history). */
function loadIntoFlow(project: Project) {
  useFlowStore.setState({
    nodes: project.nodes,
    edges: project.edges,
    rawPrompt: project.rawPrompt,
    compiledPrompt: project.compiledPrompt,
    outputFormat: project.outputFormat,
    lastDecomposedPrompt: '',
    past: [],
    future: [],
  })
}

function nextProjectName(projects: Project[]): string {
  const nums = projects
    .map((p) => {
      const m = p.name.match(/^Project (\d+)$/)
      return m ? parseInt(m[1], 10) : 0
    })
    .filter((n) => n > 0)
  const max = nums.length > 0 ? Math.max(...nums) : 0
  return `Project ${max + 1}`
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,

      createProject: (name) => {
        const { projects, currentProjectId } = get()

        // Save current project before creating a new one
        if (currentProjectId) {
          const now = new Date().toISOString()
          set({
            projects: projects.map((p) =>
              p.id === currentProjectId
                ? { ...p, ...snapshotFlow(), updatedAt: now }
                : p
            ),
          })
        }

        const id = crypto.randomUUID()
        const now = new Date().toISOString()
        const newProject: Project = {
          id,
          name: name || nextProjectName(get().projects),
          createdAt: now,
          updatedAt: now,
          nodes: [],
          edges: [],
          rawPrompt: '',
          compiledPrompt: null,
          outputFormat: 'claude',
        }

        set((s) => ({
          projects: [...s.projects, newProject],
          currentProjectId: id,
        }))

        // Clear flowStore for fresh workspace (bypass undo history)
        useFlowStore.setState({
          nodes: [], edges: [], rawPrompt: '', compiledPrompt: null,
          lastDecomposedPrompt: '', past: [], future: [],
        })
      },

      switchProject: (id) => {
        const { projects, currentProjectId } = get()
        if (id === currentProjectId) return

        const target = projects.find((p) => p.id === id)
        if (!target) return

        // Save current project
        const now = new Date().toISOString()
        const updated = projects.map((p) =>
          p.id === currentProjectId
            ? { ...p, ...snapshotFlow(), updatedAt: now }
            : p
        )

        set({ projects: updated, currentProjectId: id })
        loadIntoFlow(target)
      },

      renameProject: (id, name) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p
          ),
        }))
      },

      deleteProject: (id) => {
        const { projects, currentProjectId } = get()
        const remaining = projects.filter((p) => p.id !== id)

        if (id === currentProjectId) {
          // Switch to another project or clear
          if (remaining.length > 0) {
            const next = remaining[remaining.length - 1]
            set({ projects: remaining, currentProjectId: next.id })
            loadIntoFlow(next)
          } else {
            set({ projects: [], currentProjectId: null })
            useFlowStore.setState({
              nodes: [], edges: [], rawPrompt: '', compiledPrompt: null,
              lastDecomposedPrompt: '', past: [], future: [],
            })
          }
        } else {
          set({ projects: remaining })
        }
      },

      saveCurrentProject: () => {
        const { currentProjectId, projects } = get()
        if (!currentProjectId) return
        const now = new Date().toISOString()
        set({
          projects: projects.map((p) =>
            p.id === currentProjectId
              ? { ...p, ...snapshotFlow(), updatedAt: now }
              : p
          ),
        })
      },
    }),
    {
      name: 'flompt-projects',
      partialize: (state) => ({
        projects: state.projects,
        currentProjectId: state.currentProjectId,
      }),
    }
  )
)
