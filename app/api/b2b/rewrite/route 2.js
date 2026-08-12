import { NextResponse } from "next/server";
import { simulateAiRewrite } from "@/lib/aiRewriter";
import { auditPlagiarism } from "@/lib/similarity";

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, content, location, sourceName, sourceUrl } = body;

    if (!title || !content || !location) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Payload must contain 'title', 'content', and 'location' string parameters." 
        },
        { status: 400 }
      );
    }

    const brandName = sourceName || "Verified Wire";
    const targetLoc = location || "Local Community";

    // 1. Execute simulated AI rewrite
    const rewriteResult = simulateAiRewrite(
      title,
      content,
      targetLoc,
      brandName,
      sourceUrl || ""
    );

    // 2. Audit rewrite against original to verify safety
    const rewriteAudit = auditPlagiarism(rewriteResult.content, content);

    // 3. Compile SEO assets (Metadata & JSON-LD Structured Data)
    const cleanDescription = rewriteResult.content
      .replace(/---[\s\S]*$/, "")
      .substring(0, 150)
      .trim() + "...";

    const jsonLdSchema = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": rewriteResult.title,
      "description": cleanDescription,
      "datePublished": rewriteResult.rewrittenAt,
      "author": {
        "@type": "Organization",
        "name": "B2B News Syndication Partner"
      },
      "publisher": {
        "@type": "Organization",
        "name": brandName
      },
      "about": {
        "@type": "Place",
        "name": targetLoc
      }
    };

    // Return full package to B2B subscriber
    return NextResponse.json({
      success: true,
      timestamp: rewriteResult.rewrittenAt,
      article: {
        originalTitle: title,
        rewrittenTitle: rewriteResult.title,
        rewrittenContent: rewriteResult.content,
        targetLocation: targetLoc,
        sourceProvider: brandName,
        plagiarismIndex: rewriteAudit.score,
        safetyStatus: rewriteAudit.status === "low" ? "passed" : "flagged"
      },
      seo: {
        metaTitle: `${rewriteResult.title} | ${targetLoc} local News`,
        metaDescription: cleanDescription,
        jsonLd: jsonLdSchema
      }
    });

  } catch (error) {
    console.error("B2B Rewrite API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process rewrite: " + error.message },
      { status: 500 }
    );
  }
}
