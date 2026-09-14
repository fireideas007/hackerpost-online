import { notFound, redirect } from "next/navigation";
import { getPublishedArticleById } from "@/lib/newsStore";
import ArticleClient from "./ArticleClient";

export const dynamic = "force-dynamic";

// Dynamic Metadata Generation for Search Engines (CISO SEO)
export async function generateMetadata({ params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    const article = id ? getPublishedArticleById(id) : null;
    
    if (!article) {
      return {
        title: "Advisory Not Found | HackerPost.online",
        description: "The requested security advisory could not be found."
      };
    }

    const cleanDescription = (article.content || "")
      .replace(/#[\s\S]*?\n/, "") // strip the main title
      .replace(/---[\s\S]*$/, "") // strip the attribution footnote
      .replace(/[#*`_~>[\]]/g, "") // Clean markdown characters
      .substring(0, 160)
      .trim() + "...";

    const articleSlug = article.slug || id;
    const canonicalUrl = `https://hackerpost.online/news/${articleSlug}`;
    const imageUrl = article.imageUrl || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80";

    return {
      title: `${article.title || "Threat Advisory"} | CISO Executive Brief | HackerPost.online`,
      description: cleanDescription,
      keywords: [
        "CISO Executive Briefing",
        "Threat Advisory",
        article.cve || "CVE Exploit",
        article.affectedProduct || "Cybersecurity",
        "SEC Form 8-K Compliance",
        "Hackproof Technologies",
        "Vulnerability Mitigation Playbook"
      ].filter(Boolean),
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${article.title || "Threat Advisory"} | CISO Intelligence Wire`,
        description: cleanDescription,
        url: canonicalUrl,
        type: "article",
        publishedTime: article.publishedAt,
        siteName: "HackerPost.online Threat Portal",
        authors: ["HackerPost Newsroom Coprocessor", "Hackproof Security Labs"],
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: article.title || "HackerPost Threat Advisory"
          }
        ]
      },
      twitter: {
        card: "summary_large_image",
        title: `${article.title || "Threat Advisory"} | HackerPost.online`,
        description: cleanDescription,
        images: [imageUrl]
      }
    };
  } catch (_) {
    return {
      title: "HackerPost Threat Advisory | CISO Intelligence",
      description: "Real-time threat intelligence, CISO executive briefings, and vulnerability remediation."
    };
  }
}

export default async function ArticlePage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const article = id ? getPublishedArticleById(id) : null;

  if (!article) {
    notFound();
  }

  // SEO-friendly URL Canonical Enforcement:
  // If user requested via raw ID (e.g. pub-1 or pub-1789...) or unnormalized slug,
  // 301 redirect to the clean, keyword-rich SEO canonical slug!
  if (article.slug && id !== article.slug) {
    redirect(`/news/${article.slug}`);
  }

  const articleSlug = article.slug || article.id;
  const canonicalUrl = `https://hackerpost.online/news/${articleSlug}`;

  const cleanDescription = (article.content || "")
    .replace(/#[\s\S]*?\n/, "")
    .replace(/---[\s\S]*$/, "")
    .replace(/[#*`_~>[\]]/g, "")
    .substring(0, 160)
    .trim() + "...";

  // Multi-schema JSON-LD Graph for Google Search & Google News Rich Results
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${canonicalUrl}#article`,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl
        },
        "headline": article.title || "Threat Advisory",
        "description": cleanDescription,
        "image": article.imageUrl ? [article.imageUrl] : [],
        "datePublished": article.publishedAt || new Date().toISOString(),
        "dateModified": article.publishedAt || new Date().toISOString(),
        "author": {
          "@type": "Organization",
          "name": "HackerPost Editorial Coprocessor",
          "url": "https://hackerpost.online"
        },
        "publisher": {
          "@type": "Organization",
          "name": "HackerPost Threat Portal & Hackproof Technologies",
          "logo": {
            "@type": "ImageObject",
            "url": "https://hackerpost.online/favicon.ico"
          }
        },
        "about": {
          "@type": "Thing",
          "name": article.cve || article.affectedProduct || "Cybersecurity Threat Advisory"
        }
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": `What is the enterprise risk of ${article.title}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `This advisory covers an active security vector involving ${article.affectedProduct || "enterprise systems"} with ${article.severity || "high"} severity impact, presenting high risk of unauthorized lateral movement or unauthenticated execution.`
            }
          },
          {
            "@type": "Question",
            "name": "What are the recommended CISO and SecOps remediation steps?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Security leadership should immediately verify perimeter exposure, deploy vendor hotfixes, enforce micro-isolation on exposed daemon sockets, and review identity session logs."
            }
          },
          {
            "@type": "Question",
            "name": "Does this exposure require SEC material incident disclosure?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Under current SEC cyber disclosure mandates (Item 1.05 Form 8-K), public entities determining a material cybersecurity incident must disclose within four business days of determination."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="container" style={{ paddingBottom: "100px" }}>
      {/* JSON-LD structured data for Google News & Search Engine Rich FAQ Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ArticleClient article={article} />
    </div>
  );
}
