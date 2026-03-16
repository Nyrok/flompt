import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";
import type { Locale } from "@/i18n/config";
import { locales } from "@/i18n/config";

function getPostsDirectory(locale: Locale): string {
  return path.join(process.cwd(), "content/posts", locale);
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  color?: string;
  tags?: string[];
}

export interface Post extends PostMeta {
  contentHtml: string;
}

export function getAllPosts(locale: Locale): PostMeta[] {
  const dir = getPostsDirectory(locale);
  if (!fs.existsSync(dir)) return [];

  const fileNames = fs.readdirSync(dir);
  const posts = fileNames
    .filter((name) => name.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(dir, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        date: data.date || new Date().toISOString(),
        excerpt: data.excerpt || "",
        color: data.color,
        tags: data.tags || [],
      } as PostMeta;
    });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPostBySlug(
  slug: string,
  locale: Locale
): Promise<Post | null> {
  const dir = getPostsDirectory(locale);
  const fullPath = path.join(dir, `${slug}.md`);

  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    title: data.title || slug,
    date: data.date || new Date().toISOString(),
    excerpt: data.excerpt || "",
    color: data.color,
    tags: data.tags || [],
    contentHtml,
  };
}

export function getAllSlugs(locale: Locale): string[] {
  const dir = getPostsDirectory(locale);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""));
}

export function getAllLocaleSlugs(): { locale: Locale; slug: string }[] {
  const params: { locale: Locale; slug: string }[] = [];
  for (const locale of locales) {
    const slugs = getAllSlugs(locale);
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }
  return params;
}
