import { getPostBySlug, getAllLocaleSlugs } from "@/lib/posts";
import { formatDate } from "@/lib/formatDate";
import { getTranslations } from "@/i18n/translations";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return getAllLocaleSlugs().map(({ locale, slug }) => ({ locale, slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug, locale as Locale);
  if (!post) return { title: "Not found" };

  const postUrl = `https://flompt.dev/blog/${locale}/posts/${slug}`;
  const altLocale = locale === "fr" ? "en" : "fr";
  const ogImage = "https://flompt.dev/og-image.png";

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: "Nyrok", url: "https://github.com/Nyrok" }],
    keywords: post.tags,
    alternates: {
      canonical: postUrl,
      languages: {
        [locale]: postUrl,
        [altLocale]: `https://flompt.dev/blog/${altLocale}/posts/${slug}`,
        "x-default": `https://flompt.dev/blog/fr/posts/${slug}`,
      },
    },
    openGraph: {
      type: "article",
      url: postUrl,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      alternateLocale: locale === "fr" ? ["en_US"] : ["fr_FR"],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${post.title} | flompt blog`,
        },
      ],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = getTranslations(locale as Locale);
  const post = await getPostBySlug(slug, locale as Locale);

  if (!post) notFound();

  const postUrl = `https://flompt.dev/blog/${locale}/posts/${slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    url: postUrl,
    inLanguage: locale,
    keywords: post.tags?.join(", "),
    author: {
      "@type": "Person",
      name: "Nyrok",
      url: "https://github.com/Nyrok",
    },
    publisher: {
      "@type": "Person",
      name: "Nyrok",
      url: "https://github.com/Nyrok",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
  };

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Link
        href={`/${locale}`}
        className="inline-flex items-center text-sm transition-colors mb-6 sm:mb-8"
        style={{ color: "var(--text-dim)" }}
      >
        {t.post.backToArticles}
      </Link>

      <header className="mb-8 sm:mb-12">
        <div className="flex flex-col gap-2 mb-4">
          <time className="text-sm" style={{ color: "var(--text-dim)" }} dateTime={post.date}>
            {formatDate(post.date, locale as Locale)}
          </time>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-px rounded-full whitespace-nowrap"
                  style={{
                    border: "1px solid var(--border-medium)",
                    color: "var(--text-muted)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {post.excerpt}
          </p>
        )}
      </header>

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}
