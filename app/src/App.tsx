import { useEffect, useRef, useState } from 'react'
import { PenLine, Network, Sparkles, Github, History, Brain, LayoutList, Play, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { initAnalytics, setSource, analytics } from '@/lib/analytics'
import FlowCanvas from '@/components/FlowCanvas'
import BlockListView from '@/components/BlockListView'
import CanvasBlockBar from '@/components/CanvasBlockBar'
import Sidebar from '@/components/Sidebar'
import PromptInput from '@/components/PromptInput'
import PromptOutput from '@/components/PromptOutput'
import TemplateLibrary from '@/components/TemplateLibrary'
import KeyboardShortcuts from '@/components/KeyboardShortcuts'
import GuidedTour from '@/components/GuidedTour'
import ExtensionPopup from '@/components/ExtensionPopup'
import MakeIntegration from '@/components/MakeIntegration'
import ProjectSelector from '@/components/ProjectSelector'
import { useFlowStore } from '@/store/flowStore'
import { useProjectStore } from '@/store/projectStore'
import type { Tab } from '@/store/flowStore'
import { useLocale } from '@/i18n/LocaleContext'
import { LOCALES, LOCALE_LABELS } from '@/i18n/translations'
import type { Locale } from '@/i18n/translations'
import { isExtension } from '@/lib/platform'
import AuditPanel from '@/features/audit/AuditPanel'
import { useAuditStore } from '@/features/audit/useAuditStore'
import { assemblePrompt } from '@/lib/assemblePrompt'
import DebuggerPanel from '@/features/debugger/DebuggerPanel'
import CompressorModal from '@/features/compressor/CompressorModal'
import CriticPanel from '@/features/critic/CriticPanel'
import MemoryPanel from '@/features/context-memory/MemoryPanel'
import VersionHistory from '@/features/versioning/VersionHistory'
import { useVersionStore } from '@/features/versioning/useVersionStore'
import { useMemoryStore } from '@/features/context-memory/useMemoryStore'
import './styles.css'

const TAB_IDS: { id: Tab; Icon: LucideIcon }[] = [
  { id: 'input',  Icon: PenLine },
  { id: 'canvas', Icon: Network },
  { id: 'output', Icon: Sparkles },
]

const App = () => {
  const { undo, redo, activeTab, setActiveTab, isDecomposing, setRawPrompt, nodes, edges, setCompiledPrompt } = useFlowStore()
  const { result: auditResult, setOpen: openAudit } = useAuditStore()
  const [mobileAuditBadge, setMobileAuditBadge] = useState(false)
  const prevAuditRef = useRef(auditResult)
  const { t, locale, setLocale } = useLocale()
  const { currentProjectId } = useProjectStore()
  const { setOpen: openVersions, load: loadVersions } = useVersionStore()
  const { setOpen: openMemory } = useMemoryStore()
  const mainRef = useRef<HTMLElement>(null)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [canvasView, setCanvasView] = useState<'list' | 'canvas'>(() => {
    return (localStorage.getItem('flompt-canvas-view') as 'list' | 'canvas') ?? 'list'
  })

  const toggleView = (v: 'list' | 'canvas') => {
    setCanvasView(v)
    localStorage.setItem('flompt-canvas-view', v)
  }

  const handleOpenVersions = () => {
    openVersions(true)
    if (currentProjectId) loadVersions(currentProjectId)
  }

  const handleApplyDebugFix = (fixedPrompt: string) => {
    setRawPrompt(fixedPrompt)
  }

  const handleApplyCompression = (compressed: string) => {
    setRawPrompt(compressed)
  }

  // Mobile audit badge — show briefly after a new decompose result
  useEffect(() => {
    if (auditResult && auditResult !== prevAuditRef.current) {
      prevAuditRef.current = auditResult
      setMobileAuditBadge(true)
      const timer = setTimeout(() => setMobileAuditBadge(false), 6000)
      return () => clearTimeout(timer)
    }
  }, [auditResult])

  // Init PostHog after first render — non-blocking
  useEffect(() => {
    initAnalytics()
    setSource(isExtension ? 'extension' : 'web')
  }, [])

  // Auto-save current project when flowStore changes (debounced)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const unsub = useFlowStore.subscribe(() => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        useProjectStore.getState().saveCurrentProject()
      }, 1000)
    })
    return () => { unsub(); clearTimeout(timer) }
  }, [])

  // Sync html[lang] — layout always stays LTR, RTL only applies to text content
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      if (!mod) return
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const handleLocaleChange = (next: Locale) => {
    setLocale(next)
    analytics.localeChanged(next)
    // Sync URL so a reload restores the correct locale (URL path is priority #1)
    const newPath = next === 'en' ? '/app' : `/app/${next}`
    window.history.replaceState(null, '', newPath)
  }

  return (
    <div className="app">
      {/* Skip to main content — keyboard accessibility */}
      <a href="#main-content" className="skip-link">
        {t.accessibility.skipToMain}
      </a>

      {!isExtension && (
        <header className="header">
          <a href="/" className="header-brand" style={{ textDecoration: 'none' }}>
            <h1 className="logo">flompt</h1>
          </a>

          <ProjectSelector />

          <div className="header-actions">
            <button className="btn-icon" title="Version History" onClick={handleOpenVersions} aria-label="Version History">
              <History size={14} />
            </button>
            <button className="btn-icon" title="Context Memory" onClick={() => openMemory(true)} aria-label="Context Memory">
              <Brain size={14} />
            </button>
            <select
              className="btn-locale"
              value={locale}
              onChange={e => handleLocaleChange(e.target.value as Locale)}
              title={t.accessibility.switchLocale}
              aria-label={t.accessibility.switchLocale}
            >
              {LOCALES.map(l => (
                <option key={l} value={l}>{LOCALE_LABELS[l]}</option>
              ))}
            </select>
            <span className="hide-mobile">
              <KeyboardShortcuts />
            </span>
            <a
              className="btn-icon btn-github"
              href="https://github.com/Nyrok/flompt"
              target="_blank"
              rel="noopener noreferrer"
              title={t.header.github}
              aria-label={t.header.github}
              onClick={() => analytics.githubClicked('header')}
            >
              <Github size={14} aria-hidden="true" />
            </a>
          </div>
        </header>
      )}

      <main
        id="main-content"
        ref={mainRef}
        className={`main${isDecomposing ? ' is-decomposing' : ''}`}
      >
        <aside
          className={`left-panel${activeTab !== 'input' ? ' panel-hidden' : ''}`}
          aria-label={t.accessibility.inputPanel}
          aria-hidden={activeTab !== 'input'}
        >
          <PromptInput />
          <div className="panel-divider" role="separator" />
          <Sidebar onOpenLibrary={() => setLibraryOpen(true)} />
        </aside>

        <div
          className={`canvas-wrap${activeTab !== 'canvas' ? ' panel-hidden' : ''}`}
          aria-hidden={activeTab !== 'canvas'}
        >
          {/* Block bar: always on mobile (horizontal strip), desktop canvas-only */}
          <CanvasBlockBar mobileOnly={canvasView === 'list'} />

          {canvasView === 'canvas' && (
            <>
              <div className="canvas-view-toggle">
                <button
                  className="canvas-view-btn"
                  onClick={() => toggleView('list')}
                  title="List view"
                  aria-label="List view"
                >
                  <LayoutList size={13} />
                </button>
                <button
                  className="canvas-view-btn canvas-view-btn--active"
                  onClick={() => toggleView('canvas')}
                  title="Canvas view"
                  aria-label="Canvas view"
                >
                  <Network size={13} />
                </button>
              </div>
            </>
          )}

          {canvasView === 'list'
            ? <BlockListView canvasView={canvasView} onToggleView={toggleView} />
            : <FlowCanvas />
          }
        </div>

        <aside
          className={`right-panel${activeTab !== 'output' ? ' panel-hidden' : ''}`}
          aria-label={t.accessibility.outputPanel}
          aria-hidden={activeTab !== 'output'}
        >
          <PromptOutput />
        </aside>

      </main>

      {/* Template library overlay */}
      {libraryOpen && (
        <div className="library-overlay" role="dialog" aria-modal="true" aria-label="Template library">
          <div className="library-overlay-backdrop" onClick={() => setLibraryOpen(false)} />
          <div className="library-overlay-panel">
            <TemplateLibrary onClose={() => setLibraryOpen(false)} />
          </div>
        </div>
      )}

      {/* Guided tour — desktop only, first visit only */}
      <GuidedTour />

      {/* Extension popup — web only, once after 20s */}
      {!isExtension && <ExtensionPopup />}

      {/* Make.com integration panel — web only */}
      {!isExtension && <MakeIntegration />}

      {/* Post-decompose audit panel */}
      {!isExtension && <AuditPanel />}

      {/* Mobile FAB — assemble & go to output (canvas + input tabs) */}
      {!isExtension && nodes.length > 0 && activeTab !== 'output' && (
        <button
          className="mobile-fab"
          onClick={() => {
            const result = assemblePrompt(nodes, edges)
            setCompiledPrompt(result)
            setActiveTab('output')
          }}
          title={t.promptOutput.compile}
          aria-label={t.promptOutput.compile}
        >
          <Play size={24} aria-hidden="true" />
        </button>
      )}

      {/* Mobile audit badge — shown briefly after decompose */}
      {!isExtension && mobileAuditBadge && auditResult && (
        <button
          className="mobile-audit-badge"
          onClick={() => {
            setMobileAuditBadge(false)
            setActiveTab('input')
            openAudit(true)
          }}
        >
          <ShieldCheck size={13} aria-hidden="true" />
          <span>Score {auditResult.score}/100</span>
          <span className="mobile-audit-badge__cta">Audit →</span>
        </button>
      )}

      {/* IDE feature panels — web only */}
      {!isExtension && <DebuggerPanel onApplyFix={handleApplyDebugFix} />}
      {!isExtension && <CompressorModal onApply={handleApplyCompression} />}
      {!isExtension && <CriticPanel />}
      {!isExtension && <MemoryPanel />}
      {!isExtension && <VersionHistory projectId={currentProjectId ?? '__default__'} />}

      <nav className="tab-bar" aria-label={t.accessibility.mainTabs}>
        <div role="tablist" className="tab-list-inner">
          {TAB_IDS.map(({ id, Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={id === 'canvas' ? 'canvas-panel' : undefined}
              className={`tab-btn${activeTab === id ? ' tab-btn--active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={18} className="tab-icon" aria-hidden="true" />
              <span className="tab-label">{t.tabs[id]}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App
