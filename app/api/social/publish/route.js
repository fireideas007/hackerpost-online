import { NextResponse } from "next/server";
import { getPublishedArticleById } from "@/lib/newsStore";
import { composeTweet, publishToX } from "@/lib/xPublisher";

export const dynamic = "force-dynamic";

// GET /api/social/publish?articleId=... - Preview X Tweet Payload
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json({ success: false, error: "Missing articleId parameter" }, { status: 400 });
    }

    const article = getPublishedArticleById(articleId);
    if (!article) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }

    const tweetPreview = composeTweet(article);
    return NextResponse.json({
      success: true,
      handle: process.env.X_ACCOUNT_HANDLE || "@HackerPost2",
      tweet: tweetPreview
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/social/publish - Broadcast an article to X (@HackerPost2)
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { articleId, article } = body;

    let targetArticle = article;
    if (!targetArticle && articleId) {
      targetArticle = getPublishedArticleById(articleId);
    }

    if (!targetArticle) {
      return NextResponse.json(
        { success: false, error: "Missing article or valid articleId in payload" },
        { status: 400 }
      );
    }

    const result = await publishToX(targetArticle);
    return NextResponse.json({
      success: true,
      message: `Article successfully processed for X syndication (${result.handle}).`,
      broadcast: result
    });
  } catch (err) {
    console.error("Social broadcast error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
