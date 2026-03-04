import { useState, useEffect, useRef } from 'react'
import { X, Star } from 'lucide-react'
import { useLocale } from '@/i18n/LocaleContext'
import { track } from '@/lib/analytics'

const POPUP_KEY  = 'flompt-star-popup-v1'
const GITHUB_URL = 'https://github.com/Nyrok/flompt'
const SHOW_DELAY = 1500 // 1.5s after the action — gives time to see the result

/** Name of the event dispatched after a successful decomposition or assembly */
export const STAR_EVENT = 'flompt:action-completed'

const StarPopup = () => {
  const { t } = useLocale()
  const [visible, setVisible] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Listen for the event — shown only once (localStorage)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    const handler = () => {
      try {
        if (localStorage.getItem(POPUP_KEY)) return
      } catch { return }

      // Delay to avoid interrupting the ongoing action
      timer = setTimeout(() => setVisible(true), SHOW_DELAY)
    }

    window.addEventListener(STAR_EVENT, handler)
    return () => {
      window.removeEventListener(STAR_EVENT, handler)
      if (timer) clearTimeout(timer)
    }
  }, [])

  // Focus the Close button on open
  useEffect(() => {
    if (visible) closeRef.current?.focus()
  }, [visible])

  const dismiss = () => {
    try { localStorage.setItem(POPUP_KEY, '1') } catch { /* noop */ }
    setVisible(false)
  }

  // Close on Escape
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
        className="ext-popup star-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="star-popup-title"
      >
        <button
          ref={closeRef}
          className="ext-popup__close"
          onClick={dismiss}
          aria-label="Close"
        >
          <X size={16} aria-hidden="true" />
        </button>

        <div className="star-popup__emoji" aria-hidden="true">⭐</div>

        <h2 id="star-popup-title" className="ext-popup__title">
          {t.starPopup.title}
        </h2>
        <p className="ext-popup__desc">{t.starPopup.desc}</p>

        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ext-popup__cta star-popup__cta"
          onClick={() => {
            track('github_star_clicked', { source: 'star_popup' })
            dismiss()
          }}
        >
          <Star size={16} aria-hidden="true" />
          {t.starPopup.cta}
        </a>

        <button className="ext-popup__skip" onClick={dismiss}>
          {t.starPopup.skip}
        </button>
      </div>
    </>
  )
}

export default StarPopup
