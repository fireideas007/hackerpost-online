import { NextResponse } from "next/server";
import { getAgentState, saveAgentState, appendAgentLog } from "@/lib/agentEngine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = getAgentState();
    return NextResponse.json({ success: true, state });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const currentState = getAgentState();

    const updatedState = {
      ...currentState,
      ...body,
      metrics: {
        ...currentState.metrics,
        ...(body.metrics || {})
      }
    };

    saveAgentState(updatedState);
    appendAgentLog("steer", "Agent configuration updated via settings panel.");

    return NextResponse.json({ success: true, state: updatedState });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
