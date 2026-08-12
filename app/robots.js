export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/_next/",
        "/api/",
        "/admin" // Discourage indexing administrative sandbox dashboards
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
