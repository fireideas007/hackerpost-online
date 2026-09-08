import { NextResponse } from "next/server";
import { simulateAiRewrite } from "@/lib/aiRewriter";
import { auditPlagiarism } from "@/lib/similarity";
import { sanitizeInput, unescapeInput } from "@/lib/security";
import { validateBearerKey } from "@/lib/userStore";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    // 1. Authenticate incoming Bearer API Key
    const authHeader = request.headers.get("authorization");
    const rawKey = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;

    if (!rawKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Unauthorized: Missing Bearer API Key. Pass 'Authorization: Bearer hp_live_...' header." 
        },
        { status: 401 }
      );
    }

    const keyValidation = validateBearerKey(rawKey);
    if (!keyValidation.valid) {
      const isRateLimited = keyValidation.status === 429;
      const headers = isRateLimited && keyValidation.rateLimit ? {
        "Retry-After": keyValidation.rateLimit.retryAfter.toString(),
        "X-RateLimit-Limit": keyValidation.rateLimit.limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": keyValidation.rateLimit.resetTime.toString()
      } : {};

      return NextResponse.json(
        { success: false, error: keyValidation.error },
        { status: keyValidation.status || 401, headers }
      );
    }

    // 2. Parse & Sanitize Input Parameters (XSS Defense)
    const body = await request.json().catch(() => ({}));
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

    const cleanTitle = unescapeInput(sanitizeInput(title, 200));
    const cleanContent = unescapeInput(sanitizeInput(content, 20000));
    const cleanLocation = unescapeInput(sanitizeInput(location, 100));
    const brandName = unescapeInput(sanitizeInput(sourceName || "Verified Wire", 100));
    const cleanSourceUrl = sanitizeInput(sourceUrl || "", 300);

    // 3. Execute AI rewrite
    const rewriteResult = simulateAiRewrite(
      cleanTitle,
      cleanContent,
      cleanLocation,
      brandName,
      cleanSourceUrl
    );

    // 4. Audit rewrite against original to verify safety
    const rewriteAudit = auditPlagiarism(rewriteResult.content, cleanContent);

    // 5. Compile SEO assets (Metadata & JSON-LD Structured Data)
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
        "name": cleanLocation
      }
    };

    // 6. Return response with Rate Limit headers
    const rateLimit = keyValidation.rateLimit;
    const responseHeaders = {
      "X-RateLimit-Limit": rateLimit.limit.toString(),
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-RateLimit-Reset": rateLimit.resetTime.toString()
    };

    return NextResponse.json({
      success: true,
      timestamp: rewriteResult.rewrittenAt,
      tier: keyValidation.tier,
      article: {
        originalTitle: cleanTitle,
        rewrittenTitle: rewriteResult.title,
        rewrittenContent: rewriteResult.content,
        targetLocation: cleanLocation,
        sourceProvider: brandName,
        plagiarismIndex: rewriteAudit.score,
        safetyStatus: rewriteAudit.status === "low" ? "passed" : "flagged"
      },
      seo: {
        metaTitle: `${rewriteResult.title} | ${cleanLocation} Threat Advisory`,
        metaDescription: cleanDescription,
        jsonLd: jsonLdSchema
      },
      telemetry: {
        keyId: keyValidation.keyId,
        rateLimitTier: keyValidation.tier,
        remainingRequestsInWindow: rateLimit.remaining
      }
    }, { headers: responseHeaders });

  } catch (error) {
    console.error("B2B Rewrite API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process rewrite: " + error.message },
      { status: 500 }
    );
  }
}
