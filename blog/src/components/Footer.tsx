import type { Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";

export default function Footer({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-auto"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      <div
        className="max-w-3xl mx-auto px-6 py-8 text-center text-sm"
        style={{ color: "var(--text-dim)" }}
      >
        <p>{t.footer.copyright.replace("{year}", String(year))}</p>
        <p className="mt-1">
          {t.footer.builtWith}{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-colors"
            style={{ color: "var(--text-muted)" }}
            aria-label="Next.js (opens in new tab)"
          >
            Next.js
          </a>{" "}
          &amp;{" "}
          <a
            href="https://tailwindcss.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-colors"
            style={{ color: "var(--text-muted)" }}
            aria-label="Tailwind CSS (opens in new tab)"
          >
            Tailwind CSS
          </a>
        </p>
      </div>
    </footer>
  );
}
