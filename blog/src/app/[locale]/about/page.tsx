import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/translations";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);
  const aboutUrl = `https://flompt.dev/blog/${locale}/about`;

  return {
    title: locale === "fr" ? "À propos" : "About",
    description: t.about.paragraph1,
    alternates: {
      canonical: aboutUrl,
      languages: {
        fr: "https://flompt.dev/blog/fr/about",
        en: "https://flompt.dev/blog/en/about",
        "x-default": "https://flompt.dev/blog/fr/about",
      },
    },
    openGraph: {
      type: "website",
      url: aboutUrl,
      title: t.about.pageTitle,
      description: t.about.paragraph1,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locale === "fr" ? ["en_US"] : ["fr_FR"],
      images: [
        {
          url: "https://flompt.dev/og-image.png",
          width: 1200,
          height: 630,
          alt: "flompt — Visual AI Prompt Builder",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.about.pageTitle,
      description: t.about.paragraph1,
      images: ["https://flompt.dev/og-image.png"],
    },
  };
}

const technologies = [
  "TypeScript",
  "React",
  "Next.js",
  "Python",
  "FastAPI",
  "Tailwind CSS",
  "AI / LLM",
  "Prompt Engineering",
];

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);

  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: t.about.pageTitle,
    description: t.about.paragraph1,
    url: `https://flompt.dev/blog/${locale}/about`,
    inLanguage: locale,
    about: {
      "@type": "SoftwareApplication",
      name: "flompt",
      description: "Visual AI Prompt Builder — decompose, edit visually, recompile.",
      url: "https://flompt.dev/app",
    },
    author: {
      "@type": "Person",
      name: "Nyrok",
      url: "https://github.com/Nyrok",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-6 sm:mb-8">{t.about.title}</h1>
        <div className="max-w-none space-y-6">
          <p className="text-base sm:text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {t.about.paragraph1}
          </p>
          <p className="leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {t.about.paragraph2}
          </p>
          <p className="leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {t.about.paragraph3}
          </p>

          <div
            className="mt-8 sm:mt-12 p-4 sm:p-6 rounded-lg"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <h2 className="text-lg font-semibold mb-4">{t.about.techTitle}</h2>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-sm rounded-full"
                  style={{
                    border: "1px solid var(--border-medium)",
                    color: "var(--text-muted)",
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
