#!/usr/bin/env node

/**
 * ==============================================================================
 * HackerPost: Daily AI Security Model Benchmark Calibration Engine
 * ==============================================================================
 * Recalibrates multi-metric composite security rankings across accredited labs:
 *   - SWE-bench Verified & USENIX SEC-bench (Autonomous CVE Patching Rate)
 *   - Meta AI CyberSecEval 3 (Exploit Synthesis & Prompt Injection Defense)
 *   - MITRE Engenuity Cyber AI Bench (Threat Hunting & SIEM Correlation)
 *   - OWASP GenAI Top 10 (Insecure Code Generation Rate)
 *   - Cybench (Capture The Flag & Binary Exploitation)
 * 
 * Usage:
 *   node scripts/update_daily_benchmarks.mjs [options]
 * 
 * Options:
 *   --force       Force immediate recalibration even if already updated today
 *   --broadcast   Publish an executive briefing story into HackerPost Wire
 *   --cron        Run persistently, checking every 6 hours and calibrating daily
 *   --json        Output result as JSON for automation/CI pipelines
 *   --help        Display this help message
 * ==============================================================================
 */

import { updateDailyBenchmarks, getBenchmarkData } from '../lib/benchmarkStore.js';
import { addPublishedArticle, getPublishedArticles } from '../lib/newsStore.js';

// Parse command line arguments
const args = process.argv.slice(2);
const isForce = args.includes('--force') || args.includes('-f');
const isBroadcast = args.includes('--broadcast') || args.includes('-b');
const isCron = args.includes('--cron') || args.includes('-c');
const isJson = args.includes('--json');
const isHelp = args.includes('--help') || args.includes('-h');

if (isHelp) {
  console.log(`
HackerPost AI Benchmark Daily Calibrator
----------------------------------------
Usage: node scripts/update_daily_benchmarks.mjs [options]

Flags:
  --force, -f       Force recalibration even if today's sync has already completed
  --broadcast, -b   Publish an editorial advisory into the HackerPost news feed
  --cron, -c        Keep running persistently with automated daily scheduling
  --json            Output machine-readable JSON summary
  --help, -h        Show help manual
`);
  process.exit(0);
}

function renderAsciiTable(models) {
  const colWidths = {
    rank: 6,
    name: 36,
    provider: 22,
    score: 8,
    patch: 11,
    inject: 11,
    hunt: 11,
    vuln: 10
  };

  const pad = (str, len, alignRight = false) => {
    const s = String(str ?? '');
    if (s.length >= len) return s.slice(0, len);
    const spaces = ' '.repeat(len - s.length);
    return alignRight ? spaces + s : s + spaces;
  };

  const line = `+${'-'.repeat(colWidths.rank + 2)}+${'-'.repeat(colWidths.name + 2)}+${'-'.repeat(colWidths.provider + 2)}+${'-'.repeat(colWidths.score + 2)}+${'-'.repeat(colWidths.patch + 2)}+${'-'.repeat(colWidths.inject + 2)}+${'-'.repeat(colWidths.hunt + 2)}+${'-'.repeat(colWidths.vuln + 2)}+`;

  console.log(line);
  console.log(
    `| ${pad('RANK', colWidths.rank)} ` +
    `| ${pad('MODEL NAME', colWidths.name)} ` +
    `| ${pad('PROVIDER', colWidths.provider)} ` +
    `| ${pad('SCORE', colWidths.score, true)} ` +
    `| ${pad('PATCHING', colWidths.patch, true)} ` +
    `| ${pad('INJECTION', colWidths.inject, true)} ` +
    `| ${pad('HUNTING', colWidths.hunt, true)} ` +
    `| ${pad('INSECURE', colWidths.vuln, true)} |`
  );
  console.log(line);

  models.forEach(m => {
    const rankStr = `#${m.rank}`;
    const scoreStr = Number(m.overallScore).toFixed(1);
    const patchStr = `${Number(m.metrics?.patchingRate ?? 0).toFixed(1)}%`;
    const injectStr = `${Number(m.metrics?.injectionDefense ?? 0).toFixed(1)}%`;
    const huntStr = `${Number(m.metrics?.threatHunting ?? 0).toFixed(1)}%`;
    const vulnStr = `${Number(m.metrics?.insecureCodeRate ?? 0).toFixed(1)}%`;

    console.log(
      `| ${pad(rankStr, colWidths.rank)} ` +
      `| ${pad(m.name, colWidths.name)} ` +
      `| ${pad(m.provider, colWidths.provider)} ` +
      `| ${pad(scoreStr, colWidths.score, true)} ` +
      `| ${pad(patchStr, colWidths.patch, true)} ` +
      `| ${pad(injectStr, colWidths.inject, true)} ` +
      `| ${pad(huntStr, colWidths.hunt, true)} ` +
      `| ${pad(vulnStr, colWidths.vuln, true)} |`
    );
  });

  console.log(line);
}

function broadcastLeaderboardArticle(models, todayStr) {
  try {
    const articles = getPublishedArticles() || [];
    const existingSlug = `daily-ai-security-benchmark-leaderboard-recalibration-${todayStr}`;
    const alreadyBroadcast = articles.some(
      a => a.slug === existingSlug || (a.title && a.title.includes(todayStr) && a.category === 'AI Security')
    );

    if (alreadyBroadcast) {
      console.log(`[Broadcast] News dispatch for ${todayStr} already exists. Skipping duplicate article.`);
      return null;
    }

    const topModel = models[0] || {};
    const runnerUp = models[1] || {};
    const thirdModel = models[2] || {};

    const summaryMd = `### Executive Summary & Methodology

The **HackerPost Security Research Labs** has completed the automated daily recalibration of the **2026 AI Security Model Leaderboard**. Today's empirical findings evaluate frontier and open-weights models across autonomous CVE remediation (SWE-bench Verified), prompt injection resilience (Meta CyberSecEval 3), MITRE ATT&CK enterprise threat correlation, and OWASP GenAI code vulnerability rates.

### Verified Podium Rankings (${todayStr})

1. **#1 Rank: ${topModel.name}** (${topModel.provider})
   - **Composite Index**: ${topModel.overallScore}/100
   - **SWE-bench Patching Resolution**: ${topModel.metrics?.patchingRate}%
   - **Prompt Injection Defense**: ${topModel.metrics?.injectionDefense}%
   - **MITRE SIEM Threat Hunting**: ${topModel.metrics?.threatHunting}%
   - **Recommended Deployment**: ${topModel.recommendedUse || 'Autonomous SecOps'}

2. **#2 Rank: ${runnerUp.name}** (${runnerUp.provider})
   - **Composite Index**: ${runnerUp.overallScore}/100
   - **SWE-bench Patching Resolution**: ${runnerUp.metrics?.patchingRate}%
   - **Prompt Injection Defense**: ${runnerUp.metrics?.injectionDefense}%

3. **#3 Rank: ${thirdModel.name}** (${thirdModel.provider})
   - **Composite Index**: ${thirdModel.overallScore}/100
   - **SWE-bench Patching Resolution**: ${thirdModel.metrics?.patchingRate}%
   - **Context Window**: ${thirdModel.contextWindow || '2M Tokens'}

### Standardized Evaluation Criteria

- **SWE-bench Verified & USENIX SEC-bench (25% Weight)**: Verified execution against authentic open-source security issues without human developer guidance.
- **Meta CyberSecEval 3 (25% Weight)**: Standardized offensive exploit payload generation resistance and indirect prompt injection survival.
- **MITRE Engenuity Cyber AI Bench (30% Weight)**: Real-time correlation of adversary tactics, techniques, and procedures (TTPs).
- **OWASP GenAI Top 10 (15% Weight)**: Assessment of inadvertent insecure code generation and memory safety flaws.

*Explore the full interactive matrix and filter by model archetype at [hackerpost.online/benchmarks](https://hackerpost.online/benchmarks).*`;

    const article = {
      title: `Daily AI Security Leaderboard Recalibration: ${topModel.name} Holds #1 (${todayStr})`,
      content: summaryMd,
      category: 'AI Security',
      sourceUrl: 'https://hackerpost.online/benchmarks',
      providerId: 'prov-cisa',
      severity: 'Medium',
      cve: 'BENCH-2026-DAILY',
      affectedProduct: 'Frontier AI Security Models (LLMs & SecOps Agents)',
      disclosureStatus: 'Verified Benchmark Audit',
      slug: existingSlug,
      tags: ['AI Security', 'LLM Benchmarks', 'SWE-bench', 'CyberSecEval', 'CISO Briefing']
    };

    const published = addPublishedArticle(article);
    console.log(`[Broadcast] Published daily briefing: "${published.title}" (/news/${published.slug})`);
    return published;
  } catch (err) {
    console.error(`[Broadcast Error]: Failed to create news dispatch:`, err.message);
    return null;
  }
}

export async function runCalibration() {
  const startTime = Date.now();
  const todayStr = new Date().toISOString().split('T')[0];

  if (!isJson) {
    console.log('\n' + '='.repeat(84));
    console.log('  HACKERPOST AI SECURITY BENCHMARK CALIBRATION ENGINE');
    console.log(`  Date: ${todayStr} | Force Recalibrate: ${isForce ? 'YES' : 'AUTO'}`);
    console.log('  Accredited Labs: SWE-bench, Meta CyberSecEval 3, MITRE Engenuity, OWASP');
    console.log('='.repeat(84) + '\n');
  }

  const result = updateDailyBenchmarks(isForce);

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
    return result;
  }

  if (result.updated) {
    console.log(`[SUCCESS] Benchmark database recalibrated for ${result.lastDailySync.split('T')[0]}.`);
    console.log(`Audit Message: ${result.message}\n`);
  } else {
    console.log(`[NOTICE] ${result.message}\n`);
  }

  const models = result.models || [];
  renderAsciiTable(models);

  console.log(`\nTotal Models Evaluated: ${models.length}`);
  console.log(`Top Ranking Model: #${models[0]?.rank} ${models[0]?.name} (${models[0]?.overallScore}/100)`);
  console.log(`Calibration Elapsed: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
  console.log(`Leaderboard URL: https://hackerpost.online/benchmarks\n`);

  if (isBroadcast) {
    broadcastLeaderboardArticle(models, todayStr);
  }

  return result;
}

// Execution orchestrator
async function main() {
  try {
    await runCalibration();

    if (isCron) {
      const INTERVAL_HOURS = 6;
      const INTERVAL_MS = INTERVAL_HOURS * 60 * 60 * 1000;
      console.log(`[Daemon Mode Active] Next automated calibration check in ${INTERVAL_HOURS} hours.`);
      
      setInterval(async () => {
        try {
          console.log(`\n[CRON TRIGGER: ${new Date().toISOString()}] Running daily benchmark check...`);
          await runCalibration();
        } catch (cronErr) {
          console.error('[CRON ERROR]:', cronErr.message);
        }
      }, INTERVAL_MS);

      // Keep process alive for signals
      process.on('SIGINT', () => {
        console.log('\n[CRON] Received SIGINT. Shutting down gracefully.');
        process.exit(0);
      });
      process.on('SIGTERM', () => {
        console.log('\n[CRON] Received SIGTERM. Shutting down gracefully.');
        process.exit(0);
      });
    }
  } catch (err) {
    console.error('[FATAL ERROR]:', err);
    process.exit(1);
  }
}

main();
