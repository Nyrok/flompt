---
title: "Flompt Now Speaks 10 Languages"
date: "2026-03-05"
excerpt: "Flompt's interface is now available in 10 languages: English, French, Spanish, German, Portuguese, Japanese, Turkish, Chinese, Arabic, and Russian. Each language also gets its own indexed page for better search visibility."
tags: ["multilingual", "i18n", "flompt", "update", "seo"]
---

## Why Multi-language

Prompt engineering isn't an English-only discipline. Developers and AI practitioners write prompts in their native language, use local LLM interfaces, and search for tools in their own tongue.

Until now, Flompt's interface was only available in English and French. That was a friction point for a significant share of users. Today we're fixing that.

## 10 Languages, One Interface

The language selector in the top-right corner now offers 10 options:

| Code | Language    |
|------|-------------|
| EN   | English     |
| FR   | Français    |
| ES   | Español     |
| DE   | Deutsch     |
| PT   | Português   |
| JA   | 日本語      |
| TR   | Türkçe      |
| ZH   | 中文        |
| AR   | العربية     |
| RU   | Русский     |

Every string in the interface is translated: block labels, tab names, error messages, onboarding tour, keyboard shortcut descriptions, accessibility labels.

## How It Works

The i18n system is entirely client-side. Each language is a JSON file containing all interface strings. The translation is applied at runtime by a React context — no server round-trip, no build-per-locale.

Language is determined in this order:

1. **URL path** — visiting `flompt.dev/app/es` loads Spanish immediately
2. **localStorage** — your last explicit choice is remembered across sessions
3. **Default** — English if nothing else applies

Your choice is always persisted. If you switch to German, the next time you open the app it opens in German.

## Each Language Gets Its Own URL

This is the other half of the release, and it matters for discoverability.

Before today, `flompt.dev/app` was the only URL for the app — and it only served English HTML. Crawlers from Google, Bing, and others only indexed the English version.

Now every language has a dedicated static HTML page:

- `flompt.dev/app` → English (default)
- `flompt.dev/app/fr` → Français
- `flompt.dev/app/es` → Español
- `flompt.dev/app/de` → Deutsch
- `flompt.dev/app/pt` → Português
- `flompt.dev/app/ja` → 日本語
- `flompt.dev/app/tr` → Türkçe
- `flompt.dev/app/zh` → 中文
- `flompt.dev/app/ar` → العربية
- `flompt.dev/app/ru` → Русский

Each page has the correct `lang` attribute, a localized `<title>` and `<meta description>`, a canonical URL, and a full set of `hreflang` alternate links pointing across all 10 locales.

This is standard multilingual SEO practice — the same approach used by large platforms to surface the right version to users across different regions.

## What Stays the Same

The app logic is identical across all languages. Blocks, canvas behavior, prompt assembly, keyboard shortcuts, auto-save — nothing changes. Only the interface strings are translated.

Prompts you write and blocks you create are always stored as-is. Switching your interface language doesn't alter your saved content.

---

[**Try Flompt →**](https://flompt.dev/app)
