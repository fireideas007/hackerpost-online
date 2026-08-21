import { NextResponse } from "next/server";
import { validateEditorPasscode, generateEditorToken, verifyEditorToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const { passcode } = body;

    if (!passcode || !validateEditorPasscode(passcode)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid Editor Passcode. Access denied." 
      }, { status: 401 });
    }

    const token = generateEditorToken();
    return NextResponse.json({
      success: true,
      token,
      message: "Newsroom Editor Authentication Successful."
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
