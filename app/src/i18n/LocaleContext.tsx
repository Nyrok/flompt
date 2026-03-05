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
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && LOCALES.includes(stored as Locale)) return stored as Locale
  } catch {}
  // Auto-detect from browser language
  try {
    const lang = navigator.language.slice(0, 2).toLowerCase()
    if (LOCALES.includes(lang as Locale)) return lang as Locale
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
