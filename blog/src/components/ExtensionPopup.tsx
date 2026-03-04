"use client";

import { useState, useEffect, useRef } from "react";
import posthog from "posthog-js";
import type { Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";

const ChromeSvg = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-5.344 9.257c.206.01.413.016.621.016 6.627 0 12-5.373 12-12 0-1.54-.29-3.011-.818-4.364zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728Z"/>
  </svg>
);

const FirefoxSvg = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.805 8.345a9.946 9.946 0 0 0-.468-1.562c-.24-.6-.527-1.177-.856-1.726a10.07 10.07 0 0 0-1.207-1.611 9.95 9.95 0 0 0-1.576-1.305 9.77 9.77 0 0 0-1.866-.925A9.716 9.716 0 0 0 12 .75a9.717 9.717 0 0 0-3.832.466 9.77 9.77 0 0 0-1.866.925 9.95 9.95 0 0 0-1.576 1.305A10.07 10.07 0 0 0 3.52 5.057a9.97 9.97 0 0 0-.856 1.726 9.946 9.946 0 0 0-.469 1.562A10.01 10.01 0 0 0 2 9.99c0 2.76 1.116 5.26 2.929 7.073A9.952 9.952 0 0 0 12 20.25a9.952 9.952 0 0 0 7.071-3.187A9.964 9.964 0 0 0 22 9.99a10.01 10.01 0 0 0-.195-1.645zM12 18.75a8.25 8.25 0 1 1 0-16.5 8.25 8.25 0 0 1 0 16.5z"/>
  </svg>
);

const POPUP_KEY = "flompt-ext-popup-v1";
const POPUP_DELAY = 15_000; // 15s
const EXT_URL =
  "https://chrome.google.com/webstore/detail/mbobfapnkflkbcflmedlejpladileboc";
const FIREFOX_URL = "https://addons.mozilla.org/addon/flompt-visual-prompt-builder/";

export default function ExtensionPopup({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  const [visible, setVisible] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return;
    try {
      if (localStorage.getItem(POPUP_KEY)) return;
    } catch { return; }

    const timer = setTimeout(() => {
      try {
        if (!localStorage.getItem(POPUP_KEY)) setVisible(true);
      } catch { /* noop */ }
    }, POPUP_DELAY);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (visible) closeRef.current?.focus();
  }, [visible]);

  const dismiss = () => {
    try { localStorage.setItem(POPUP_KEY, "1"); } catch { /* noop */ }
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible]);

  if (!visible) return null;

  const backdropStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 9998,
    background: "rgba(0,0,0,0.6)",
  };

  const popupStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "var(--bg-card, #1c1c1c)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "18px",
    padding: "36px 24px 24px",
    maxWidth: "380px",
    width: "calc(100vw - 48px)",
    boxShadow: "0 32px 80px rgba(0,0,0,0.85)",
    textAlign: "center",
  };

  return (
    <>
      {/* Backdrop */}
      <div style={backdropStyle} aria-hidden="true" onClick={dismiss} />

      {/* Dialog */}
      <div
        style={popupStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ext-popup-title"
      >
        {/* Close */}
        <button
          ref={closeRef}
          onClick={dismiss}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            fontSize: "1.3rem",
            lineHeight: 1,
            width: "30px",
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
          }}
        >
          ×
        </button>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "14px", color: "rgba(255,255,255,0.6)" }}>
          <ChromeSvg size={40} />
          <span style={{ color: "rgba(255,102,17,0.8)" }}><FirefoxSvg size={40} /></span>
        </div>

        <h2
          id="ext-popup-title"
          style={{
            fontSize: "1.2rem",
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: "10px",
          }}
        >
          {t.extension.popupTitle}
        </h2>

        <p
          style={{
            fontSize: "0.87rem",
            color: "var(--text-muted)",
            lineHeight: 1.65,
            marginBottom: "22px",
          }}
        >
          {t.extension.popupDesc}
        </p>

        <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
          <a
            href={EXT_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              posthog.capture("popupCta", { browser: "chrome" });
              dismiss();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "var(--accent)",
              color: "#fff",
              fontSize: "0.88rem",
              fontWeight: 600,
              padding: "12px 16px",
              borderRadius: "10px",
              textDecoration: "none",
              flex: 1,
            }}
          >
            <ChromeSvg size={16} />
            {t.extension.popupCta}
          </a>
          <a
            href={FIREFOX_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              posthog.capture("popupCtaFirefox", { browser: "firefox" });
              dismiss();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "#ff6611",
              color: "#fff",
              fontSize: "0.88rem",
              fontWeight: 600,
              padding: "12px 16px",
              borderRadius: "10px",
              textDecoration: "none",
              flex: 1,
            }}
          >
            <FirefoxSvg size={16} />
            {t.extension.popupCtaFirefox}
          </a>
        </div>

        <button
          onClick={dismiss}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            fontSize: "0.82rem",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
        >
          {t.extension.popupSkip}
        </button>
      </div>
    </>
  );
}
