#!/usr/bin/env node

/**
 * ==============================================================================
 * HackerPost: Autonomous Continuous Newsroom & Threat Telemetry Daemon
 * ==============================================================================
 * Continuously monitors global internet streams:
 *  - Cybersecurity Threat Feeds (CISA, THN, BleepingComputer, GitHub, SANS, ZDI)
 *  - Tech Startup & SecTech Wires (TechCrunch Startups, Venture & Funding, Hacker News)
 * 
 * Synthesizes CISO-grade executive briefings, audits originality,
 * and auto-publishes breaking intelligence around the clock.
 * ==============================================================================
 */

import { runAgentCycle, getAgentState } from '../lib/agentEngine.js';

const INTERVAL_MINUTES = parseInt(process.env.MONITOR_INTERVAL_MINUTES || '15', 10);
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

console.log('='.repeat(70));
console.log('  HACKERPOST AUTONOMOUS CONTINUOUS MONITOR DAEMON ONLINE');
console.log(`  Cycle Interval: Every ${INTERVAL_MINUTES} minutes`);
console.log('  Feeds: CISA, THN, BleepingComputer, GitHub API, TechCrunch Startups,');
console.log('         TechCrunch Funding, Dark Reading, Krebs, SANS, ZDI, Hacker News');
console.log('='.repeat(70));

let isRunning = false;
let cycleCounter = 0;

async function executeCycle() {
  if (isRunning) {
    console.log(`[${new Date().toISOString()}] Previous cycle still active, skipping tick.`);
    return;
  }

  isRunning = true;
  cycleCounter++;
  const cycleStart = Date.now();
  console.log(`\n>>> [Cycle #${cycleCounter}] Starting monitoring sweep at ${new Date().toISOString()}...`);

  try {
    const result = await runAgentCycle('autonomous-monitor-daemon');
    const duration = ((Date.now() - cycleStart) / 1000).toFixed(1);

    console.log(`<<< [Cycle #${cycleCounter} Complete in ${duration}s]`);
    console.log(`    Scraped: ${result.scrapedCount} | Triaged: ${result.triagedCount} | Published: ${result.publishedCount} | Threat Velocity: ${result.threatVelocity}/100`);

    if (result.actions && result.actions.length > 0) {
      console.log('    Published Stories:');
      result.actions.forEach(a => {
        console.log(`     * [${a.type}] ${a.title} (${a.provider || a.cve || 'Verified Wire'})`);
      });
    } else {
      console.log('    No new uncataloged stories required publication in this window.');
    }
  } catch (err) {
    console.error(`[Cycle #${cycleCounter} ERROR]:`, err.message);
  } finally {
    isRunning = false;
    console.log(`[Next automatic cycle scheduled in ${INTERVAL_MINUTES} minutes at ${new Date(Date.now() + INTERVAL_MS).toLocaleTimeString()}]`);
  }
}

// 1. Run initial cycle immediately
executeCycle();

// 2. Schedule recurring interval loop
const timer = setInterval(executeCycle, INTERVAL_MS);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Daemon] Received SIGINT, shutting down cleanly...');
  clearInterval(timer);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Daemon] Received SIGTERM, shutting down cleanly...');
  clearInterval(timer);
  process.exit(0);
});
