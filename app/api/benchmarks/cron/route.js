import { NextResponse } from "next/server";
import { updateDailyBenchmarks, getBenchmarkData } from "@/lib/benchmarkStore";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    const result = updateDailyBenchmarks(force);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    let force = searchParams.get("force") === "true";
    try {
      const body = await req.json();
      if (body && typeof body.force === "boolean") {
        force = body.force;
      }
    } catch (_) {}

    const result = updateDailyBenchmarks(force);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
