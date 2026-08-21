import { NextResponse } from "next/server";
import { runAgentCycle, getAgentState } from "@/lib/agentEngine";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const state = getAgentState();
    
    // If agent is in standby or autoPublish is disabled, log and skip
    if (state.status !== "active") {
      return NextResponse.json({ success: true, message: "Agent in standby mode. Cycle skipped." });
    }

    const result = await runAgentCycle("autonomous-cron-scheduler");
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  return GET(req);
}
