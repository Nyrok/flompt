import { useState, useEffect, useRef } from 'react'
import { X, Blocks } from 'lucide-react'
import { useLocale } from '@/i18n/LocaleContext'
import { track } from '@/lib/analytics'
import ChromeIcon from '@/components/ChromeIcon'
import FirefoxIcon from '@/components/FirefoxIcon'
import { STAR_EVENT } from '@/components/StarPopup'

const POPUP_KEY = 'flompt-ext-popup-v1'
const POPUP_DELAY = 20_000 // 20s — after guided tour
const EXT_URL = 'https://chrome.google.com/webstore/detail/mbobfapnkflkbcflmedlejpladileboc'
const FIREFOX_URL = 'https://addons.mozilla.org/addon/flompt-visual-prompt-builder/'

/** Dispatched by StarPopup just before it becomes visible */
export const STAR_POPUP_SHOW_EVENT = 'flompt:star-popup-show'

const ExtensionPopup = () => {
  const { t } = useLocale()
  const [visible, setVisible] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return
    try {
      if (localStorage.getItem(POPUP_KEY)) return
    } catch { return }

    const timer = setTimeout(() => {
      try {
        if (!localStorage.getItem(POPUP_KEY)) setVisible(true)
      } catch { /* noop */ }
    }, POPUP_DELAY)

    // If the user completes an action (decompose/compile), star popup takes priority
    const onStarEvent = () => {
      clearTimeout(timer)
      try { localStorage.setItem(POPUP_KEY, '1') } catch { /* noop */ }
    }
    window.addEventListener(STAR_EVENT, onStarEvent, { once: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener(STAR_EVENT, onStarEvent)
    }
  }, [])

  // If StarPopup becomes visible while we're visible, yield to it
  useEffect(() => {
    const onStarShow = () => {
      if (visible) {
        try { localStorage.setItem(POPUP_KEY, '1') } catch { /* noop */ }
        setVisible(false)
      }
    }
    window.addEventListener(STAR_POPUP_SHOW_EVENT, onStarShow)
    return () => window.removeEventListener(STAR_POPUP_SHOW_EVENT, onStarShow)
  }, [visible])

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
