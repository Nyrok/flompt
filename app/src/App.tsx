import { useEffect, useRef, useState } from 'react'
import { PenLine, Network, Sparkles, Github, History, Brain } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { initAnalytics, setSource, analytics } from '@/lib/analytics'
import FlowCanvas from '@/components/FlowCanvas'
import Sidebar from '@/components/Sidebar'
import PromptInput from '@/components/PromptInput'
import PromptOutput from '@/components/PromptOutput'
import TemplateLibrary from '@/components/TemplateLibrary'
import KeyboardShortcuts from '@/components/KeyboardShortcuts'
import GuidedTour from '@/components/GuidedTour'
import ExtensionBanner from '@/components/ExtensionBanner'
import ExtensionPopup from '@/components/ExtensionPopup'
import StarPopup from '@/components/StarPopup'
import MakeIntegration from '@/components/MakeIntegration'
import ProjectSelector from '@/components/ProjectSelector'
import { useFlowStore } from '@/store/flowStore'
import { useProjectStore } from '@/store/projectStore'
import type { Tab } from '@/store/flowStore'
import { useLocale } from '@/i18n/LocaleContext'
import { LOCALES, LOCALE_LABELS } from '@/i18n/translations'
import type { Locale } from '@/i18n/translations'
import { isExtension } from '@/lib/platform'
import DebuggerPanel from '@/features/debugger/DebuggerPanel'
import CompressorModal from '@/features/compressor/CompressorModal'
import CriticPanel from '@/features/critic/CriticPanel'
import SystemPromptModal from '@/features/system-prompt/SystemPromptModal'
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
  const { undo, redo, activeTab, setActiveTab, isDecomposing, setRawPrompt } = useFlowStore()
  const { t, locale, setLocale } = useLocale()
  const { currentProjectId } = useProjectStore()
  const { setOpen: openVersions, load: loadVersions } = useVersionStore()
  const { setOpen: openMemory } = useMemoryStore()
  const mainRef = useRef<HTMLElement>(null)
  const [libraryOpen, setLibraryOpen] = useState(false)

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

  const handleApplySystemPromptToCanvas = (sections: Array<{ name: string; content: string }>) => {
    const full = sections.map(s => `## ${s.name}\n${s.content}`).join('\n\n')
    setRawPrompt(full)
  }

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

      {!isExtension && <ExtensionBanner />}

      {!isExtension && (
        <header className="header">
          <a href="/" className="header-brand" style={{ textDecoration: 'none' }}>
            <h1 className="logo">flompt</h1>
          </a>

          <div className="header-spacer" />

          <ProjectSelector />

          <div className="header-spacer" />

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
          <FlowCanvas />
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

      {/* Star popup — after first decompose, compile, or inject to AI */}
      <StarPopup />

      {/* Make.com integration panel — web only */}
      {!isExtension && <MakeIntegration />}

      {/* IDE feature panels — web only */}
      {!isExtension && <DebuggerPanel onApplyFix={handleApplyDebugFix} />}
      {!isExtension && <CompressorModal onApply={handleApplyCompression} />}
      {!isExtension && <CriticPanel />}
      {!isExtension && <SystemPromptModal onApplyToCanvas={handleApplySystemPromptToCanvas} />}
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
