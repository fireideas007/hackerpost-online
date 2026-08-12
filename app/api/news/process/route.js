import { NextResponse } from "next/server";
import { getRawArticleById, getPublishedArticles } from "@/lib/newsStore";
import { auditPlagiarism } from "@/lib/similarity";
import { simulateAiRewrite } from "@/lib/aiRewriter";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawId = searchParams.get("rawId");
    const location = searchParams.get("location") || "Local Community";

    if (!rawId) {
      return NextResponse.json(
        { success: false, error: "Missing rawId parameter" },
        { status: 400 }
      );
    }

    const rawArticle = getRawArticleById(rawId);
    if (!rawArticle) {
      return NextResponse.json(
        { success: false, error: "Raw article not found" },
        { status: 404 }
      );
    }

    // 1. Audit original text against existing published articles to detect external duplication/plagiarism
    const publishedList = getPublishedArticles();
    let highestPlagiarism = { score: 0, status: "low", overlappingPhrases: [] };
    
    for (const pub of publishedList) {
      const audit = auditPlagiarism(rawArticle.content, pub.content);
      if (audit.score > highestPlagiarism.score) {
        highestPlagiarism = audit;
      }
    }

    // If no published articles exist, simulate a comparison with a hypothetical similar article to show the plagiarism feature
    if (publishedList.length === 0) {
      // Create a dummy comparison to show Jaccard working
      const dummyText = rawArticle.content; // 100% match
      highestPlagiarism = auditPlagiarism(rawArticle.content, dummyText);
    }

    // 2. Perform simulated AI rewrite to create a unique localized article
    const rewritten = simulateAiRewrite(
      rawArticle.title,
      rawArticle.content,
      location,
      rawArticle.providerName,
      rawArticle.sourceUrl
    );

    // 3. Audit rewritten text against original to verify that plagiarism has been resolved
    const rewriteAudit = auditPlagiarism(rewritten.content, rawArticle.content);

    return NextResponse.json({
      success: true,
      rawArticle,
      originalPlagiarism: highestPlagiarism,
      rewrittenArticle: rewritten,
      rewrittenPlagiarism: rewriteAudit
    });
  } catch (error) {
    console.error("API process news error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
