#!/usr/bin/env node

/**
 * Midnight Threat Feed & Advisory Legitimacy Screening Daemon
 * HackerPost.online Threat Intel Newsroom
 *
 * Scans security advisories and X.com posts daily at midnight (00:00:00)
 * to verify source authenticity, CVE validity, and quarantine disinformation/hoaxes.
 *
 * Usage:
 *   node scripts/midnight-feed-screener.mjs --once     (Run one screening pass immediately)
 *   node scripts/midnight-feed-screener.mjs --daemon   (Run continuously, executing daily at midnight)
 */

import { screenAllFeeds, getLegitimacyAuditReports } from '../lib/feedLegitimacyVerifier.js';

const isOnce = process.argv.includes('--once');
const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');

/**
 * Calculates milliseconds remaining until the upcoming 00:00:00 midnight
 */
function getMsUntilNextMidnight() {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0); // Sets time to 00:00:00 of tomorrow
  return nextMidnight.getTime() - now.getTime();
}

/**
 * Formats a duration in human-readable HH:MM:SS
 */
function formatTimeRemaining(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

/**
 * Executes a single screening pass and prints a structured report
 */
async function runMidnightScreening() {
  const timestamp = new Date().toISOString();
  console.log('\n' + '='.repeat(70));
  console.log(`[HackerPost Screener] Running Midnight Feed Legitimacy Scan`);
  console.log(`Timestamp: ${timestamp}`);
  console.log('='.repeat(70));

  try {
    const report = await screenAllFeeds();
    const { summary, quarantinedItems } = report;

    console.log('\n📊 SCREENING SUMMARY:');
    console.log(`- Total Feeds Evaluated: ${summary.totalScreened}`);
    console.log(`- Legitimate / Verified:  ${summary.legitimateCount} (Grade A)`);
    console.log(`- Plausible / Monitored: ${summary.plausibleCount} (Grade B)`);
    console.log(`- Suspicious Flagged:    ${summary.suspiciousCount} (Grade C - Quarantined)`);
    console.log(`- Malicious / Hoaxes:    ${summary.hoaxCount} (Grade F - Quarantined)`);
    console.log(`- Overall Average Score: ${summary.averageScore}/100`);
    console.log(`- Health Status:         ${summary.healthStatus}`);

    if (quarantinedItems.length > 0) {
      console.log('\n⚠️ QUARANTINED FEEDS:');
      quarantinedItems.forEach((item, idx) => {
        console.log(`  [${idx + 1}] [${item.verdict}] ${item.type === 'x_feed_post' ? item.handle : item.title}`);
        console.log(`      Score: ${item.legitimacyScore}/100 | Reasons: ${item.reasons.join('; ')}`);
      });
    } else {
      console.log('\n✅ Zero malicious or spoofed feeds detected. All active streams verified.');
    }

    console.log(`\nAudit log updated: data/feedLegitimacyAudit.json (Scan ID: ${report.scanId})`);
    console.log('='.repeat(70) + '\n');
    return report;
  } catch (err) {
    console.error('[HackerPost Screener] Error executing screening scan:', err);
    throw err;
  }
}

/**
 * Main Entrypoint
 */
async function main() {
  console.log('======================================================================');
  console.log('  🛡️ HackerPost Security Advisory & X.com Feed Legitimacy Screener');
  console.log('======================================================================');

  if (isOnce) {
    console.log('Mode: Immediate execution (--once)...');
    await runMidnightScreening();
    process.exit(0);
  }

  // Daemon mode: Schedule to run at upcoming midnight
  const msUntilMidnight = getMsUntilNextMidnight();
  const nextDate = new Date(Date.now() + msUntilMidnight);

  console.log(`Daemon active: Standby until upcoming midnight.`);
  console.log(`Next scan scheduled at: ${nextDate.toLocaleString()} (${formatTimeRemaining(msUntilMidnight)} remaining)`);
  console.log(`Press Ctrl+C to stop.`);

  let midnightTimer = setTimeout(async function triggerScan() {
    try {
      await runMidnightScreening();
    } catch (err) {
      console.error('Midnight scan error:', err);
    }

    // Schedule subsequent daily scan (in 24 hours)
    const nextMs = getMsUntilNextMidnight();
    console.log(`[HackerPost Screener] Next midnight scan scheduled in: ${formatTimeRemaining(nextMs)}`);
    midnightTimer = setTimeout(triggerScan, nextMs);
  }, msUntilMidnight);

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n[HackerPost Screener] Stopping daemon...');
    clearTimeout(midnightTimer);
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Fatal screener error:', err);
  process.exit(1);
});
