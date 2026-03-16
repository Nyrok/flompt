import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: [
      "https://flompt.dev/blog/sitemap.xml",
      "https://flompt.dev/sitemap.xml",
    ],
  };
}
