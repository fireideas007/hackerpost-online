import { getPublishedArticles } from "@/lib/newsStore";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Get all published articles to construct their canonical URLs
  const articles = getPublishedArticles();

  const articleUrls = articles.map((art) => ({
    url: `${baseUrl}/news/${art.id}`,
    lastModified: new Date(art.publishedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...articleUrls,
  ];
}
