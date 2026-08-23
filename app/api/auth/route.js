import { NextResponse } from "next/server";
import { validateAdminCredentials, generateEditorToken, verifyEditorToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, password, passcode } = body;

    const authSecret = password || passcode;

    if (!authSecret || !validateAdminCredentials(username, authSecret)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid Administrator Credentials. Access denied." 
      }, { status: 401 });
    }

    const token = generateEditorToken(username || "admin");
    return NextResponse.json({
      success: true,
      token,
      message: "Administrator Authentication Successful. Security clearance granted."
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    const isAuthenticated = verifyEditorToken(token);
    return NextResponse.json({
      authenticated: isAuthenticated
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false });
  }
}
