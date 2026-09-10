import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/newsStore";
import { publishToX, getMaskedTwitterConfig } from "@/lib/xPublisher";

export const dynamic = "force-dynamic";

/**
 * POST /api/social/sync-all
 * Finds all published articles that have not yet been syndicated to X (or simulated)
 * and broadcasts them sequentially.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const limit = Math.min(Math.max(body.limit || 10, 1), 25);
    const force = body.force === true;

    const allArticles = getPublishedArticles();
    
    // Filter articles that either haven't been syndicated or are not published
    const unposted = allArticles.filter(art => {
      if (force) return true;
      return !art.tweetId && art.xStatus !== "published";
    }).slice(0, limit);

    if (unposted.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All articles are already synchronized with X.",
        count: 0,
        results: []
      });
    }

    const results = [];
    for (const art of unposted) {
      try {
        const res = await publishToX(art, { force });
        results.push({
          articleId: art.id,
          title: art.title,
          status: res.status,
          tweetId: res.tweetId || null,
          tweetUrl: res.tweetUrl || null,
          error: res.error || null
        });
        // Small 300ms pause between tweets to respect rate limits
        await new Promise(r => setTimeout(r, 300));
      } catch (postErr) {
        results.push({
          articleId: art.id,
          title: art.title,
          status: "error",
          error: postErr.message
        });
      }
    }

    const config = getMaskedTwitterConfig();

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} articles for X syndication.`,
      count: results.length,
      config,
      results
    });
  } catch (err) {
    console.error("POST /api/social/sync-all error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
