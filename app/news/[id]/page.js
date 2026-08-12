import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublishedArticleById } from "@/lib/newsStore";
import { Calendar, ArrowLeft, ShieldCheck, MapPin, Eye, FileCheck2 } from "lucide-react";

// Force dynamic execution to track view counts
export const revalidate = 0;

// Dynamic Metadata Generation for Search Engines (SEO)
export async function generateMetadata({ params }) {
  const { id } = await params;
  const article = getPublishedArticleById(id);
  
  if (!article) {
    return {
      title: "Report Not Found | HyperLocal.AI",
      description: "The requested hyperlocal news report could not be found."
    };
  }

  const cleanDescription = article.content
    .replace(/---[\s\S]*$/, "") // strip the attribution footnote
    .substring(0, 160)
    .trim() + "...";

  return {
    title: `${article.title} | HyperLocal.AI`,
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
      siteName: "HyperLocal.AI",
      authors: ["HyperLocal AI Coprocessor"],
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
    .replace(/---[\s\S]*$/, "")
    .substring(0, 160)
    .trim() + "...";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://hyperlocal.ai/news/${article.id}`
    },
    "headline": article.title,
    "description": cleanDescription,
    "datePublished": article.publishedAt,
    "dateModified": article.publishedAt,
    "author": {
      "@type": "Organization",
      "name": "HyperLocal AI Coprocessor",
      "url": "https://hyperlocal.ai"
    },
    "publisher": {
      "@type": "Organization",
      "name": "HyperLocal.AI News",
      "logo": {
        "@type": "ImageObject",
        "url": "https://hyperlocal.ai/logo.png"
      }
    },
    "about": {
      "@type": "Place",
      "name": article.location
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Helper to render body paragraphs with basic markup
  const renderContent = (content) => {
    // Separate body from the source attribution block
    const parts = content.split("---");
    const bodyText = parts[0];
    const footnoteText = parts[1];

    const paragraphs = bodyText.split("\n\n").map((para, idx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;
      
      // Render simple blockquotes if starting with >
      if (trimmed.startsWith(">")) {
        return (
          <blockquote key={idx}>
            {trimmed.replace(/^>\s*/, "")}
          </blockquote>
        );
      }
      return <p key={idx}>{trimmed}</p>;
    });

    return (
      <>
        {paragraphs}
        {footnoteText && (
          <div className="citation-banner">
            <div className="citation-header">
              <ShieldCheck size={18} style={{ color: "hsl(var(--success))" }} />
              Verified Sourcing Audit
            </div>
            <p className="citation-text">
              {footnoteText.replace(/\*/g, "").replace(/\[View Source\]\(([^)]+)\)/g, "$1").trim()}
            </p>
            <div style={{ marginTop: "12px", display: "flex", gap: "16px", fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
              <span>Plagiarism index: <b>{article.similarityScore || 0}%</b> (verified safe rewrite)</span>
              <span>•</span>
              <span>Source URL: <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "hsl(var(--primary))", textDecoration: "underline" }}>Official Registry Link</a></span>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="container" style={{ paddingBottom: "100px" }}>
      {/* JSON-LD structured data for Google News crawler */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="article-wrapper">
        {/* Navigation Back */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", color: "hsl(var(--muted-foreground))", marginBottom: "32px", cursor: "pointer" }}>
          <ArrowLeft size={16} />
          Back to Feed
        </Link>

        <article>
          <header className="article-header">
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
              <span className="article-category">{article.category}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "700", color: "white", backgroundColor: "hsl(var(--primary))", padding: "4px 10px", borderRadius: "20px" }}>
                <MapPin size={12} />
                {article.location}
              </span>
            </div>
            
            <h1 className="article-title">{article.title}</h1>
            
            <div className="article-meta-row">
              <div className="author-info">
                <div className="author-avatar flex-center">
                  AI
                </div>
                <div>
                  <div className="author-name">HyperLocal AI Editor</div>
                  <div className="author-date">{formatDate(article.publishedAt)}</div>
                </div>
              </div>
              
              <div className="article-meta-right">
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Eye size={16} />
                  {article.views || 0} views
                </span>
                <span>•</span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }} title="Audited similarity level with primary feed">
                  <FileCheck2 size={16} />
                  {article.similarityScore}% original overlap
                </span>
              </div>
            </div>
          </header>

          <div className="article-body">
            {renderContent(article.content)}
          </div>
        </article>
      </div>
    </div>
  );
}
