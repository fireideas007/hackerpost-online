import { NextResponse } from "next/server";
import { runAgentCycle } from "@/lib/agentEngine";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    let source = "manual-control-room";
    let forceSurge = false;
    try {
      const body = await req.json();
      if (body?.trigger) source = body.trigger;
      if (body?.forceSurge) forceSurge = true;
    } catch (_) {}

    const result = await runAgentCycle(source, { forceSurge });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
