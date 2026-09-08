import { notFound } from "next/navigation";
import { getPublishedArticleById } from "@/lib/newsStore";
import ArticleClient from "./ArticleClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      .substring(0, 160)
      .trim() + "...";

    const articleSlug = article.slug || id;

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
      ],
      alternates: {
        canonical: `/news/${articleSlug}`,
      },
      openGraph: {
        title: `${article.title || "Threat Advisory"} | CISO Intelligence Wire`,
        description: cleanDescription,
        url: `/news/${articleSlug}`,
        type: "article",
        publishedTime: article.publishedAt,
        siteName: "HackerPost.online Threat Portal",
        authors: ["HackerPost Newsroom Coprocessor", "Hackproof Security Labs"],
      },
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

  const articleSlug = article.slug || article.id;

  const cleanDescription = (article.content || "")
    .replace(/#[\s\S]*?\n/, "")
    .replace(/---[\s\S]*$/, "")
    .substring(0, 160)
    .trim() + "...";

  // Multi-schema JSON-LD Graph for Google Search & Google News Rich Results
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `https://hackerpost.online/news/${articleSlug}#article`,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://hackerpost.online/news/${articleSlug}`
        },
        "headline": article.title || "Threat Advisory",
        "description": cleanDescription,
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
            "url": "https://hackerpost.online/logo.png"
          }
        },
        "about": {
          "@type": "Thing",
          "name": article.cve || article.affectedProduct || "Cybersecurity Threat Advisory"
        }
      },
      {
        "@type": "FAQPage",
        "@id": `https://hackerpost.online/news/${articleSlug}#faq`,
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
