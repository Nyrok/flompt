import { useState, useEffect, useRef } from 'react'
import { Keyboard, X } from 'lucide-react'
import { useLocale } from '@/i18n/LocaleContext'

const TITLE_ID = 'shortcuts-dialog-title'

const KeyboardShortcuts = () => {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const modalRef   = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Move focus into modal when opened, restore when closed
  useEffect(() => {
    if (open) {
      // Focus the close button when modal opens
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()
    } else {
      triggerRef.current?.focus()
    }
  }, [open])

  // Focus trap inside modal
  const handleModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return
    const modal = modalRef.current
    if (!modal) return
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        className="btn-icon shortcuts-btn"
        onClick={() => setOpen((v) => !v)}
        title={`${t.shortcuts.title} (?)`}
        aria-label={`${t.shortcuts.title} (?)`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Keyboard size={14} aria-hidden="true" />
      </button>

      {open && (
        <>
          {/* Backdrop — click to close, hidden from AT */}
          <div
            className="shortcuts-overlay"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={TITLE_ID}
            className="shortcuts-modal shortcuts-modal--standalone"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleModalKeyDown}
          >
            <div className="shortcuts-header">
              <h2 id={TITLE_ID} className="shortcuts-title">{t.shortcuts.title}</h2>
              <button
                className="btn-icon"
                onClick={() => setOpen(false)}
                aria-label={t.shortcuts.close}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
            <div className="shortcuts-list">
              {t.shortcuts.list.map((s, i) => (
                <div key={i} className="shortcut-row">
                  <div className="shortcut-keys">
                    {s.keys.map((k, j) => (
                      <span key={j} className="shortcut-key">{k}</span>
                    ))}
                  </div>
                  <span className="shortcut-label">{s.label}</span>
                </div>
              ))}
            </div>
            <p className="shortcuts-hint">{t.shortcuts.close}</p>
          </div>
        </>
      )}
    </>
  )
}

export default KeyboardShortcuts
