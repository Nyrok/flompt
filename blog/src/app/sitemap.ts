import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { locales } from "@/i18n/config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://flompt.dev";
  const now = new Date().toISOString();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    // Blog homepage per locale
    entries.push({
      url: `${baseUrl}/blog/${locale}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    });

    // About page
    entries.push({
      url: `${baseUrl}/blog/${locale}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    });

    // Blog posts — use actual post date as lastModified
    const posts = getAllPosts(locale);
    for (const post of posts) {
      entries.push({
        url: `${baseUrl}/blog/${locale}/posts/${post.slug}`,
        lastModified: new Date(post.date).toISOString(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
