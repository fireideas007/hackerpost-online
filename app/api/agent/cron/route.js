import { NextResponse } from "next/server";
import { runAgentCycle, getAgentState } from "@/lib/agentEngine";
import { updateDailyBenchmarks } from "@/lib/benchmarkStore";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const state = getAgentState();
    
    // Automatically trigger daily benchmark sync check
    const benchmarkResult = updateDailyBenchmarks(false);

    // If agent is in standby or autoPublish is disabled, log and skip cycle
    if (state.status !== "active") {
      return NextResponse.json({ 
        success: true, 
        message: "Agent in standby mode. News cycle skipped.",
        benchmarksUpdated: benchmarkResult.updated
      });
    }

    const newsResult = await runAgentCycle("autonomous-cron-scheduler");
    return NextResponse.json({
      ...newsResult,
      benchmarksUpdated: benchmarkResult.updated,
      benchmarkMessage: benchmarkResult.message
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  return GET(req);
}
