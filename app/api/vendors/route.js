import { NextResponse } from "next/server";
import { getVendorLeaderboard, submitStartupNomination } from "@/lib/vendorStore";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "All Domains";
    const sortBy = searchParams.get("sort") || "rank";
    const search = searchParams.get("q") || "";

    const result = getVendorLeaderboard({ category, sortBy, search });
    return NextResponse.json(result);
  } catch (err) {
    console.error("API /api/vendors Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve vendor leaderboard data." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = submitStartupNomination(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("API /api/vendors POST Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to process vendor nomination." },
      { status: 500 }
    );
  }
}
