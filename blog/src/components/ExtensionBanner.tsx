"use client";

import { useState, useEffect } from "react";
import type { Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";

const ChromeSvg = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-5.344 9.257c.206.01.413.016.621.016 6.627 0 12-5.373 12-12 0-1.54-.29-3.011-.818-4.364zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728Z"/>
  </svg>
);

const BANNER_KEY = "flompt-ext-banner-v1";
const EXT_URL =
  "https://chrome.google.com/webstore/detail/mbobfapnkflkbcflmedlejpladileboc";

export default function ExtensionBanner({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(BANNER_KEY)) setVisible(true);
    } catch { /* noop */ }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(BANNER_KEY, "1"); } catch { /* noop */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        width: "100%",
        height: "44px",
        flexShrink: 0,
        background:
          "linear-gradient(90deg, rgba(255,53,112,0.1), rgba(255,96,144,0.07), rgba(255,53,112,0.1))",
        borderBottom: "1px solid rgba(255,53,112,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      role="region"
      aria-label={t.extension.bannerClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "48rem",
          padding: "0 40px 0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          position: "relative",
        }}
      >
        {/* NEW badge */}
        <span
          aria-hidden="true"
          style={{
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            background: "var(--accent)",
            color: "#fff",
            padding: "2px 7px",
            borderRadius: "4px",
            flexShrink: 0,
          }}
        >
          NEW
        </span>

        <span
          style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}
          className="hidden sm:block"
        >
          {t.extension.bannerText}
        </span>

        <a
          href={EXT_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--accent)",
            border: "1px solid rgba(255,53,112,0.38)",
            borderRadius: "6px",
            padding: "3px 11px",
            whiteSpace: "nowrap",
            flexShrink: 0,
            textDecoration: "none",
            transition: "background 150ms",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <ChromeSvg />
          {t.extension.bannerCta}
        </a>

        <button
          onClick={dismiss}
          aria-label={t.extension.bannerClose}
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            fontSize: "1.2rem",
            lineHeight: 1,
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
