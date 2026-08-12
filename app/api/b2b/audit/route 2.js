import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/newsStore";
import { auditPlagiarism } from "@/lib/similarity";

export async function POST(request) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim().length < 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Payload must contain a valid 'content' string of at least 10 characters." 
        },
        { status: 400 }
      );
    }

    const publishedList = getPublishedArticles();
    let highestPlagiarism = { score: 0, status: "low", overlappingPhrases: [] };
    let matchingArticle = null;

    // Scan database for overlaps
    for (const pub of publishedList) {
      const audit = auditPlagiarism(content, pub.content);
      if (audit.score > highestPlagiarism.score) {
        highestPlagiarism = audit;
        matchingArticle = {
          id: pub.id,
          title: pub.title,
          url: `/news/${pub.id}`
        };
      }
    }

    // Return audit assessment
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      audit: {
        similarityScore: highestPlagiarism.score,
        riskLevel: highestPlagiarism.status,
        flaggedPhrases: highestPlagiarism.overlappingPhrases,
        matchedReference: matchingArticle
      }
    });

  } catch (error) {
    console.error("B2B Audit API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request: " + error.message },
      { status: 500 }
    );
  }
}
