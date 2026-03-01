import { useEffect, useRef } from 'react'
import { Undo2, Redo2, PenLine, Network, Sparkles, Trash2, Github } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { initAnalytics, setSource, analytics } from '@/lib/analytics'
import FlowCanvas from '@/components/FlowCanvas'
import Sidebar from '@/components/Sidebar'
import PromptInput from '@/components/PromptInput'
import PromptOutput from '@/components/PromptOutput'
import KeyboardShortcuts from '@/components/KeyboardShortcuts'
import GuidedTour from '@/components/GuidedTour'
import ExtensionBanner from '@/components/ExtensionBanner'
import ExtensionPopup from '@/components/ExtensionPopup'
import StarPopup from '@/components/StarPopup'
import { useFlowStore } from '@/store/flowStore'
import type { Tab } from '@/store/flowStore'
import { useLocale } from '@/i18n/LocaleContext'
import type { Locale } from '@/i18n/translations'
import { isExtension } from '@/lib/platform'
import './styles.css'

const TAB_IDS: { id: Tab; Icon: LucideIcon }[] = [
  { id: 'input',  Icon: PenLine },
  { id: 'canvas', Icon: Network },
  { id: 'output', Icon: Sparkles },
]

const App = () => {
  const { undo, redo, reset, past, future, nodes, activeTab, setActiveTab, isDecomposing } = useFlowStore()
  const { t, locale, setLocale } = useLocale()
  const mainRef = useRef<HTMLElement>(null)

  // Init PostHog after first render — non-blocking
  useEffect(() => {
    initAnalytics()
    setSource(isExtension ? 'extension' : 'web')
  }, [])

  // Sync html[lang] with locale
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

  const toggleLocale = () => {
    const next = locale === 'en' ? 'fr' : 'en' as Locale
    setLocale(next)
    analytics.localeChanged(next)
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

          {/* Node count */}
          {nodes.length > 0 && (
            <span className="node-count hide-mobile" aria-live="polite" aria-atomic="true">
              {t.nodeCount(nodes.length)}
            </span>
          )}

          <div className="header-actions">
            <button
              className="btn-icon"
              onClick={undo}
              disabled={past.length === 0}
              title={t.header.undo}
              aria-label={t.header.undo}
            >
              <Undo2 size={14} aria-hidden="true" />
            </button>
            <button
              className="btn-icon"
              onClick={redo}
              disabled={future.length === 0}
              title={t.header.redo}
              aria-label={t.header.redo}
            >
              <Redo2 size={14} aria-hidden="true" />
            </button>
            <KeyboardShortcuts />
            <button
              className="btn-locale"
              onClick={toggleLocale}
              title={t.accessibility.switchLocale}
              aria-label={t.accessibility.switchLocale}
            >
              {locale.toUpperCase()}
            </button>
            <a
              className="btn-icon btn-github"
              href="https://github.com/Nyrok/flompt"
              target="_blank"
              rel="noopener noreferrer"
              title={t.header.github}
              aria-label={t.header.github}
            >
              <Github size={14} aria-hidden="true" />
            </a>
            <button
              className="btn-icon btn-clear-desktop"
              onClick={() => { if (confirm(t.header.resetConfirm)) reset() }}
              title={t.header.reset}
              aria-label={t.header.reset}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
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
          <Sidebar />
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

      {/* Guided tour — desktop only, first visit only */}
      <GuidedTour />

      {/* Extension popup — web only, once after 20s */}
      {!isExtension && <ExtensionPopup />}

      {/* Star popup — web only, after first decompose or compile */}
      {!isExtension && <StarPopup />}

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
