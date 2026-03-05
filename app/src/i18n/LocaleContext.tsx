import { createContext, useContext, useState, type ReactNode } from 'react'
import { translations, LOCALES } from './translations'
import type { Locale, Translations } from './translations'

// ── Types ───────────────────────────────────────────────────────────────────

interface LocaleContextValue {
  t: Translations
  locale: Locale
  setLocale: (l: Locale) => void
}

// ── Context ─────────────────────────────────────────────────────────────────

const LocaleContext = createContext<LocaleContextValue | null>(null)

// ── Provider ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'flompt-locale'

function getInitialLocale(): Locale {
  // 1. URL path: /app/fr → 'fr', /app → 'en'
  try {
    const pathLocale = window.location.pathname.split('/')[2]
    if (pathLocale && LOCALES.includes(pathLocale as Locale)) return pathLocale as Locale
  } catch {}
  // 2. localStorage (user's explicit choice)
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && LOCALES.includes(stored as Locale)) return stored as Locale
  } catch {}
  // 3. Browser preferred languages (ordered list)
  try {
    const preferred = navigator.languages?.length
      ? navigator.languages
      : [navigator.language]
    for (const lang of preferred) {
      const code = lang.slice(0, 2).toLowerCase()
      if (LOCALES.includes(code as Locale)) return code as Locale
    }
  } catch {}
  return 'en'
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch {}
  }

  return (
    <LocaleContext.Provider value={{ t: translations[locale], locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>')
  return ctx
}
