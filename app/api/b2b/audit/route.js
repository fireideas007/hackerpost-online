import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/newsStore";
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

    // 2. Parse & Sanitize Input Payload (XSS / Injection Defense)
    const body = await request.json().catch(() => ({}));
    const rawContent = body.content;

    if (!rawContent || typeof rawContent !== "string" || rawContent.trim().length < 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Payload must contain a valid 'content' string of at least 10 characters." 
        },
        { status: 400 }
      );
    }

    // Sanitize input to strip harmful scripts and tags
    const sanitizedContent = sanitizeInput(rawContent, 20000);
    const contentToAudit = unescapeInput(sanitizedContent);

    // 3. Scan database for vulnerability overlaps
    const publishedList = getPublishedArticles();
    let highestPlagiarism = { score: 0, status: "low", overlappingPhrases: [] };
    let matchingArticle = null;

    for (const pub of publishedList) {
      const audit = auditPlagiarism(contentToAudit, pub.content);
      if (audit.score > highestPlagiarism.score) {
        highestPlagiarism = audit;
        matchingArticle = {
          id: pub.id,
          title: pub.title,
          url: `/news/${pub.slug || pub.id}`
        };
      }
    }

    // 4. Return audit assessment with Rate Limit headers
    const rateLimit = keyValidation.rateLimit;
    const responseHeaders = {
      "X-RateLimit-Limit": rateLimit.limit.toString(),
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-RateLimit-Reset": rateLimit.resetTime.toString()
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tier: keyValidation.tier,
      audit: {
        similarityScore: highestPlagiarism.score,
        riskLevel: highestPlagiarism.status,
        flaggedPhrases: highestPlagiarism.overlappingPhrases,
        matchedReference: matchingArticle
      },
      telemetry: {
        keyId: keyValidation.keyId,
        rateLimitTier: keyValidation.tier,
        remainingRequestsInWindow: rateLimit.remaining
      }
    }, { headers: responseHeaders });

  } catch (error) {
    console.error("B2B Audit API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request: " + error.message },
      { status: 500 }
    );
  }
}
