---
title: "Flompt Now Speaks 10 Languages"
date: "2026-03-05"
excerpt: "Flompt's interface is now available in 10 languages: English, French, Spanish, German, Portuguese, Japanese, Turkish, Chinese, Arabic, and Russian. Each language also gets its own indexed page for better search visibility."
tags: ["multilingual", "i18n", "flompt", "update", "seo"]
color: "primary"
---

## Why Multi-language

Prompt engineering isn't an English-only discipline. Developers and AI practitioners write prompts in their native language, use local LLM interfaces, and search for tools in their own tongue.

Flompt only had English and French. That was friction for users. Today: 10 languages.

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

All client-side. Each language is a JSON file. Applied at runtime, no server calls.

Language priority:
1. URL path (`/app/es` = Spanish)
2. localStorage (your last choice)
3. Default (English)

Your choice persists.

## Each Language Gets Its Own URL

This is the other half of the release, and it matters for discoverability.

Before: only `/app` served English HTML. Search crawlers only indexed English.

Now: each language gets a dedicated page:

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

Each page has: correct lang, localized title/description, canonical URL, hreflang links.

Standard multilingual SEO.

## What Stays the Same

App logic is identical. Only interface strings translate.

Prompts and blocks stay as-is. Language switch doesn't change your work.

---

[**Try Flompt →**](https://flompt.dev/app)
