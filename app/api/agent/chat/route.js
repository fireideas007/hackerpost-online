import { NextResponse } from "next/server";
import { steerAgent } from "@/lib/agentEngine";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ success: false, error: "Directive message required" }, { status: 400 });
    }

    const result = await steerAgent(message.trim());
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
