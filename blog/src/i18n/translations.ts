import type { Locale } from "./config";
import enRaw from "./en.json";
import frRaw from "./fr.json";

// ── Types ──────────────────────────────────────────────────────────────────

type RawLocale = typeof enRaw;

export interface Translations {
  header: {
    brand: string;
    articles: string;
    about: string;
    accessApp: string;
    home: string;
  };
  accessibility: {
    brandAriaLabel: string;
    switchLocale: string;
  };
  home: {
    subtitle: string;
    latestArticles: string;
    noArticles: string;
  };
  post: {
    backToArticles: string;
    readMore: string;
  };
  about: {
    pageTitle: string;
    title: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    techTitle: string;
  };
  extension: {
    bannerText: string;
    bannerCta: string;
    bannerClose: string;
    popupTitle: string;
    popupDesc: string;
    popupCta: string;
    popupCtaFirefox: string;
    popupSkip: string;
  };
  footer: {
    copyright: string;
    builtWith: string;
  };
}

// ── Builder — wraps JSON into the typed Translations shape ─────────────────

function build(raw: RawLocale): Translations {
  return {
    header: raw.header,
    accessibility: raw.accessibility,
    home: raw.home,
    post: raw.post,
    about: raw.about,
    extension: raw.extension,
    footer: raw.footer,
  };
}

// ── Exports ────────────────────────────────────────────────────────────────

const translations: Record<Locale, Translations> = {
  en: build(enRaw),
  fr: build(frRaw),
};

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}
