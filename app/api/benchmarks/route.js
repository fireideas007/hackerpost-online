import { NextResponse } from "next/server";
import { getBenchmarkModels, getBenchmarkEntities } from "@/lib/benchmarkStore";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("type") || "all";
    const sortBy = searchParams.get("sort") || "rank"; // "rank", "overall", "patching", "hunting", "injection"

    let models = [...getBenchmarkModels(filter)];

    if (sortBy === "patching") {
      models.sort((a, b) => b.metrics.patchingRate - a.metrics.patchingRate);
    } else if (sortBy === "hunting") {
      models.sort((a, b) => b.metrics.threatHunting - a.metrics.threatHunting);
    } else if (sortBy === "injection") {
      models.sort((a, b) => b.metrics.injectionDefense - a.metrics.injectionDefense);
    } else if (sortBy === "overall") {
      models.sort((a, b) => b.overallScore - a.overallScore);
    } else {
      models.sort((a, b) => a.rank - b.rank);
    }

    const entities = getBenchmarkEntities();

    return NextResponse.json({
      success: true,
      totalModels: models.length,
      models,
      entities
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
