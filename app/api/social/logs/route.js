import { NextResponse } from "next/server";
import { getSocialLogs } from "@/lib/xPublisher";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const logs = getSocialLogs();
    const handle = process.env.X_ACCOUNT_HANDLE || "@HackerPost2";
    const apiKey = process.env.X_API_KEY || process.env.TWITTER_API_KEY;
    const isLiveConfigured = !!(apiKey && (process.env.X_ACCESS_TOKEN || process.env.TWITTER_ACCESS_TOKEN));

    return NextResponse.json({
      success: true,
      handle,
      accountUrl: `https://x.com/${handle.replace('@', '')}`,
      isLiveConfigured,
      mode: isLiveConfigured ? "live" : "simulated",
      totalBroadcasts: logs.length,
      logs
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
