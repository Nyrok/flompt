import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useFlowStore } from '@/store/flowStore'
import type { FlomptNode, FlomptEdge, CompiledPrompt, OutputFormat } from '@/types/blocks'

export const DEFAULT_PROJECT_ID = '__default__'

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

  ensureDefault: (name: string) => void
  createProject: (name?: string) => void
  switchProject: (id: string) => void
  renameProject: (id: string, name: string) => void
  deleteProject: (id: string) => void
  saveCurrentProject: () => void
  exportProjects: () => void
  importProjects: (file: File) => Promise<void>
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

      ensureDefault: (name: string) => {
        const { projects } = get()
        if (projects.length > 0) return
        const now = new Date().toISOString()
        const defaultProject: Project = {
          id: DEFAULT_PROJECT_ID,
          name,
          createdAt: now,
          updatedAt: now,
          nodes: [],
          edges: [],
          rawPrompt: '',
          compiledPrompt: null,
          outputFormat: 'claude',
        }
        set({ projects: [defaultProject], currentProjectId: DEFAULT_PROJECT_ID })
      },

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
        // Cannot delete the default project
        if (id === DEFAULT_PROJECT_ID) return

        const { projects, currentProjectId } = get()
        const remaining = projects.filter((p) => p.id !== id)

        if (id === currentProjectId) {
          const next = remaining[remaining.length - 1]
          set({ projects: remaining, currentProjectId: next.id })
          loadIntoFlow(next)
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

      exportProjects: () => {
        // Save current state first
        get().saveCurrentProject()
        const { projects } = get()
        const json = JSON.stringify(projects, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `flompt-projects-${new Date().toISOString().slice(0, 10)}.json`
        a.click()
        URL.revokeObjectURL(url)
      },

      importProjects: async (file: File) => {
        try {
          const text = await file.text()
          const imported: Project[] = JSON.parse(text)
          if (!Array.isArray(imported) || imported.length === 0) return

          // Save current state
          get().saveCurrentProject()

          const { projects } = get()
          const existingIds = new Set(projects.map((p) => p.id))

          // Merge: skip duplicates by id
          const newProjects = imported.filter((p) => !existingIds.has(p.id))
          if (newProjects.length === 0) return

          set((s) => ({
            projects: [...s.projects, ...newProjects],
          }))
        } catch (e) {
          console.error('Failed to import projects:', e)
        }
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
