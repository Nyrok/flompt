import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { formatDate } from "@/lib/formatDate";
import { getTranslations } from "@/i18n/translations";
import type { Locale } from "@/i18n/config";

export default function PostCard({
  post,
  locale,
}: {
  post: PostMeta;
  locale: Locale;
}) {
  const t = getTranslations(locale);
  const accentColor = post.color === "primary" ? "var(--accent)" : (post.color ?? "var(--accent)");

  return (
    <article>
      <Link
        href={`/${locale}/posts/${post.slug}`}
        className="block transition-all group overflow-hidden"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-standard)",
        }}
      >
        {/* Color accent bar */}
        <div style={{ height: "3px", background: accentColor }} />

        <div className="p-5">
          {/* Date + Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <time
              className="text-sm shrink-0"
              style={{ color: "var(--text-dim)" }}
              dateTime={post.date}
            >
              {formatDate(post.date, locale)}
            </time>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-1.5 py-px whitespace-nowrap"
                    style={{
                      borderRadius: "var(--radius-pill)",
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

          {/* Title */}
          <h2
            className="text-xl font-semibold mb-2 transition-colors group-hover:opacity-80"
            style={{ color: "var(--text-primary)" }}
          >
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
              {post.excerpt}
            </p>
          )}

          {/* Read more */}
          <span
            className="inline-block text-sm font-medium transition-transform group-hover:translate-x-1"
            style={{ color: "var(--accent)" }}
          >
            {t.post.readMore} &rarr;
          </span>
        </div>
      </Link>
    </article>
  );
}
