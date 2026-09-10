import { NextResponse } from "next/server";
import { getSocialLogs, getMaskedTwitterConfig } from "@/lib/xPublisher";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const logs = getSocialLogs();
    const config = getMaskedTwitterConfig();

    return NextResponse.json({
      success: true,
      handle: config.handle,
      accountUrl: config.accountUrl,
      isLiveConfigured: config.isLiveConfigured,
      isVerified: config.isVerified,
      mode: config.mode,
      config,
      totalBroadcasts: logs.length,
      logs
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
