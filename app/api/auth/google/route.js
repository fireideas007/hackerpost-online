import { NextResponse } from "next/server";
import { 
  rateLimiter, 
  signSessionToken, 
  sanitizeInput, 
  getClientIp, 
  TIER_LIMITS 
} from "@/lib/security";
import { findOrCreateGoogleUser } from "@/lib/userStore";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);

    // 1. Enforce IP-based Rate Limiting on Authentication (Brute Force Protection)
    const rateLimit = rateLimiter.check(`auth:ip:${clientIp}`, TIER_LIMITS.Auth.perMinute, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Too many authentication attempts. Please retry in ${rateLimit.retryAfter} seconds.` 
        },
        { 
          status: 429,
          headers: {
            "Retry-After": rateLimit.retryAfter.toString(),
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.resetTime.toString()
          }
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { credential, idToken, demoUser, email: rawEmail, name: rawName, avatar: rawAvatar } = body;

    let googleProfile = null;

    // 2. Real Google OAuth / ID Token Verification
    if (credential || idToken) {
      const token = credential || idToken;
      try {
        // Query Google's tokeninfo endpoint to cryptographically verify token
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
        if (googleRes.ok) {
          const payload = await googleRes.json();
          // Verify Google Client ID if configured in env
          if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
            return NextResponse.json(
              { success: false, error: "Google Token Audience mismatch. Security check failed." },
              { status: 401 }
            );
          }
          googleProfile = {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            avatar: payload.picture
          };
        } else {
          // Token failed Google verification
          return NextResponse.json(
            { success: false, error: "Invalid Google OAuth ID Token. Identity verification failed." },
            { status: 401 }
          );
        }
      } catch (err) {
        console.error("Google token verification network error:", err);
        return NextResponse.json(
          { success: false, error: "Unable to verify Google credentials with identity provider." },
          { status: 502 }
        );
      }
    } else if (demoUser || rawEmail) {
      // 3. Local Development / Sandbox Google Sign-In Simulation
      // Sanitizes inputs to prevent XSS/injection
      const safeEmail = sanitizeInput(rawEmail || `ciso.lead@hackproof.online`, 100);
      const safeName = sanitizeInput(rawName || "Enterprise SecOps Lead", 100);
      const safeAvatar = rawAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces";

      googleProfile = {
        googleId: `google_sim_${Buffer.from(safeEmail).toString('hex').slice(0, 16)}`,
        email: safeEmail,
        name: safeName,
        avatar: safeAvatar
      };
    } else {
      return NextResponse.json(
        { success: false, error: "Missing Google authorization payload (credential or ID token required)." },
        { status: 400 }
      );
    }

    // 4. Find or Create User in persistent store
    const { user, isNew, initialKey, keyRecord } = findOrCreateGoogleUser({
      googleId: googleProfile.googleId,
      email: googleProfile.email,
      name: googleProfile.name,
      avatar: googleProfile.avatar,
      ip: clientIp
    });

    // 5. Generate signed, tamper-proof Session Token
    const sessionToken = signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      tier: user.tier,
      role: user.role
    });

    // 6. Return response with HttpOnly secure cookie
    const response = NextResponse.json({
      success: true,
      message: isNew ? "Account created and developer key provisioned." : "Google Authentication verified.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        tier: user.tier,
        createdAt: user.createdAt
      },
      initialRawKey: initialKey || undefined // only returned once on initial signup
    });

    // Set hardened session cookie
    response.cookies.set({
      name: "hp_b2b_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    console.error("Google Auth API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Authentication Error: " + error.message },
      { status: 500 }
    );
  }
}
