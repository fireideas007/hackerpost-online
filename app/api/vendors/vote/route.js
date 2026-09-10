import { NextResponse } from "next/server";
import { castVendorVote } from "@/lib/vendorStore";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { vendorId, voteType, voterRole, voterOrg } = body;

    if (!vendorId) {
      return NextResponse.json(
        { success: false, message: "Vendor ID is required." },
        { status: 400 }
      );
    }

    const result = castVendorVote({
      vendorId,
      voteType: voteType || "up",
      voterRole: voterRole || "Enterprise Security Leader",
      voterOrg: voterOrg || "Verified Enterprise"
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("API /api/vendors/vote Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to record vote." },
      { status: 500 }
    );
  }
}
