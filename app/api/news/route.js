import { NextResponse } from "next/server";
import { 
  getProviders, 
  getRawArticles, 
  getPublishedArticles, 
  addPublishedArticle,
  deletePublishedArticle,
  getTrendingSearches,
  seedSearchLogs
} from "@/lib/newsStore";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location") || "";
    
    // Support simulated traffic generation
    if (searchParams.get("seedSearches") === "true") {
      seedSearchLogs();
    }
    
    const providers = getProviders();
    const raw = getRawArticles();
    const published = getPublishedArticles(location);
    const trending = getTrendingSearches();
    
    return NextResponse.json({
      success: true,
      providers,
      raw,
      published,
      trending
    });
  } catch (error) {
    console.error("API GET news error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      rawId, 
      providerName, 
      originalTitle, 
      title, 
      content, 
      category, 
      location, 
      sourceUrl, 
      similarityScore 
    } = body;
    
    if (!title || !content || !location) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, content, or location" },
        { status: 400 }
      );
    }
    
    const publishedArticle = addPublishedArticle({
      rawId,
      providerName: providerName || "Verified Feed",
      originalTitle: originalTitle || title,
      title,
      content,
      category: category || "General",
      location,
      sourceUrl: sourceUrl || "",
      similarityScore: typeof similarityScore === "number" ? similarityScore : 0
    });
    
    return NextResponse.json({
      success: true,
      article: publishedArticle
    });
  } catch (error) {
    console.error("API POST news error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deleteId = searchParams.get("deleteId");
    
    if (!deleteId) {
      return NextResponse.json(
        { success: false, error: "Missing deleteId parameter" },
        { status: 400 }
      );
    }
    
    const success = deletePublishedArticle(deleteId);
    return NextResponse.json({ success: true, deleted: success });
  } catch (error) {
    console.error("API DELETE news error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

