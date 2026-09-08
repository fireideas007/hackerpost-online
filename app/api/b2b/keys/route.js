import { NextResponse } from "next/server";
import { verifySessionToken, sanitizeInput, getClientIp } from "@/lib/security";
import { getUserById, getUserApiKeys, createApiKey } from "@/lib/userStore";

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

// GET /api/b2b/keys - Get all keys owned by authenticated user (IDOR Safe)
export async function GET(request) {
  try {
    const user = authenticateSession(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required to access API keys." }, { status: 401 });
    }

    // IDOR Protection: Always fetch keys strictly scoped to user.id
    const keys = getUserApiKeys(user.id);
    return NextResponse.json({ success: true, keys, tier: user.tier });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/b2b/keys - Generate a new API key for authenticated user (IDOR Safe)
export async function POST(request) {
  try {
    const user = authenticateSession(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required to generate an API key." }, { status: 401 });
    }

    const clientIp = getClientIp(request);
    const body = await request.json().catch(() => ({}));
    const keyName = sanitizeInput(body.name || "Production API Key", 50);

    // IDOR Protection: Create key strictly attached to user.id
    const { rawKey, key } = createApiKey(user.id, user.tier, keyName, clientIp);

    return NextResponse.json({
      success: true,
      message: "API Key successfully provisioned. Store this key securely; it will not be displayed in plaintext again.",
      rawKey, // Returned ONCE to client
      key
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
