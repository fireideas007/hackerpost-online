import { NextResponse } from "next/server";
import { scrapeCisaAlerts } from "@/lib/scraper";
import { getRawArticles, getPublishedArticles, addRawArticle } from "@/lib/newsStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Fetch live articles from CISA
    const scrapedItems = await scrapeCisaAlerts();
    if (scrapedItems.length === 0) {
      return NextResponse.json({ success: true, message: "No items fetched from CISA RSS.", insertedCount: 0 });
    }

    // 2. Fetch existing data to de-duplicate
    const existingRaw = getRawArticles();
    const existingPublished = getPublishedArticles();

    // Collect URLs / Titles for quick lookup
    const existingUrls = new Set([
      ...existingRaw.map(a => a.sourceUrl?.toLowerCase()),
      ...existingPublished.map(a => a.sourceUrl?.toLowerCase())
    ]);

    const existingTitles = new Set([
      ...existingRaw.map(a => a.title?.toLowerCase().trim()),
      ...existingPublished.map(a => a.title?.toLowerCase().trim())
    ]);

    let insertedCount = 0;

    // 3. De-duplicate and ingest
    for (const item of scrapedItems) {
      const urlKey = item.sourceUrl?.toLowerCase();
      const titleKey = item.title?.toLowerCase().trim();

      if (urlKey && existingUrls.has(urlKey)) continue;
      if (titleKey && existingTitles.has(titleKey)) continue;

      // Ingest as raw article
      addRawArticle(item);
      insertedCount++;
    }

    return NextResponse.json({
      success: true,
      scrapedCount: scrapedItems.length,
      insertedCount
    });
  } catch (err) {
    console.error("Ingest API Error: ", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
