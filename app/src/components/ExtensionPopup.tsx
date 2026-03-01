import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useLocale } from '@/i18n/LocaleContext'
import { track } from '@/lib/analytics'

const POPUP_KEY = 'flompt-ext-popup-v1'
const POPUP_DELAY = 20_000 // 20s — after guided tour
const EXT_URL = 'https://chrome.google.com/webstore/detail/mbobfapnkflkbcflmedlejpladileboc'

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

    return () => clearTimeout(timer)
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

        <h2 id="ext-popup-title" className="ext-popup__title">
          {t.extension.popupTitle}
        </h2>
        <p className="ext-popup__desc">{t.extension.popupDesc}</p>

        <a
          href={EXT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ext-popup__cta"
          onClick={() => {
            track('extension_install_clicked', { source: 'app_popup' })
            dismiss()
          }}
        >
          {t.extension.popupCta}
        </a>

        <button className="ext-popup__skip" onClick={dismiss}>
          {t.extension.popupSkip}
        </button>
      </div>
    </>
  )
}

export default ExtensionPopup
