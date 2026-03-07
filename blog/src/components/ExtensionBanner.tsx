"use client";

import { useState, useEffect } from "react";
import type { Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";


const BANNER_KEY = "flompt-ext-banner-v1";
const EXT_URL =
  "https://chrome.google.com/webstore/detail/mbobfapnkflkbcflmedlejpladileboc";
const FIREFOX_URL = "https://addons.mozilla.org/addon/flompt-visual-prompt-builder/";

const isFirefox = typeof navigator !== "undefined" && navigator.userAgent.includes("Firefox");
const installUrl = isFirefox ? FIREFOX_URL : EXT_URL;

export default function ExtensionBanner({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
          href={installUrl}
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
