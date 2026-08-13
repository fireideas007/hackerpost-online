import { notFound } from "next/navigation";
import { getPublishedArticleById } from "@/lib/newsStore";
import ArticleClient from "./ArticleClient";

export const revalidate = 0;

// Dynamic Metadata Generation for Search Engines (SEO)
export async function generateMetadata({ params }) {
  const { id } = await params;
  const article = getPublishedArticleById(id);
  
  if (!article) {
    return {
      title: "Advisory Not Found | HackerPost.online",
      description: "The requested security advisory could not be found."
    };
  }

  const cleanDescription = article.content
    .replace(/#[\s\S]*?\n/, "") // strip the main title
    .replace(/---[\s\S]*$/, "") // strip the attribution footnote
    .substring(0, 160)
    .trim() + "...";

  return {
    title: `${article.title} | HackerPost.online`,
    description: cleanDescription,
    alternates: {
      canonical: `/news/${id}`,
    },
    openGraph: {
      title: article.title,
      description: cleanDescription,
      url: `/news/${id}`,
      type: "article",
      publishedTime: article.publishedAt,
      siteName: "HackerPost.online",
      authors: ["Advisory Engine Coprocessor"],
    },
  };
}

export default async function ArticlePage({ params }) {
  const { id } = await params;
  const article = getPublishedArticleById(id);

  if (!article) {
    notFound();
  }

  // Generate JSON-LD Structured Data for search engines
  const cleanDescription = article.content
    .replace(/#[\s\S]*?\n/, "")
    .replace(/---[\s\S]*$/, "")
    .substring(0, 160)
    .trim() + "...";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://hackerpost.online/news/${article.id}`
    },
    "headline": article.title,
    "description": cleanDescription,
    "datePublished": article.publishedAt,
    "dateModified": article.publishedAt,
    "author": {
      "@type": "Organization",
      "name": "Advisory Engine Coprocessor",
      "url": "https://hackerpost.online"
    },
    "publisher": {
      "@type": "Organization",
      "name": "HackerPost Threat Portal",
      "logo": {
        "@type": "ImageObject",
        "url": "https://hackerpost.online/logo.png"
      }
    },
    "about": {
      "@type": "Thing",
      "name": article.cve || article.location
    }
  };

  return (
    <div className="container" style={{ paddingBottom: "100px" }}>
      {/* JSON-LD structured data for Google News crawler */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ArticleClient article={article} />
    </div>
  );
}
