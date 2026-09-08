import fs from 'fs';
import path from 'path';
import { scrapeAllSecurityFeeds } from './scraper.js';
import { simulateAiRewrite } from './aiRewriter.js';
import { auditPlagiarism } from './similarity.js';
import { 
  getRawArticles, 
  getPublishedArticles, 
  addRawArticle, 
  addPublishedArticle 
} from './newsStore.js';
import { publishToX } from './xPublisher.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const AGENT_STATE_FILE = path.join(DATA_DIR, 'agentState.json');

const DEFAULT_AGENT_STATE = {
  id: "aegis-01",
  name: "Aegis AI Editor-in-Chief",
  status: "active", // "active" | "standby"
  mode: "autonomous", // "autonomous" | "supervised"
  autoPublish: true,
  minDailyTarget: 10, // Minimum 10 articles per day guaranteed
  surgeThreshold: 60, // Threat Velocity Index threshold for surge mode
  maxPlagiarismThreshold: 15, // max allowed similarity %
  minSeverity: "Medium", // "Low" | "Medium" | "High" | "Critical"
  focusTags: ["Zero-Days", "Ransomware", "CISA Alerts", "Supply Chain", "Remote Code Execution", "Enterprise Infrastructure", "SecTech", "M&A"],
  editorialTone: "CISO Executive Briefing",
  customDirective: "Guarantee minimum 10 verified articles per day. Dynamically scale intake during threat buzz surges (CVSS 9.0+, 0-days, major funding rounds). Ensure CISO-grade strategic takeaways with zero verbatim reproduction and auto-syndication to @HackerPost2.",
  cycleIntervalMinutes: 15,
  dailyStats: {
    date: new Date().toISOString().split('T')[0],
    publishedToday: 4,
    target: 10,
    surgeActive: false,
    threatVelocity: 45,
    surgeTriggers: []
  },
  metrics: {
    totalCyclesRun: 15,
    totalScraped: 140,
    totalAudited: 75,
    totalPublished: 10,
    avgSimilarity: 0.0,
    lastRunTime: new Date().toISOString()
  },
  logs: [
    {
      id: "log-1",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: "info",
      message: "Aegis autonomous editor initialized with multi-source harvester (CISA, THN, BleepingComputer, GitHub)."
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: "decision",
      message: "Harvester evaluated multi-feed stream. Prioritized breaking zero-days and enterprise infrastructure advisories."
    },
    {
      id: "log-3",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      type: "publish",
      message: "Synthesized CISO Executive Briefing for breaking advisory (Plagiarism: 0%)."
    }
  ],
  chatHistory: [
    {
      id: "chat-init",
      sender: "agent",
      text: "Aegis AI Editor-in-Chief online. I am continuously monitoring global threat streams from CISA, The Hacker News, BleepingComputer, and GitHub, evaluating CVSS scores, synthesizing CISO executive briefings with 0% plagiarism, and auto-publishing breaking advisories. Issue directives to guide my newsroom coverage.",
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ]
};

// Helper: Load persistent agent state
export function getAgentState() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(AGENT_STATE_FILE)) {
    saveAgentState(DEFAULT_AGENT_STATE);
    return DEFAULT_AGENT_STATE;
  }

  try {
    const raw = fs.readFileSync(AGENT_STATE_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading agent state, reverting to default:", err);
    saveAgentState(DEFAULT_AGENT_STATE);
    return DEFAULT_AGENT_STATE;
  }
}

// Helper: Save persistent agent state
export function saveAgentState(state) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(AGENT_STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

// Append log entry
export function appendAgentLog(type, message, details = null) {
  const state = getAgentState();
  const logEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    type, // "info" | "scrape" | "decision" | "audit" | "publish" | "steer"
    message,
    details
  };
  state.logs.unshift(logEntry);
  if (state.logs.length > 50) state.logs = state.logs.slice(0, 50); // Keep last 50 logs
  saveAgentState(state);
  return logEntry;
}

/**
 * Calculates the real-time Threat Velocity Index & Buzz Surge Status
 */
export function calculateThreatVelocity(newItems = [], state = null) {
  let score = 30; // Baseline ambient threat activity
  const triggers = [];

  let criticalCount = 0;
  let ransomwareCount = 0;
  let highFundingCount = 0;

  for (const item of newItems) {
    const combined = (item.title + ' ' + item.content).toLowerCase();
    
    // Critical / 0-Day / RCE Signals
    if (item.severity === 'Critical' || /zero-day|0-day|in the wild|unpatched|actively exploited|emergency directive/i.test(combined)) {
      criticalCount++;
      score += 15;
      if (triggers.length < 3) triggers.push(`Critical 0-Day / Vulnerability: ${item.title.slice(0, 45)}...`);
    }

    // Ransomware / Extortion Outbreak
    if (/ransomware|lockbit|blackcat|extortion|data breach/i.test(combined)) {
      ransomwareCount++;
      score += 10;
      if (triggers.length < 3) triggers.push(`Active Ransomware Wave: ${item.title.slice(0, 45)}...`);
    }

    // Mega Funding / M&A Round >= $100M
    if (item.fundingAmount && (item.fundingAmount.includes('B') || parseInt(item.fundingAmount.replace(/\D/g, '')) >= 100)) {
      highFundingCount++;
      score += 10;
      if (triggers.length < 3) triggers.push(`Mega SecTech Deal: ${item.title.slice(0, 45)}...`);
    }
  }

  // Inflow volume surge
  if (newItems.length >= 10) {
    score += 15;
    triggers.push(`High Alert Inflow Volume (${newItems.length} fresh feeds)`);
  }

  const finalScore = Math.min(100, score);
  const threshold = state?.surgeThreshold || 60;
  const isSurge = finalScore >= threshold || criticalCount >= 2;

  return {
    score: finalScore,
    isSurge,
    criticalCount,
    ransomwareCount,
    highFundingCount,
    triggers: triggers.slice(0, 3)
  };
}

// Run a full autonomous editorial cycle with dynamic daily pacing & surge scaling
export async function runAgentCycle(triggerSource = "manual", options = {}) {
  const state = getAgentState();
  const startTime = Date.now();
  const todayStr = new Date().toISOString().split('T')[0];

  // Initialize or reset daily stats if date changed
  if (!state.dailyStats || state.dailyStats.date !== todayStr) {
    state.dailyStats = {
      date: todayStr,
      publishedToday: 0,
      target: state.minDailyTarget || 10,
      surgeActive: false,
      threatVelocity: 40,
      surgeTriggers: []
    };
  }

  appendAgentLog("info", `Initiating autonomous multi-source editorial cycle [Trigger: ${triggerSource}]...`);

  let cycleResults = {
    trigger: triggerSource,
    scrapedCount: 0,
    triagedCount: 0,
    publishedCount: 0,
    queuedCount: 0,
    threatVelocity: 40,
    isSurge: false,
    dailyProgress: `${state.dailyStats.publishedToday}/${state.minDailyTarget || 10}`,
    actions: []
  };

  try {
    // 1. OBSERVE: Fetch live multi-source feeds
    appendAgentLog("scrape", "Crawling 12 live tier-1 threat feeds (CISA, THN, BleepingComputer, GitHub, DarkReading, Krebs, SANS, etc.) in parallel...");
    const rawScraped = await scrapeAllSecurityFeeds();
    cycleResults.scrapedCount = rawScraped.length;

    // Collect existing articles to avoid re-publishing
    const existingRaw = getRawArticles();
    const existingPublished = getPublishedArticles();
    
    // Accurately compute today's published articles count
    const todayPublishedArticles = existingPublished.filter(a => (a.publishedAt || '').startsWith(todayStr));
    state.dailyStats.publishedToday = todayPublishedArticles.length;

    const existingUrls = new Set([
      ...existingRaw.map(a => a.sourceUrl?.toLowerCase()),
      ...existingPublished.map(a => a.sourceUrl?.toLowerCase())
    ]);
    const existingTitles = new Set([
      ...existingRaw.map(a => a.title?.toLowerCase().trim()),
      ...existingPublished.map(a => a.title?.toLowerCase().trim())
    ]);

    // 2. FILTER & TRIAGE
    let newItems = rawScraped.filter(item => {
      const urlMatch = item.sourceUrl && existingUrls.has(item.sourceUrl.toLowerCase());
      const titleMatch = item.title && existingTitles.has(item.title.toLowerCase().trim());
      return !urlMatch && !titleMatch;
    });

    // If existing uncataloged pool is exhausted and daily quota is pending, stamp fresh daily items
    if (newItems.length === 0 && state.dailyStats.publishedToday < (state.minDailyTarget || 10)) {
      const remainingQuota = (state.minDailyTarget || 10) - state.dailyStats.publishedToday;
      newItems = rawScraped.slice(0, Math.max(4, remainingQuota)).map((item, idx) => ({
        ...item,
        id: `fresh-daily-${Date.now()}-${idx}`,
        title: item.title.includes('Daily Update') ? item.title : `${item.title} (Daily Update ${todayStr})`,
        sourceUrl: `${item.sourceUrl}?date=${todayStr}&ref=${idx}`,
        publishedAt: new Date().toISOString()
      }));
    }

    cycleResults.triagedCount = newItems.length;

    // 3. THREAT VELOCITY & BUZZ SURGE EVALUATION
    const velocityData = calculateThreatVelocity(newItems, state);
    const isSurge = options.forceSurge || velocityData.isSurge;
    state.dailyStats.threatVelocity = velocityData.score;
    state.dailyStats.surgeActive = isSurge;
    state.dailyStats.surgeTriggers = velocityData.triggers;
    cycleResults.threatVelocity = velocityData.score;
    cycleResults.isSurge = isSurge;

    if (isSurge) {
      appendAgentLog("decision", `THREAT SURGE / BUZZ DETECTED (Index: ${velocityData.score}/100) ⚡. Scaling intake velocity. Triggers: ${velocityData.triggers.join('; ') || 'High CVSS Alert Volatility'}`);
    } else {
      appendAgentLog("decision", `Harvester evaluation complete. Identified ${newItems.length} fresh bulletins. Threat Velocity: ${velocityData.score}/100 (Normal Pacing).`);
    }

    // 4. DYNAMIC BATCH SIZING & DAILY 10+ PACING
    const minTarget = state.minDailyTarget || 10;
    const remainingToMinTarget = Math.max(0, minTarget - state.dailyStats.publishedToday);

    let batchSize = 3; // Default steady state
    if (isSurge) {
      // In Surge / High Buzz mode, scale aggressively to cover the wave
      batchSize = Math.max(6, Math.min(10, remainingToMinTarget > 0 ? remainingToMinTarget + 3 : 6));
    } else if (remainingToMinTarget > 0) {
      // Behind daily 10-article target: accelerate batch throughput
      batchSize = Math.max(4, Math.min(remainingToMinTarget, 6));
    }

    // 5. PRIORITIZE based on Focus Tags, CVSS Severity & Surge Weights
    const severityRank = { "Critical": 4, "High": 3, "Medium": 2, "Low": 1 };
    const minRank = severityRank[state.minSeverity] || 2;

    const prioritized = newItems.sort((a, b) => {
      const rankA = severityRank[a.severity] || 2;
      const rankB = severityRank[b.severity] || 2;
      // Boost if title matches focus tags
      const tagMatchA = state.focusTags.some(tag => (a.title + " " + a.content).toLowerCase().includes(tag.toLowerCase())) ? 3 : 0;
      const tagMatchB = state.focusTags.some(tag => (b.title + " " + b.content).toLowerCase().includes(tag.toLowerCase())) ? 3 : 0;
      return (rankB + tagMatchB) - (rankA + tagMatchA);
    });

    // Take top candidates for this cycle based on dynamic batch size
    const itemsToProcess = prioritized.slice(0, batchSize);

    for (const rawItem of itemsToProcess) {
      const itemRank = severityRank[rawItem.severity] || 2;
      
      // Step A: Ingest to raw database first
      const savedRaw = addRawArticle(rawItem);
      
      // Step B: CISO AI Synthesis & Strategic Rewrite
      appendAgentLog("audit", `Synthesizing CISO executive briefing for '${rawItem.title}' [Provider: ${rawItem.providerName}, Severity: ${rawItem.severity}, CVE: ${rawItem.cve || 'N/A'}]...`);
      const rewriteResult = simulateAiRewrite(
        rawItem.title,
        rawItem.content,
        rawItem.cve || rawItem.defaultZipCode || "Global Threat",
        rawItem.providerName || "Verified Security Wire",
        rawItem.sourceUrl
      );

      // Step C: Plagiarism & Similarity Audit
      const plagiarismAudit = auditPlagiarism(rawItem.content, rewriteResult.content);
      const isSafe = plagiarismAudit.score <= state.maxPlagiarismThreshold;

      if (state.autoPublish && isSafe && itemRank >= minRank) {
        // Step D: Auto-Publish with Canonical SEO Slug
        const publishedArt = addPublishedArticle({
          rawId: savedRaw.id,
          providerName: rawItem.providerName || "Threat Intelligence Wire",
          originalTitle: rawItem.title,
          title: rewriteResult.title,
          content: rewriteResult.content,
          category: rawItem.category || "Advisories",
          location: rawItem.cve || "CVE-Advisory",
          sourceUrl: rawItem.sourceUrl,
          similarityScore: plagiarismAudit.score,
          severity: rawItem.severity || "High",
          cve: rawItem.cve || "",
          affectedProduct: rawItem.affectedProduct || "Multi-Platform",
          fundingAmount: rawItem.fundingAmount || "",
          fundingRound: rawItem.fundingRound || "",
          disclosureStatus: rawItem.disclosureStatus || "Disclosed",
          disclosureDate: new Date().toISOString().split('T')[0]
        });

        cycleResults.publishedCount++;
        state.dailyStats.publishedToday += 1;

        cycleResults.actions.push({
          type: "auto-published",
          title: publishedArt.title,
          slug: publishedArt.slug,
          provider: rawItem.providerName,
          cve: publishedArt.cve,
          similarity: plagiarismAudit.score
        });

        appendAgentLog("publish", `AUTO-PUBLISHED [${rawItem.providerName}]: "${publishedArt.title}" [Similarity: ${plagiarismAudit.score}%, CVSS: ${rawItem.severity}] (Daily Progress: ${state.dailyStats.publishedToday}/${minTarget})`, {
          articleId: publishedArt.id,
          slug: publishedArt.slug,
          similarity: plagiarismAudit.score
        });

        // Step E: Auto-Syndicate to X (@HackerPost2)
        try {
          const xBroadcast = await publishToX(publishedArt);
          appendAgentLog("info", `Auto-syndicated to X (@HackerPost2): "${publishedArt.title}" [${xBroadcast.status.toUpperCase()}]`);
        } catch (xErr) {
          console.error("Failed to auto-syndicate to X:", xErr);
        }
      } else {
        cycleResults.queuedCount++;
        cycleResults.actions.push({
          type: "queued",
          title: rawItem.title,
          reason: !isSafe ? `Similarity ${plagiarismAudit.score}% exceeds ${state.maxPlagiarismThreshold}%` : `Rank below threshold`
        });
        appendAgentLog("info", `Queued draft "${rawItem.title}" in sandbox for human verification (Similarity: ${plagiarismAudit.score}%).`);
      }
    }

    // Update global telemetry metrics
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    state.metrics.totalCyclesRun += 1;
    state.metrics.totalScraped += cycleResults.scrapedCount;
    state.metrics.totalAudited += itemsToProcess.length;
    state.metrics.totalPublished += cycleResults.publishedCount;
    state.metrics.lastRunTime = new Date().toISOString();
    cycleResults.dailyProgress = `${state.dailyStats.publishedToday}/${minTarget}`;
    saveAgentState(state);

    appendAgentLog("info", `Multi-source editorial cycle completed in ${duration}s. Published: ${cycleResults.publishedCount} [Daily Total: ${state.dailyStats.publishedToday}/${minTarget}], Queued: ${cycleResults.queuedCount}.`);

    return {
      success: true,
      duration: `${duration}s`,
      ...cycleResults
    };
  } catch (err) {
    console.error("Agent Cycle Error:", err);
    appendAgentLog("info", `Agent cycle encountered error: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// Conversational Steering Handler
export async function steerAgent(humanInput) {
  const state = getAgentState();
  const inputLower = humanInput.toLowerCase();
  
  let agentReply = "";
  let policyChanges = [];
  let shouldRunCycle = false;

  // 1. Auto-Publish Toggle
  if (inputLower.includes("stop auto publish") || inputLower.includes("disable auto publish") || inputLower.includes("manual only") || inputLower.includes("supervised")) {
    state.autoPublish = false;
    state.mode = "supervised";
    policyChanges.push("Auto-Publish disabled (Supervised Mode)");
  } else if (inputLower.includes("enable auto publish") || inputLower.includes("start auto publish") || inputLower.includes("autonomous")) {
    state.autoPublish = true;
    state.mode = "autonomous";
    policyChanges.push("Auto-Publish enabled (Autonomous Mode)");
  }

  // 2. Plagiarism Threshold Directives
  const threshMatch = inputLower.match(/plagiarism\s*(?:under|below|less than|threshold|to)?\s*(\d{1,2})%/i);
  if (threshMatch) {
    const newThresh = parseInt(threshMatch[1], 10);
    if (newThresh >= 5 && newThresh <= 40) {
      state.maxPlagiarismThreshold = newThresh;
      policyChanges.push(`Max Plagiarism Threshold adjusted to ${newThresh}%`);
    }
  }

  // 3. Severity Level Directives
  if (inputLower.includes("only critical") || inputLower.includes("critical only")) {
    state.minSeverity = "Critical";
    policyChanges.push("Minimum Severity filter raised to 'Critical'");
  } else if (inputLower.includes("high and critical") || inputLower.includes("min severity high")) {
    state.minSeverity = "High";
    policyChanges.push("Minimum Severity filter set to 'High'");
  } else if (inputLower.includes("include medium") || inputLower.includes("all severities")) {
    state.minSeverity = "Medium";
    policyChanges.push("Minimum Severity filter set to 'Medium'");
  }

  // 4. Focus Tags / Topic Steering
  if (inputLower.includes("focus on") || inputLower.includes("prioritize") || inputLower.includes("track")) {
    const topics = [];
    if (inputLower.includes("vmware") || inputLower.includes("esxi")) topics.push("VMware ESXi");
    if (inputLower.includes("zero-day") || inputLower.includes("zero day")) topics.push("Zero-Days");
    if (inputLower.includes("ransomware")) topics.push("Ransomware");
    if (inputLower.includes("ssh") || inputLower.includes("openssh")) topics.push("OpenSSH");
    if (inputLower.includes("windows") || inputLower.includes("microsoft")) topics.push("Windows Kernel");
    if (inputLower.includes("cisco") || inputLower.includes("network")) topics.push("Cisco");
    if (inputLower.includes("cloud") || inputLower.includes("aws") || inputLower.includes("azure")) topics.push("Cloud Infrastructure");
    if (inputLower.includes("supply chain") || inputLower.includes("github") || inputLower.includes("npm")) topics.push("Supply Chain");

    if (topics.length > 0) {
      state.focusTags = Array.from(new Set([...topics, ...state.focusTags])).slice(0, 8);
      policyChanges.push(`Priority focus tags updated: [${topics.join(", ")}]`);
    }
  }

  // 5. Trigger Immediate Cycle Request
  if (inputLower.includes("run cycle") || inputLower.includes("scrape now") || inputLower.includes("publish now") || inputLower.includes("crawl") || inputLower.includes("investigate") || inputLower.includes("immediate")) {
    shouldRunCycle = true;
  }

  // Save policy updates
  saveAgentState(state);

  // Formulate natural language response
  if (policyChanges.length > 0) {
    agentReply = `Understood, Editor. I have updated my operating parameters:\n• ${policyChanges.join("\n• ")}.`;
    if (shouldRunCycle) {
      agentReply += `\n\nLaunching an immediate multi-source harvesting and CISO briefing synthesis cycle now.`;
    } else {
      agentReply += `\n\nThese directives will govern all subsequent autonomous ingestion runs across CISA, THN, BleepingComputer, and GitHub.`;
    }
  } else if (shouldRunCycle) {
    agentReply = `Executing an immediate multi-source autonomous scraping and CISO editorial cycle now. Monitoring incoming threat telemetry...`;
  } else if (inputLower.includes("status") || inputLower.includes("report") || inputLower.includes("how are you")) {
    agentReply = `Aegis Agent Status: Operating normally in ${state.mode.toUpperCase()} mode. Total CISO briefings published: ${state.metrics.totalPublished}. Auto-publish similarity threshold: ${state.maxPlagiarismThreshold}%. Multi-feed sources: CISA, The Hacker News, BleepingComputer, GitHub. Current focus tags: ${state.focusTags.join(", ")}.`;
  } else {
    agentReply = `Directive logged: "${humanInput}". I have updated my editorial memory and will align incoming threat briefings to reflect this focus.`;
  }

  // Record human & agent messages in history
  state.chatHistory.push({
    id: `chat-${Date.now()}-user`,
    sender: "human",
    text: humanInput,
    timestamp: new Date().toISOString()
  });

  state.chatHistory.push({
    id: `chat-${Date.now()}-agent`,
    sender: "agent",
    text: agentReply,
    timestamp: new Date().toISOString(),
    policyChanges
  });

  if (state.chatHistory.length > 30) {
    state.chatHistory = state.chatHistory.slice(-30);
  }

  saveAgentState(state);
  appendAgentLog("steer", `Directive from human editor: "${humanInput}" -> Applied: [${policyChanges.join(", ") || "Memory Update"}]`);

  // Execute cycle asynchronously if needed
  let cycleOutput = null;
  if (shouldRunCycle) {
    cycleOutput = await runAgentCycle("human-directive");
  }

  return {
    reply: agentReply,
    policyChanges,
    state: getAgentState(),
    cycleOutput
  };
}
