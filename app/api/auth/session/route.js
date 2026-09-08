import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/security";
import { getUserById, getUserApiKeys } from "@/lib/userStore";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // Read session from HttpOnly cookie or Authorization header
    const sessionCookie = request.cookies.get("hp_b2b_session")?.value;
    const authHeader = request.headers.get("authorization");
    const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    const token = sessionCookie || headerToken;
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const payload = verifySessionToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ authenticated: false, error: "Session expired or invalid" }, { status: 200 });
    }

    const user = getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ authenticated: false, error: "User account no longer exists" }, { status: 200 });
    }

    const apiKeys = getUserApiKeys(user.id);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        tier: user.tier,
        role: user.role,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      },
      apiKeys
    });
  } catch (err) {
    console.error("Session check error:", err);
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}
