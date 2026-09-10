import { NextResponse } from "next/server";
import { getMaskedTwitterConfig, saveTwitterConfig, verifyTwitterConnection } from "@/lib/xPublisher";

export const dynamic = "force-dynamic";

/**
 * GET /api/social/config
 * Returns current Twitter handle, auto-post setting, and masked credentials info.
 */
export async function GET() {
  try {
    const config = getMaskedTwitterConfig();
    return NextResponse.json({
      success: true,
      config
    });
  } catch (err) {
    console.error("GET /api/social/config error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/social/config
 * Updates Twitter handle, credentials, and auto-post settings.
 * Optionally runs verification test against Twitter API v2.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { 
      handle, 
      apiKey, 
      apiSecret, 
      accessToken, 
      accessSecret, 
      bearerToken,
      autoPost,
      verifyNow
    } = body;

    // Save updated configuration to persistent storage
    const updatedMasked = saveTwitterConfig({
      handle,
      apiKey,
      apiSecret,
      accessToken,
      accessSecret,
      bearerToken,
      autoPost: typeof autoPost === "boolean" ? autoPost : undefined
    });

    let verificationResult = null;
    if (verifyNow) {
      verificationResult = await verifyTwitterConnection();
    }

    const finalConfig = getMaskedTwitterConfig();

    return NextResponse.json({
      success: true,
      message: "Twitter handle and configuration updated successfully.",
      config: finalConfig,
      verification: verificationResult
    });
  } catch (err) {
    console.error("POST /api/social/config error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
