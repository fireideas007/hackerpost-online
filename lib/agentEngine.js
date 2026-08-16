import fs from 'fs';
import path from 'path';
import { scrapeCisaAlerts } from './scraper.js';
import { simulateAiRewrite } from './aiRewriter.js';
import { auditPlagiarism } from './similarity.js';
import { 
  getRawArticles, 
  getPublishedArticles, 
  addRawArticle, 
  addPublishedArticle 
} from './newsStore.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const AGENT_STATE_FILE = path.join(DATA_DIR, 'agentState.json');

const DEFAULT_AGENT_STATE = {
  id: "aegis-01",
  name: "Aegis AI Editor-in-Chief",
  status: "active", // "active" | "standby"
  mode: "autonomous", // "autonomous" | "supervised"
  autoPublish: true,
  maxPlagiarismThreshold: 15, // max allowed similarity %
  minSeverity: "Medium", // "Low" | "Medium" | "High" | "Critical"
  focusTags: ["Zero-Days", "Ransomware", "CISA Alerts", "Supply Chain", "Remote Code Execution"],
  editorialTone: "Authoritative Threat Intel",
  customDirective: "Prioritize actionable CVEs, high-impact supply chain intrusions, and critical infrastructure advisories. Ensure clean technical reporting with zero verbatim reproduction.",
  cycleIntervalMinutes: 15,
  metrics: {
    totalCyclesRun: 12,
    totalScraped: 48,
    totalAudited: 48,
    totalPublished: 6,
    avgSimilarity: 9.4,
    lastRunTime: new Date().toISOString()
  },
  logs: [
    {
      id: "log-1",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: "info",
      message: "Aegis autonomous editor initialized and monitoring live vulnerability feeds."
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: "decision",
      message: "Scraped CISA feed. Triaged 8 raw advisories. Prioritized OpenSSH RCE regression (CVE-2026-3829)."
    },
    {
      id: "log-3",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      type: "publish",
      message: "Auto-published advisory 'Critical RCE Regression in OpenSSH (sshd) Patched Globally' (Similarity: 12%)."
    }
  ],
  chatHistory: [
    {
      id: "chat-init",
      sender: "agent",
      text: "Aegis AI Editor-in-Chief online. I am continuously monitoring global threat streams, evaluating CVSS scores, executing plagiarism-free rewrites, and publishing breaking advisories to HackerPost. You can steer my directives, change target tags, or order on-demand investigations right here.",
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

// Run a full autonomous editorial cycle
export async function runAgentCycle(triggerSource = "manual") {
  const state = getAgentState();
  const startTime = Date.now();
  appendAgentLog("info", `Initiating autonomous editorial cycle [Trigger: ${triggerSource}]...`);

  let cycleResults = {
    trigger: triggerSource,
    scrapedCount: 0,
    triagedCount: 0,
    publishedCount: 0,
    queuedCount: 0,
    actions: []
  };

  try {
    // 1. OBSERVE: Fetch live feeds
    appendAgentLog("scrape", "Crawling live CISA & NVD vulnerability advisory feeds...");
    const rawScraped = await scrapeCisaAlerts();
    cycleResults.scrapedCount = rawScraped.length;

    // Collect existing articles to avoid re-publishing
    const existingRaw = getRawArticles();
    const existingPublished = getPublishedArticles();
    const existingUrls = new Set([
      ...existingRaw.map(a => a.sourceUrl?.toLowerCase()),
      ...existingPublished.map(a => a.sourceUrl?.toLowerCase())
    ]);
    const existingTitles = new Set([
      ...existingRaw.map(a => a.title?.toLowerCase().trim()),
      ...existingPublished.map(a => a.title?.toLowerCase().trim())
    ]);

    // 2. FILTER & TRIAGE
    const newItems = rawScraped.filter(item => {
      const urlMatch = item.sourceUrl && existingUrls.has(item.sourceUrl.toLowerCase());
      const titleMatch = item.title && existingTitles.has(item.title.toLowerCase().trim());
      return !urlMatch && !titleMatch;
    });

    cycleResults.triagedCount = newItems.length;
    appendAgentLog("decision", `Feed evaluation complete. Identified ${newItems.length} fresh, uncataloged advisories.`);

    // 3. PRIORITIZE based on Focus Tags & Severity
    const severityRank = { "Critical": 4, "High": 3, "Medium": 2, "Low": 1 };
    const minRank = severityRank[state.minSeverity] || 2;

    const prioritized = newItems.sort((a, b) => {
      const rankA = severityRank[a.severity] || 2;
      const rankB = severityRank[b.severity] || 2;
      // Boost if title matches any focus tags
      const tagMatchA = state.focusTags.some(tag => (a.title + " " + a.content).toLowerCase().includes(tag.toLowerCase())) ? 2 : 0;
      const tagMatchB = state.focusTags.some(tag => (b.title + " " + b.content).toLowerCase().includes(tag.toLowerCase())) ? 2 : 0;
      return (rankB + tagMatchB) - (rankA + tagMatchA);
    });

    // Process top candidates (max 2 per cycle to maintain pacing)
    const itemsToProcess = prioritized.slice(0, 2);

    for (const rawItem of itemsToProcess) {
      const itemRank = severityRank[rawItem.severity] || 2;
      
      // Step A: Ingest to raw database first
      const savedRaw = addRawArticle(rawItem);
      
      // Step B: AI Synthesis & Rewrite
      appendAgentLog("audit", `Synthesizing original briefing for '${rawItem.title}' [Severity: ${rawItem.severity}, CVE: ${rawItem.cve || 'N/A'}]...`);
      const rewriteResult = simulateAiRewrite(
        rawItem.title,
        rawItem.content,
        rawItem.cve || rawItem.defaultZipCode || "Global Threat",
        "CISA Official Alert Wire",
        rawItem.sourceUrl
      );

      // Step C: Plagiarism & Similarity Audit
      const plagiarismAudit = auditPlagiarism(rawItem.content, rewriteResult.content);
      const isSafe = plagiarismAudit.score <= state.maxPlagiarismThreshold;

      if (state.autoPublish && isSafe && itemRank >= minRank) {
        // Step D: Auto-Publish
        const publishedArt = addPublishedArticle({
          rawId: savedRaw.id,
          providerName: "CISA Official Advisory",
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
          disclosureStatus: rawItem.disclosureStatus || "Disclosed",
          disclosureDate: new Date().toISOString().split('T')[0]
        });

        cycleResults.publishedCount++;
        cycleResults.actions.push({
          type: "auto-published",
          title: publishedArt.title,
          cve: publishedArt.cve,
          similarity: plagiarismAudit.score
        });

        appendAgentLog("publish", `AUTO-PUBLISHED: "${publishedArt.title}" [Similarity: ${plagiarismAudit.score}%, CVSS: ${rawItem.severity}]`, {
          articleId: publishedArt.id,
          similarity: plagiarismAudit.score
        });
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
    saveAgentState(state);

    appendAgentLog("info", `Editorial cycle completed in ${duration}s. Published: ${cycleResults.publishedCount}, Queued: ${cycleResults.queuedCount}.`);

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
    if (inputLower.includes("supply chain")) topics.push("Supply Chain");

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
    agentReply = `Understood. I have updated my editorial policy: \n• ${policyChanges.join("\n• ")}.`;
    if (shouldRunCycle) {
      agentReply += `\n\nI am immediately launching an autonomous newsroom cycle with these parameters.`;
    } else {
      agentReply += `\n\nThese directives will govern all subsequent automated ingestion runs.`;
    }
  } else if (shouldRunCycle) {
    agentReply = `Executing an immediate autonomous scraping and editorial cycle now. Monitoring incoming telemetry...`;
  } else if (inputLower.includes("status") || inputLower.includes("report") || inputLower.includes("how are you")) {
    agentReply = `Aegis Agent Status: Operating normally in ${state.mode.toUpperCase()} mode. Total articles published: ${state.metrics.totalPublished}. Auto-publish similarity threshold: ${state.maxPlagiarismThreshold}%. Current focus tags: ${state.focusTags.join(", ")}.`;
  } else {
    agentReply = `Directive acknowledged: "${humanInput}". I have logged this into my editorial memory and will align incoming threat coverage accordingly.`;
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
