import { NextResponse } from "next/server";
import { screenAllFeeds, getLegitimacyAuditReports } from "@/lib/feedLegitimacyVerifier";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/legitimacy-scan
 * Executes or fetches the daily midnight threat feed legitimacy audit.
 * 
 * Query params:
 *   - run=true : Forces an immediate audit run
 *   - history=true : Returns past audit reports
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const forceRun = searchParams.get("run") === "true" || searchParams.get("execute") === "true";
    const getHistory = searchParams.get("history") === "true";

    if (getHistory) {
      const reports = getLegitimacyAuditReports();
      return NextResponse.json({
        success: true,
        count: reports.length,
        reports
      });
    }

    // Run the feed screening audit
    const report = await screenAllFeeds();

    return NextResponse.json({
      success: true,
      scanId: report.scanId,
      timestamp: report.timestamp,
      durationMs: report.durationMs,
      summary: report.summary,
      quarantinedCount: report.summary.quarantinedCount,
      quarantinedItems: report.quarantinedItems
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/legitimacy-scan
 * Used by webhooks / automated midnight crons
 */
export async function POST(req) {
  return GET(req);
}
