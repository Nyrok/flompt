#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  generate-locale-pages.js  —  Post-build SEO locale pages
//  Reads dist/index.html and generates dist/[locale]/index.html for each
//  non-EN locale with correct lang, title, description, canonical & hreflang.
// ─────────────────────────────────────────────────────────────────────────────

const fs   = require('fs')
const path = require('path')

const distDir  = path.join(__dirname, '../dist')
const BASE_URL = 'https://flompt.dev/app'

const LOCALES = ['en', 'fr', 'es', 'de', 'pt', 'ja', 'tr', 'zh', 'ar', 'ru']

// HTML-escape helper (for title / description content attributes)
function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Per-locale meta — title, description (for <head> tags), og locale, text dir
const META = {
  en: {
    title:       'flompt — Turn Any Prompt into a Visual Flow | AI Prompt Builder',
    description: 'flompt (flow + prompt) breaks down AI prompts into visual flowchart blocks, lets you edit each piece, then recompiles them into optimized machine-ready instructions. Free & open-source.',
    ogLocale:    'en_US',
    dir:         'ltr',
  },
  fr: {
    title:       'flompt — Transformez vos prompts en flux visuels | Constructeur de prompts IA',
    description: 'flompt décompose vos prompts en blocs visuels, vous permet de les éditer, puis les recompile en instructions optimisées pour les LLM. Gratuit et open-source.',
    ogLocale:    'fr_FR',
    dir:         'ltr',
  },
  es: {
    title:       'flompt — Convierte cualquier prompt en un flujo visual | Constructor de prompts IA',
    description: 'flompt descompone los prompts de IA en bloques visuales, te permite editar cada parte y los recompila en instrucciones optimizadas para LLM. Gratis y código abierto.',
    ogLocale:    'es_ES',
    dir:         'ltr',
  },
  de: {
    title:       'flompt — Prompts in visuelle Flüsse verwandeln | KI-Prompt-Builder',
    description: 'flompt zerlegt KI-Prompts in visuelle Blöcke, lässt dich jeden Teil bearbeiten und kompiliert sie zu optimierten LLM-fertigen Anweisungen. Kostenlos und Open-Source.',
    ogLocale:    'de_DE',
    dir:         'ltr',
  },
  pt: {
    title:       'flompt — Transforme prompts em fluxos visuais | Construtor de prompts IA',
    description: 'flompt decompõe prompts de IA em blocos visuais, permite editar cada parte e os recompila em instruções otimizadas para LLM. Gratuito e de código aberto.',
    ogLocale:    'pt_BR',
    dir:         'ltr',
  },
  ja: {
    title:       'flompt — プロンプトをビジュアルフローに変換 | AIプロンプトビルダー',
    description: 'flomptはAIプロンプトを視覚的なブロックに分解し、各パーツを編集してLLM対応の最適化された指示にリコンパイルします。無料・オープンソース。',
    ogLocale:    'ja_JP',
    dir:         'ltr',
  },
  tr: {
    title:       'flompt — Promptları Görsel Akışa Dönüştür | AI Prompt Oluşturucu',
    description: "flompt, yapay zeka promptlarını görsel bloklara böler, her parçayı düzenlemenizi sağlar ve optimize edilmiş LLM'e hazır talimatlara yeniden derler. Ücretsiz ve açık kaynak.",
    ogLocale:    'tr_TR',
    dir:         'ltr',
  },
  zh: {
    title:       'flompt — 将提示词转化为可视化流程 | AI 提示词构建器',
    description: 'flompt 将 AI 提示词分解为可视化块，让您编辑每个部分，然后重新编译为优化的 LLM 就绪指令。免费且开源。',
    ogLocale:    'zh_CN',
    dir:         'ltr',
  },
  ar: {
    title:       'flompt — حوّل أي طلب إلى تدفق مرئي | منشئ طلبات الذكاء الاصطناعي',
    description: 'flompt يفكك طلبات الذكاء الاصطناعي إلى كتل مرئية، يتيح تحرير كل جزء، ثم يعيد تجميعها في تعليمات محسّنة جاهزة للنماذج اللغوية. مجاني ومفتوح المصدر.',
    ogLocale:    'ar_SA',
    dir:         'rtl',
  },
  ru: {
    title:       'flompt — Превратите промпты в визуальный поток | Конструктор промптов ИИ',
    description: 'flompt разбивает AI-промпты на визуальные блоки, позволяет редактировать каждую часть, затем компилирует в оптимизированные инструкции для LLM. Бесплатно и с открытым кодом.',
    ogLocale:    'ru_RU',
    dir:         'ltr',
  },
}

// Build the 11 hreflang <link> tags (10 locales + x-default → /app)
function buildHreflangLinks(indent = '    ') {
  const lines = LOCALES.map(l => {
    const url = l === 'en' ? BASE_URL : `${BASE_URL}/${l}`
    return `${indent}<link rel="alternate" hreflang="${l}" href="${url}" />`
  })
  lines.push(`${indent}<link rel="alternate" hreflang="x-default" href="${BASE_URL}" />`)
  return lines.join('\n')
}

// ── 1. Read base dist/index.html ─────────────────────────────────────────────
const rawHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8')

// ── 2. Patch EN dist/index.html: replace the 2–3 old hreflang links with ×10 ─
const enHtml = rawHtml.replace(
  /(\s*<link rel="alternate" hreflang="[^"]*"[^>]*\/?>\n?)+/,
  '\n' + buildHreflangLinks() + '\n    '
)
fs.writeFileSync(path.join(distDir, 'index.html'), enHtml, 'utf-8')
console.log('✅ Updated  dist/index.html         (hreflang ×10 + x-default)')

// ── 3. Generate dist/[locale]/index.html for each non-EN locale ──────────────
for (const locale of LOCALES) {
  if (locale === 'en') continue

  const meta = META[locale]
  const url  = `${BASE_URL}/${locale}`

  // Start from enHtml (already has full hreflang — same on all pages per spec)
  let html = enHtml

  // <html lang="…" dir="…">
  html = html.replace(/(<html[^>]* lang=")[^"]*"/, `$1${locale}"`)
  html = html.replace(/(<html[^>]* dir=")[^"]*"/, `$1${meta.dir}"`)

  // <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`)

  // <meta name="title">
  html = html.replace(
    /(<meta name="title" content=")[^"]*"/,
    `$1${esc(meta.title)}"`
  )

  // <meta name="description"> (first occurrence — before og:description)
  html = html.replace(
    /(<meta name="description" content=")[^"]*"/,
    `$1${esc(meta.description)}"`
  )

  // <link rel="canonical">
  html = html.replace(
    /(<link rel="canonical" href=")[^"]*"/,
    `$1${url}"`
  )

  // og:url
  html = html.replace(
    /(<meta property="og:url" content=")[^"]*"/,
    `$1${url}"`
  )

  // og:title
  html = html.replace(
    /(<meta property="og:title" content=")[^"]*"/,
    `$1${esc(meta.title)}"`
  )

  // og:description
  html = html.replace(
    /(<meta property="og:description" content=")[^"]*"/,
    `$1${esc(meta.description)}"`
  )

  // og:locale (primary)
  html = html.replace(
    /(<meta property="og:locale" content=")[^"]*"/,
    `$1${meta.ogLocale}"`
  )

  // twitter:url
  html = html.replace(
    /(<meta name="twitter:url" content=")[^"]*"/,
    `$1${url}"`
  )

  // twitter:title
  html = html.replace(
    /(<meta name="twitter:title" content=")[^"]*"/,
    `$1${esc(meta.title)}"`
  )

  // twitter:description
  html = html.replace(
    /(<meta name="twitter:description" content=")[^"]*"/,
    `$1${esc(meta.description)}"`
  )

  // Remove og:locale:alternate (hreflang covers multilingual completely)
  html = html.replace(/\n\s*<meta property="og:locale:alternate"[^>]*\/?>/, '')

  // Write dist/[locale]/index.html
  const localeDir = path.join(distDir, locale)
  fs.mkdirSync(localeDir, { recursive: true })
  fs.writeFileSync(path.join(localeDir, 'index.html'), html, 'utf-8')
  console.log(`✅ Generated dist/${locale}/index.html`)
}

console.log('\n🌍 All locale pages generated successfully!\n')
