import { NextResponse } from "next/server";
import { verifyTwitterConnection, getMaskedTwitterConfig } from "@/lib/xPublisher";

export const dynamic = "force-dynamic";

/**
 * POST /api/social/test
 * Sends a live verification ping to Twitter API v2 (GET /2/users/me)
 * using the currently stored or provided OAuth 1.0a credentials.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const explicitCredentials = body.credentials || null;

    const result = await verifyTwitterConnection(explicitCredentials);
    const updatedConfig = getMaskedTwitterConfig();

    return NextResponse.json({
      success: result.success,
      result,
      config: updatedConfig
    });
  } catch (err) {
    console.error("POST /api/social/test error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
