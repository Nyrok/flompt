import { useState, useEffect, useRef } from 'react'
import { X, Blocks } from 'lucide-react'
import { useLocale } from '@/i18n/LocaleContext'
import { track } from '@/lib/analytics'
import ChromeIcon from '@/components/ChromeIcon'
import FirefoxIcon from '@/components/FirefoxIcon'

const POPUP_KEY        = 'flompt-ext-popup-v1'
const COMPILE_KEY      = 'flompt-compile-count'
const COMPILE_THRESHOLD = 3
const EXT_URL     = 'https://chrome.google.com/webstore/detail/mbobfapnkflkbcflmedlejpladileboc'
const FIREFOX_URL = 'https://addons.mozilla.org/addon/flompt-visual-prompt-builder/'

/** Dispatched by StarPopup just before it becomes visible */
export const STAR_POPUP_SHOW_EVENT = 'flompt:star-popup-show'

const ExtensionPopup = () => {
  const { t } = useLocale()
  const [visible, setVisible] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  // ── Show after COMPILE_THRESHOLD compiles ─────────────────────────────────
  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return
    try { if (localStorage.getItem(POPUP_KEY)) return } catch { return }

    const onCompiled = (e: Event) => {
      const count = (e as CustomEvent<{ count: number }>).detail?.count ?? 0
      if (count >= COMPILE_THRESHOLD) {
        try { if (localStorage.getItem(POPUP_KEY)) return } catch { return }
        setVisible(true)
      }
    }

    // Also check on mount in case threshold was already reached in a previous session
    try {
      const existing = parseInt(localStorage.getItem(COMPILE_KEY) || '0')
      if (existing >= COMPILE_THRESHOLD) {
        // Show after a short delay so the UI is settled
        const t = setTimeout(() => setVisible(true), 800)
        return () => clearTimeout(t)
      }
    } catch { /* noop */ }

    window.addEventListener('flompt:compiled', onCompiled)
    return () => window.removeEventListener('flompt:compiled', onCompiled)
  }, [])

  useEffect(() => {
    if (visible) closeRef.current?.focus()
  }, [visible])

  const dismiss = () => {
    try { localStorage.setItem(POPUP_KEY, '1') } catch { /* noop */ }
    setVisible(false)
  }

  useEffect(() => {
    if (!visible) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [visible])

  if (!visible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="ext-popup-overlay"
        aria-hidden="true"
        onClick={dismiss}
      />

      {/* Dialog */}
      <div
        className="ext-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ext-popup-title"
      >
        <button
          ref={closeRef}
          className="ext-popup__close"
          onClick={dismiss}
          aria-label="Close"
        >
          <X size={16} aria-hidden="true" />
        </button>

        <Blocks size={40} className="ext-popup__icon" aria-hidden="true" />
        <h2 id="ext-popup-title" className="ext-popup__title">
          {t.extension.popupTitle}
        </h2>
        <p className="ext-popup__desc">{t.extension.popupDesc}</p>

        <div className="ext-popup__cta-group">
          <a
            href={EXT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ext-popup__cta"
            onClick={() => {
              track('extension_install_clicked', { source: 'app_popup', browser: 'chrome' })
              dismiss()
            }}
          >
            <ChromeIcon size={16} />
            {t.extension.popupCta}
          </a>
          <a
            href={FIREFOX_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ext-popup__cta ext-popup__cta--firefox"
            onClick={() => {
              track('extension_install_clicked', { source: 'app_popup', browser: 'firefox' })
              dismiss()
            }}
          >
            <FirefoxIcon size={16} style={{ color: '#fff' }} />
            {t.extension.popupCtaFirefox}
          </a>
        </div>

        <button className="ext-popup__skip" onClick={dismiss}>
          {t.extension.popupSkip}
        </button>
      </div>
    </>
  )
}

export default ExtensionPopup
