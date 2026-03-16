import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);
  const title = locale === "fr" ? "Derniers articles" : "Latest articles";
  const url = `https://flompt.dev/blog/${locale}`;

  return {
    title,
    description: t.home.subtitle,
    alternates: {
      canonical: url,
      languages: {
        fr: "https://flompt.dev/blog/fr",
        en: "https://flompt.dev/blog/en",
        "x-default": "https://flompt.dev/blog/fr",
      },
    },
    openGraph: {
      type: "website",
      url,
      title: `${title} | flompt blog`,
      description: t.home.subtitle,
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
      title: `${title} | flompt blog`,
      description: t.home.subtitle,
      images: ["https://flompt.dev/og-image.png"],
    },
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const t = getTranslations(locale as Locale);
  const posts = getAllPosts(locale as Locale);

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name:
      locale === "fr"
        ? "flompt blog — Derniers articles"
        : "flompt blog — Latest articles",
    description: t.home.subtitle,
    url: `https://flompt.dev/blog/${locale}`,
    inLanguage: locale,
    publisher: {
      "@type": "Person",
      name: "Nyrok",
      url: "https://github.com/Nyrok",
    },
    hasPart: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      url: `https://flompt.dev/blog/${locale}/posts/${post.slug}`,
      keywords: post.tags?.join(", "),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <section>
          <h2
            className="text-sm font-semibold uppercase tracking-wider mb-6"
            style={{ color: "var(--text-dim)" }}
          >
            {t.home.latestArticles}
          </h2>
          <div className="flex flex-col gap-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.slug} post={post} locale={locale as Locale} />
              ))
            ) : (
              <p className="py-8" style={{ color: "var(--text-muted)" }}>
                {t.home.noArticles}
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
