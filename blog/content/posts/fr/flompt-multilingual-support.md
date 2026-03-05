---
title: "Flompt parle maintenant 10 langues"
date: "2026-03-05"
excerpt: "L'interface de Flompt est désormais disponible en 10 langues : anglais, français, espagnol, allemand, portugais, japonais, turc, chinois, arabe et russe. Chaque langue a aussi sa propre page indexée pour une meilleure visibilité dans les moteurs de recherche."
tags: ["multilingue", "i18n", "flompt", "mise à jour", "seo"]
---

## Pourquoi le multi-langue

Le prompt engineering n'est pas une discipline uniquement anglophone. Les développeurs et praticiens de l'IA écrivent leurs prompts dans leur langue natale, utilisent des interfaces LLM locales, et cherchent des outils dans leur propre langue.

Jusqu'ici, l'interface de Flompt n'était disponible qu'en anglais et en français. C'était un point de friction pour une part significative des utilisateurs. On corrige ça aujourd'hui.

## 10 langues, une seule interface

Le sélecteur de langue en haut à droite propose désormais 10 options :

| Code | Langue      |
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

Toutes les chaînes de l'interface sont traduites : labels des blocs, noms des onglets, messages d'erreur, tour d'onboarding, descriptions des raccourcis clavier, labels d'accessibilité.

## Comment ça fonctionne

Le système i18n est entièrement côté client. Chaque langue est un fichier JSON contenant toutes les chaînes de l'interface. La traduction est appliquée à l'exécution par un contexte React — sans aller-retour serveur, sans build par locale.

La langue est déterminée dans cet ordre :

1. **Chemin URL** — visiter `flompt.dev/app/es` charge l'espagnol immédiatement
2. **localStorage** — ton dernier choix explicite est mémorisé entre les sessions
3. **Par défaut** — anglais si rien d'autre ne s'applique

Ton choix est toujours persisté. Si tu passes en allemand, la prochaine fois que tu ouvres l'app, elle s'ouvre en allemand.

## Chaque langue a sa propre URL

C'est l'autre moitié de la release, et elle compte pour la découvrabilité.

Avant aujourd'hui, `flompt.dev/app` était la seule URL de l'app — et elle ne servait que du HTML en anglais. Les crawlers de Google, Bing et autres n'indexaient que la version anglaise.

Maintenant chaque langue a une page HTML statique dédiée :

- `flompt.dev/app` → English (défaut)
- `flompt.dev/app/fr` → Français
- `flompt.dev/app/es` → Español
- `flompt.dev/app/de` → Deutsch
- `flompt.dev/app/pt` → Português
- `flompt.dev/app/ja` → 日本語
- `flompt.dev/app/tr` → Türkçe
- `flompt.dev/app/zh` → 中文
- `flompt.dev/app/ar` → العربية
- `flompt.dev/app/ru` → Русский

Chaque page a l'attribut `lang` correct, un `<title>` et une `<meta description>` localisés, une URL canonique, et un ensemble complet de liens `hreflang` alternatifs pointant vers les 10 locales.

C'est la pratique standard de SEO multilingue — la même approche utilisée par les grandes plateformes pour afficher la bonne version aux utilisateurs selon leur région.

## Ce qui ne change pas

La logique de l'app est identique dans toutes les langues. Les blocs, le comportement du canvas, l'assemblage de prompts, les raccourcis clavier, la sauvegarde automatique — rien ne change. Seules les chaînes d'interface sont traduites.

Les prompts que tu écris et les blocs que tu crées sont toujours stockés tels quels. Changer la langue de l'interface n'altère pas ton contenu sauvegardé.

---

[**Essayer Flompt →**](https://flompt.dev/app)
