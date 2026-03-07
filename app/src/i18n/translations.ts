import type { BlockType } from '@/types/blocks'
import enRaw from './en.json'
import frRaw from './fr.json'
import esRaw from './es.json'
import deRaw from './de.json'
import ptRaw from './pt.json'
import jaRaw from './ja.json'
import trRaw from './tr.json'
import zhRaw from './zh.json'
import arRaw from './ar.json'
import ruRaw from './ru.json'

// ── Types ──────────────────────────────────────────────────────────────────

export type Locale = 'en' | 'fr' | 'es' | 'de' | 'pt' | 'ja' | 'tr' | 'zh' | 'ar' | 'ru'

export const LOCALES: Locale[] = ['en', 'fr', 'es', 'de', 'pt', 'ja', 'tr', 'zh', 'ar', 'ru']

export const RTL_LOCALES: Locale[] = ['ar']

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
  es: 'ES',
  de: 'DE',
  pt: 'PT',
  ja: 'JA',
  tr: 'TR',
  zh: 'ZH',
  ar: 'AR',
  ru: 'RU',
}

export interface BlockTranslation {
  label: string
  description: string
}

export interface Translations {
  nodeCount: (n: number) => string
  tabs: { input: string; canvas: string; output: string }
  header: {
    undo: string
    redo: string
    reset: string
    resetConfirm: string
    autosaved: string
    github: string
  }
  accessibility: {
    skipToMain: string
    switchLocale: string
    inputPanel: string
    outputPanel: string
    mainTabs: string
  }
  promptInput: {
    title: string
    placeholder: string
    decompose: string
    decomposing: string
    errorDecompose: string
    paste: string
    importFromPlatform: string
    queuePosition: (n: number) => string
    queueProcessing: string
    queueAnalyzing: string
  }
  promptOutput: {
    title: string
    compile: string
    compiling: string
    copy: string
    copied: string
    placeholder: string
    errorCompile: string
    exportTxt: string
    exportJson: string
    exportTxtLabel: string
    exportJsonLabel: string
    share: string
    shareTitle: string
    shareText: string
    sendToAI: string
    injected: string
    injectLabel: string
    injectedLabel: string
  }
  errors: {
    overloaded: string
    timeout: string
    network: string
    server: string
    unknown: string
  }
  sidebar: {
    title: string
    hint: string
  }
  block: {
    duplicate: string
    expand: string
    collapse: string
    delete: string
    chars: string
    deleteConnection: string
  }
  canvas: {
    empty: string
    emptyHint: string
    emptyDecompose: string
  }
  shortcuts: {
    title: string
    close: string
    list: { keys: string[]; label: string }[]
  }
  tour: {
    step1title: string
    step1desc: string
    stepBlocksTitle: string
    stepBlocksDesc: string
    step2title: string
    step2desc: string
    step2action: string
    step3title: string
    step3desc: string
    step4title: string
    step4desc: string
    stepOf: string
    next: string
    finish: string
    skip: string
    acting: string
    samplePrompt: string
  }
  extension: {
    bannerText: string
    bannerCta: string
    bannerClose: string
    popupTitle: string
    popupDesc: string
    popupCta: string
    popupCtaFirefox: string
    popupSkip: string
  }
  starPopup: {
    title: string
    desc: string
    cta: string
    skip: string
  }
  blocks: Record<BlockType, BlockTranslation>
}

// ── Builder — wraps JSON into the typed Translations shape ─────────────────

type RawLocale = typeof enRaw

function build(raw: RawLocale): Translations {
  return {
    // Functions built from template strings
    nodeCount: (n) =>
      (n === 1 ? raw.nodeCount : raw.nodeCountPlural).replace('{n}', String(n)),

    tabs: raw.tabs,
    header: raw.header,
    accessibility: raw.accessibility,

    promptInput: {
      ...raw.promptInput,
      queuePosition: (n) => raw.promptInput.queuePosition.replace('{n}', String(n)),
    },

    promptOutput: raw.promptOutput,
    errors: raw.errors,
    sidebar: raw.sidebar,
    block: raw.block,
    canvas: raw.canvas,
    shortcuts: raw.shortcuts,
    tour: raw.tour,
    extension: raw.extension,
    starPopup: raw.starPopup,
    blocks: raw.blocks as Record<BlockType, BlockTranslation>,
  }
}

// ── Exports ────────────────────────────────────────────────────────────────

export const translations: Record<Locale, Translations> = {
  en: build(enRaw),
  fr: build(frRaw),
  es: build(esRaw as typeof enRaw),
  de: build(deRaw as typeof enRaw),
  pt: build(ptRaw as typeof enRaw),
  ja: build(jaRaw as typeof enRaw),
  tr: build(trRaw as typeof enRaw),
  zh: build(zhRaw as typeof enRaw),
  ar: build(arRaw as typeof enRaw),
  ru: build(ruRaw as typeof enRaw),
}
