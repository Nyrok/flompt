import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useLocale } from '@/i18n/LocaleContext'
import { track } from '@/lib/analytics'

const BANNER_KEY = 'flompt-ext-banner-v1'
const EXT_URL = 'https://chrome.google.com/webstore/detail/mbobfapnkflkbcflmedlejpladileboc'
const FIREFOX_URL = 'https://addons.mozilla.org/addon/flompt-visual-prompt-builder/'

const ExtensionBanner = () => {
  const { t } = useLocale()
  const [visible, setVisible] = useState(false)
  const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox')
  const installUrl = isFirefox ? FIREFOX_URL : EXT_URL

  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return
    try {
      if (!localStorage.getItem(BANNER_KEY)) setVisible(true)
    } catch { /* localStorage unavailable */ }
  }, [])

  const dismiss = () => {
    try { localStorage.setItem(BANNER_KEY, '1') } catch { /* noop */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="ext-banner"
      role="region"
      aria-label={t.extension.bannerClose}
    >
      <div className="ext-banner__inner">
        <span className="ext-banner__badge" aria-hidden="true">NEW</span>
        <span className="ext-banner__text">{t.extension.bannerText}</span>
        <a
          href={installUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ext-banner__cta"
          onClick={() => track('extension_install_clicked', { source: 'app_banner' })}
        >
          {t.extension.bannerCta}
        </a>
        <button
          className="ext-banner__close"
          onClick={dismiss}
          aria-label={t.extension.bannerClose}
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default ExtensionBanner
