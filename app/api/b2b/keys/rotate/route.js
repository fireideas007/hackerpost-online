import { NextResponse } from "next/server";
import { verifySessionToken, getClientIp } from "@/lib/security";
import { getUserById, rotateApiKey } from "@/lib/userStore";

export const dynamic = "force-dynamic";

function authenticateSession(request) {
  const sessionCookie = request.cookies.get("hp_b2b_session")?.value;
  const authHeader = request.headers.get("authorization");
  const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const token = sessionCookie || headerToken;

  if (!token) return null;
  const payload = verifySessionToken(token);
  if (!payload || !payload.userId) return null;

  return getUserById(payload.userId);
}

export async function POST(request) {
  try {
    const user = authenticateSession(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    const clientIp = getClientIp(request);
    const body = await request.json().catch(() => ({}));
    const { keyId } = body;

    if (!keyId || typeof keyId !== "string") {
      return NextResponse.json({ success: false, error: "Parameter 'keyId' is required." }, { status: 400 });
    }

    // IDOR Protection: rotateApiKey will throw if keyId is not owned by user.id
    const result = rotateApiKey(user.id, keyId, clientIp);

    return NextResponse.json({
      success: true,
      message: "API Key rotated successfully. The previous key has been revoked.",
      rawKey: result.rawKey, // Returned ONCE
      newKey: result.newKey
    });
  } catch (err) {
    const isIdor = err.message.includes("access denied") || err.message.includes("not found");
    return NextResponse.json(
      { success: false, error: err.message },
      { status: isIdor ? 403 : 500 }
    );
  }
}
