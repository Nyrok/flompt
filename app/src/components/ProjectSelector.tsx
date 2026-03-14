import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Pencil, Check, ChevronDown, Download, Upload } from 'lucide-react'
import { useProjectStore, DEFAULT_PROJECT_ID } from '@/store/projectStore'
import { useLocale } from '@/i18n/LocaleContext'
import { analytics } from '@/lib/analytics'

const ProjectSelector = () => {
  const {
    projects, currentProjectId,
    createProject, switchProject, renameProject, deleteProject,
    exportProjects, importProjects, ensureDefault,
  } = useProjectStore()
  const { t } = useLocale()

  const [isOpen, setIsOpen] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameRef = useRef<HTMLInputElement>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentProject = projects.find((p) => p.id === currentProjectId)

  // Ensure default project exists on mount
  useEffect(() => {
    ensureDefault(t.projects.defaultProject)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Focus rename input when entering rename mode
  useEffect(() => {
    if (renamingId && renameRef.current) {
      renameRef.current.focus()
      renameRef.current.select()
    }
  }, [renamingId])

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  const handleCreate = () => {
    createProject()
    analytics.projectCreated()
    setIsOpen(false)
  }

  const handleSwitch = (id: string) => {
    switchProject(id)
    const p = projects.find((proj) => proj.id === id)
    if (p) analytics.projectSwitched(p.name)
    setIsOpen(false)
  }

  const handleStartRename = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const p = projects.find((proj) => proj.id === id)
    if (!p) return
    setRenameValue(p.name)
    setRenamingId(id)
  }

  const handleFinishRename = () => {
    if (renamingId && renameValue.trim()) {
      renameProject(renamingId, renameValue.trim())
    }
    setRenamingId(null)
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteProject(id)
    analytics.projectDeleted()
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await importProjects(file)
    e.target.value = ''
    setIsOpen(false)
  }

  const handleExport = () => {
    exportProjects()
    setIsOpen(false)
  }

  return (
    <div className="psel" ref={dropdownRef}>
      {/* Main pill — current project name + chevron */}
      <div className="psel-pill">
        <button
          className="psel-current"
          onClick={() => setIsOpen(!isOpen)}
          title={t.projects.selectProject}
        >
          <span className="psel-name">{currentProject?.name ?? '—'}</span>
          <ChevronDown size={12} className={`psel-chevron${isOpen ? ' open' : ''}`} />
        </button>
        <button className="psel-add" onClick={handleCreate} title={t.projects.newProject}>
          <Plus size={13} strokeWidth={2.5} />
        </button>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={importRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        style={{ display: 'none' }}
      />

      {/* Dropdown menu */}
      {isOpen && (
        <div className="psel-dropdown">
          {projects.map((p) => (
            <div
              key={p.id}
              className={`psel-item${p.id === currentProjectId ? ' active' : ''}`}
            >
              {renamingId === p.id ? (
                <form
                  className="psel-rename"
                  onSubmit={(e) => { e.preventDefault(); handleFinishRename() }}
                >
                  <input
                    ref={renameRef}
                    className="psel-rename-input"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={handleFinishRename}
                    onKeyDown={(e) => e.key === 'Escape' && setRenamingId(null)}
                    maxLength={40}
                  />
                  <button type="submit" className="psel-rename-ok" title={t.projects.rename}>
                    <Check size={12} strokeWidth={2.5} />
                  </button>
                </form>
              ) : (
                <>
                  <span
                    className="psel-item-name"
                    onClick={() => handleSwitch(p.id)}
                  >
                    {p.name}
                  </span>
                  <span className="psel-item-actions">
                    <span
                      className="psel-item-action"
                      onClick={(e) => handleStartRename(e, p.id)}
                      title={t.projects.rename}
                    >
                      <Pencil size={11} />
                    </span>
                    {p.id !== DEFAULT_PROJECT_ID && (
                      <span
                        className="psel-item-action psel-item-action--delete"
                        onClick={(e) => handleDelete(e, p.id)}
                        title={t.projects.delete}
                      >
                        <Trash2 size={11} />
                      </span>
                    )}
                  </span>
                </>
              )}
            </div>
          ))}

          <button className="psel-item psel-item-new" onClick={handleCreate}>
            <Plus size={12} />
            <span>{t.projects.newProject}</span>
          </button>

          {/* Export / Import */}
          <div className="psel-separator" />
          <button className="psel-item psel-item-io" onClick={handleExport}>
            <Download size={12} />
            <span>{t.projects.export}</span>
          </button>
          <button className="psel-item psel-item-io" onClick={() => importRef.current?.click()}>
            <Upload size={12} />
            <span>{t.projects.import}</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default ProjectSelector
