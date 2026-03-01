import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExtensionBanner from "@/components/ExtensionBanner";
import ExtensionPopup from "@/components/ExtensionPopup";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to main content — keyboard accessibility */}
      <a href="#main-content" className="skip-link">
        {locale === "fr" ? "Aller au contenu principal" : "Skip to main content"}
      </a>
      <ExtensionBanner locale={locale as Locale} />
      <Header locale={locale as Locale} />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer locale={locale as Locale} />
      <ExtensionPopup locale={locale as Locale} />
    </div>
  );
}
