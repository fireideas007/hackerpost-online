import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const AUDIT_FILE = path.join(DATA_DIR, 'feedLegitimacyAudit.json');

/**
 * Authoritative security advisory domains & known trust ratings (0 - 100)
 */
export const TRUSTED_ADVISORY_DOMAINS = {
  // Tier 1: Governmental, Standard Bodies, & Primary Advisory Registries (95 - 100)
  'cisa.gov': 100,
  'nvd.nist.gov': 99,
  'github.com': 96,
  'cert.org': 98,
  'kb.cert.org': 98,
  'cve.org': 99,
  'mitre.org': 98,
  'bsi.bund.de': 96,
  'ncsc.gov.uk': 96,

  // Tier 2: Top-Tier Cybersecurity Intelligence Labs & Enterprise Vendors (85 - 94)
  'zerodayinitiative.com': 94,
  'isc.sans.edu': 93,
  'bleepingcomputer.com': 92,
  'thehackernews.com': 90,
  'krebsonsecurity.com': 92,
  'darkreading.com': 89,
  'securityweek.com': 88,
  'helpnetsecurity.com': 88,
  'crowdstrike.com': 93,
  'sentinelone.com': 92,
  'mandiant.com': 94,
  'unit42.paloaltonetworks.com': 93,
  'msrc.microsoft.com': 95,
  'sec.cloudapps.cisco.com': 93,
  'techcrunch.com': 86,
  'venturebeat.com': 85
};

/**
 * Verified, reputable X (Twitter) handles for cybersecurity threat intelligence
 */
export const TRUSTED_X_HANDLES = new Set([
  'cisagov',
  'campuscodi',
  'briankrebs',
  'vxunderground',
  'malwrhunterteam',
  'bleepincomputer',
  'thehackersnews',
  'sans_isc',
  'msftsecintel',
  'threatintel',
  'costinrai',
  'mikko',
  'taosecurity',
  'hackerpost2',
  'hackerpost'
]);

/**
 * High-risk / Disinformation / Hoax keywords and patterns
 */
const HOAX_RED_FLAGS = [
  /free\s+(0day|zero-day|exploit)\s+download/i,
  /click\s+here\s+to\s+(download|claim|patch)/i,
  /leaked\s+fbi\s+database\s+direct\s+link/i,
  /instant\s+rce\s+generator/i,
  /unlimited\s+bitcoin\s+exploit/i,
  /download\s+(patch|fix)\s+from\s+(t\.co|bit\.ly|tinyurl)/i,
  /critical\s+0day\s+in\s+everything/i
];

/**
 * Suspicious domain shorteners or unverified pastebin links often used in phishing / hoax drops
 */
const SUSPICIOUS_DOMAINS = [
  'bit.ly',
  'tinyurl.com',
  'is.gd',
  'cutt.ly',
  'anonfiles.com',
  'mega.nz',
  'mediafire.com',
  'discordapp.com/attachments',
  'drive.google.com/uc?'
];

/**
 * Helper: Extract hostname from URL
 */
function extractHostname(urlString) {
  if (!urlString) return '';
  try {
    const url = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
    return url.hostname.toLowerCase().replace(/^www\./, '');
  } catch (_) {
    return '';
  }
}

/**
 * Validates CVE format and temporal realism.
 * Formats: CVE-YYYY-NNNN+
 */
export function validateCve(cveString) {
  if (!cveString || typeof cveString !== 'string') {
    return { valid: false, cve: null, reason: 'Missing or non-string CVE' };
  }

  const normalized = cveString.trim().toUpperCase();
  const match = normalized.match(/^CVE-(1999|20[0-9]{2})-(\d{4,7})$/);

  if (!match) {
    return { valid: false, cve: normalized, reason: 'Invalid CVE syntax format' };
  }

  const year = parseInt(match[1], 10);
  const currentYear = new Date().getFullYear();

  // A CVE cannot have a year beyond next calendar year (buffer for early reservations)
  if (year > currentYear + 1) {
    return { valid: false, cve: normalized, reason: `Suspicious future year (${year}) in CVE identifier` };
  }

  if (year < 1999) {
    return { valid: false, cve: normalized, reason: `CVE year precedes CVE system inception (1999)` };
  }

  return { valid: true, cve: normalized, year, sequence: match[2] };
}

/**
 * Screens a Security Advisory for legitimacy.
 * Evaluates source domain authority, CVE validity, payload integrity, and sensationalism.
 * 
 * @param {Object} advisory - Advisory object with { id, title, content, sourceUrl, cve, severity, providerId }
 * @returns {Object} { legitimacyScore, verdict, quarantined, checks, reasons }
 */
export function verifyAdvisoryLegitimacy(advisory) {
  const checks = [];
  const reasons = [];
  let score = 50; // Starting neutral score

  const title = (advisory.title || '').trim();
  const content = (advisory.content || '').trim();
  const combinedText = `${title} ${content}`;
  const sourceUrl = advisory.sourceUrl || '';
  const hostname = extractHostname(sourceUrl);

  // 1. Domain Authority Check
  let domainTrust = 30; // default for unknown domain
  let matchedDomain = null;

  for (const [knownDomain, trustVal] of Object.entries(TRUSTED_ADVISORY_DOMAINS)) {
    if (hostname === knownDomain || hostname.endsWith(`.${knownDomain}`)) {
      domainTrust = trustVal;
      matchedDomain = knownDomain;
      break;
    }
  }

  if (domainTrust >= 90) {
    score += 35;
    checks.push({ check: 'domain_reputation', status: 'PASS', detail: `Authoritative domain verified (${matchedDomain || hostname}) - Trust: ${domainTrust}%` });
  } else if (domainTrust >= 75) {
    score += 20;
    checks.push({ check: 'domain_reputation', status: 'PASS', detail: `Recognized industry source (${matchedDomain || hostname}) - Trust: ${domainTrust}%` });
  } else if (hostname.endsWith('.gov') || hostname.endsWith('.mil') || hostname.endsWith('.edu')) {
    score += 25;
    checks.push({ check: 'domain_reputation', status: 'PASS', detail: `Authoritative TLD (.gov/.mil/.edu) verified` });
  } else if (!hostname) {
    score -= 25;
    reasons.push('Advisory missing verifiable canonical source URL');
    checks.push({ check: 'domain_reputation', status: 'FAIL', detail: 'Missing source domain' });
  } else {
    score -= 10;
    checks.push({ check: 'domain_reputation', status: 'WARN', detail: `Unverified / unknown source domain (${hostname})` });
  }

  // 2. Suspicious Redirect or Malicious Storage Drop Check
  for (const sus of SUSPICIOUS_DOMAINS) {
    if (sourceUrl.includes(sus) || combinedText.includes(sus)) {
      score -= 40;
      reasons.push(`Contains suspicious file host or link shortener: ${sus}`);
      checks.push({ check: 'link_safety', status: 'FAIL', detail: `Suspicious domain detected: ${sus}` });
      break;
    }
  }

  // 3. CVE Validation Check
  if (advisory.cve) {
    const cveValidation = validateCve(advisory.cve);
    if (cveValidation.valid) {
      score += 15;
      checks.push({ check: 'cve_syntax', status: 'PASS', detail: `Validated standard CVE format: ${cveValidation.cve}` });
    } else {
      score -= 30;
      reasons.push(`Hallucinated or invalid CVE format: ${advisory.cve} (${cveValidation.reason})`);
      checks.push({ check: 'cve_syntax', status: 'FAIL', detail: cveValidation.reason });
    }
  } else {
    // Non-CVE advisories (e.g. general threat report, M&A, breach)
    checks.push({ check: 'cve_syntax', status: 'INFO', detail: 'No CVE attached (informational or business threat advisory)' });
  }

  // 4. Hoax / Clickbait Red Flag Detection
  let foundHoax = false;
  for (const pattern of HOAX_RED_FLAGS) {
    if (pattern.test(combinedText)) {
      score -= 45;
      foundHoax = true;
      const snippet = combinedText.match(pattern)?.[0] || 'Pattern match';
      reasons.push(`Detected hoax / phishing indicator: "${snippet}"`);
      checks.push({ check: 'disinformation_filter', status: 'FAIL', detail: `Hoax indicator flagged: "${snippet}"` });
      break;
    }
  }
  if (!foundHoax) {
    checks.push({ check: 'disinformation_filter', status: 'PASS', detail: 'Zero hoax or social engineering patterns detected' });
  }

  // 5. Technical Context & Substance Check
  if (content.length < 60) {
    score -= 20;
    reasons.push('Content length too short to constitute a substantive advisory');
    checks.push({ check: 'content_depth', status: 'WARN', detail: `Superficial content length (${content.length} chars)` });
  } else {
    score += 5;
    checks.push({ check: 'content_depth', status: 'PASS', detail: `Substantive technical content (${content.length} chars)` });
  }

  // Clamp score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, score));

  // Determine Verdict
  let verdict = 'SUSPICIOUS';
  let quarantined = false;

  if (finalScore >= 80) {
    verdict = 'LEGITIMATE';
    quarantined = false;
  } else if (finalScore >= 55) {
    verdict = 'PLAUSIBLE_UNVERIFIED';
    quarantined = false; // allowed with flag
  } else if (finalScore >= 30) {
    verdict = 'SUSPICIOUS';
    quarantined = true;
  } else {
    verdict = 'MALICIOUS_OR_HOAX';
    quarantined = true;
  }

  return {
    id: advisory.id || `adv_${Date.now()}`,
    type: 'security_advisory',
    title: title || 'Untitled Advisory',
    sourceUrl,
    cve: advisory.cve || null,
    legitimacyScore: finalScore,
    verdict,
    quarantined,
    checks,
    reasons,
    scannedAt: new Date().toISOString()
  };
}

/**
 * Screens an X.com (Twitter) threat post or syndication log for legitimacy.
 * Checks handle reputation, anti-impersonation heuristics, link safety, and claims.
 * 
 * @param {Object} post - Object with { handle, tweetText, articleUrl, tweetUrl }
 * @returns {Object} { legitimacyScore, verdict, quarantined, checks, reasons }
 */
export function verifyXPostLegitimacy(post) {
  const checks = [];
  const reasons = [];
  let score = 50; // Starting baseline

  const rawHandle = (post.handle || '').replace('@', '').toLowerCase().trim();
  const tweetText = (post.tweetText || post.text || '').trim();
  const externalUrl = post.articleUrl || post.url || '';

  // 1. Author Handle Reputation & Whitelist Check
  if (TRUSTED_X_HANDLES.has(rawHandle)) {
    score += 35;
    checks.push({ check: 'author_reputation', status: 'PASS', detail: `Verified threat intelligence handle (@${rawHandle})` });
  } else if (rawHandle) {
    // Check for obvious impersonation/typosquatting (e.g. duplicate underscores, numbers substituting letters)
    const isTyposquat = /(_.*_|\d{3,}|official.*real|cisa.*alert)/i.test(rawHandle);
    if (isTyposquat) {
      score -= 30;
      reasons.push(`Handle @${rawHandle} matches impersonation / typosquat pattern`);
      checks.push({ check: 'author_reputation', status: 'FAIL', detail: `Suspected typosquat / clone account (@${rawHandle})` });
    } else {
      checks.push({ check: 'author_reputation', status: 'WARN', detail: `Unverified community handle (@${rawHandle})` });
    }
  } else {
    score -= 20;
    reasons.push('X feed entry missing author handle');
    checks.push({ check: 'author_reputation', status: 'FAIL', detail: 'Missing author handle' });
  }

  // 2. Embedded URL Safety
  const hostname = extractHostname(externalUrl);
  let isMaliciousHost = false;
  for (const sus of SUSPICIOUS_DOMAINS) {
    if (externalUrl.includes(sus) || tweetText.includes(sus)) {
      score -= 40;
      isMaliciousHost = true;
      reasons.push(`X post contains suspicious or malicious link: ${sus}`);
      checks.push({ check: 'link_safety', status: 'FAIL', detail: `Unsafe domain: ${sus}` });
      break;
    }
  }
  if (!isMaliciousHost) {
    if (hostname && (TRUSTED_ADVISORY_DOMAINS[hostname] || hostname.includes('hackerpost.online'))) {
      score += 15;
      checks.push({ check: 'link_safety', status: 'PASS', detail: `Target link verified (${hostname})` });
    } else {
      checks.push({ check: 'link_safety', status: 'INFO', detail: 'External link present without red flags' });
    }
  }

  // 3. Detect CVE Reference in Tweet
  const cveMatch = tweetText.match(/CVE-(1999|20[0-9]{2})-\d{4,7}/i);
  if (cveMatch) {
    const cveVal = validateCve(cveMatch[0]);
    if (cveVal.valid) {
      score += 10;
      checks.push({ check: 'cve_reference', status: 'PASS', detail: `Valid CVE cited: ${cveVal.cve}` });
    } else {
      score -= 25;
      reasons.push(`Suspicious/invalid CVE reference: ${cveMatch[0]}`);
      checks.push({ check: 'cve_reference', status: 'FAIL', detail: cveVal.reason });
    }
  }

  // 4. Clickbait / Scam / Hoax Detection
  let foundHoax = false;
  for (const pattern of HOAX_RED_FLAGS) {
    if (pattern.test(tweetText)) {
      score -= 40;
      foundHoax = true;
      const matched = tweetText.match(pattern)?.[0] || 'Hoax pattern';
      reasons.push(`X post contains high-risk sensationalism: "${matched}"`);
      checks.push({ check: 'disinformation_filter', status: 'FAIL', detail: `Flagged pattern: "${matched}"` });
      break;
    }
  }
  if (!foundHoax) {
    checks.push({ check: 'disinformation_filter', status: 'PASS', detail: 'Text passes disinformation and hoax filters' });
  }

  // 5. Length & Structure Sanity
  if (tweetText.length < 20) {
    score -= 15;
    reasons.push('Post content too brief for verified threat advisory');
    checks.push({ check: 'structure_sanity', status: 'WARN', detail: 'Excessively brief message' });
  } else {
    checks.push({ check: 'structure_sanity', status: 'PASS', detail: `Compliant X post structure (${tweetText.length} chars)` });
  }

  const finalScore = Math.max(0, Math.min(100, score));

  let verdict = 'SUSPICIOUS';
  let quarantined = false;

  if (finalScore >= 75) {
    verdict = 'LEGITIMATE';
    quarantined = false;
  } else if (finalScore >= 50) {
    verdict = 'PLAUSIBLE_UNVERIFIED';
    quarantined = false;
  } else if (finalScore >= 25) {
    verdict = 'SUSPICIOUS';
    quarantined = true;
  } else {
    verdict = 'MALICIOUS_OR_HOAX';
    quarantined = true;
  }

  return {
    id: post.id || `x_${Date.now()}`,
    type: 'x_feed_post',
    handle: `@${rawHandle}`,
    tweetText: tweetText.slice(0, 140) + (tweetText.length > 140 ? '...' : ''),
    externalUrl,
    legitimacyScore: finalScore,
    verdict,
    quarantined,
    checks,
    reasons,
    scannedAt: new Date().toISOString()
  };
}

/**
 * Loads persistent Feed Legitimacy Audit Reports
 */
export function getLegitimacyAuditReports() {
  if (!fs.existsSync(DATA_DIR)) {
    try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (_) {}
  }

  if (!fs.existsSync(AUDIT_FILE)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(AUDIT_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

/**
 * Saves a new Feed Legitimacy Audit Report to persistent disk
 */
export function saveLegitimacyAudit(report) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const reports = getLegitimacyAuditReports();
    reports.unshift(report);
    // Keep last 30 daily audit cycles
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(reports.slice(0, 30), null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save feed legitimacy audit:', err);
  }
}

/**
 * Screens all security advisories and X.com posts currently in the database.
 * 
 * @param {Object} options - { additionalAdvisories, additionalXPosts }
 * @returns {Object} Comprehensive screening report
 */
export async function screenAllFeeds(options = {}) {
  const startTime = Date.now();
  const screenedAdvisories = [];
  const screenedXPosts = [];

  // 1. Gather raw security advisories from db.json
  const DB_FILE = path.join(DATA_DIR, 'db.json');
  let rawArticles = [];
  if (fs.existsSync(DB_FILE)) {
    try {
      const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      rawArticles = db.rawArticles || [];
    } catch (_) {}
  }

  if (options.additionalAdvisories && Array.isArray(options.additionalAdvisories)) {
    rawArticles = [...options.additionalAdvisories, ...rawArticles];
  }

  for (const article of rawArticles) {
    const result = verifyAdvisoryLegitimacy(article);
    screenedAdvisories.push(result);
  }

  // 2. Gather X posts from socialLogs.json
  const SOCIAL_FILE = path.join(DATA_DIR, 'socialLogs.json');
  let socialLogs = [];
  if (fs.existsSync(SOCIAL_FILE)) {
    try {
      socialLogs = JSON.parse(fs.readFileSync(SOCIAL_FILE, 'utf-8'));
    } catch (_) {}
  }

  if (options.additionalXPosts && Array.isArray(options.additionalXPosts)) {
    socialLogs = [...options.additionalXPosts, ...socialLogs];
  }

  for (const post of socialLogs) {
    const result = verifyXPostLegitimacy(post);
    screenedXPosts.push(result);
  }

  const allResults = [...screenedAdvisories, ...screenedXPosts];
  const legitimateCount = allResults.filter(r => r.verdict === 'LEGITIMATE').length;
  const plausibleCount = allResults.filter(r => r.verdict === 'PLAUSIBLE_UNVERIFIED').length;
  const suspiciousCount = allResults.filter(r => r.verdict === 'SUSPICIOUS').length;
  const hoaxCount = allResults.filter(r => r.verdict === 'MALICIOUS_OR_HOAX').length;
  const quarantinedCount = allResults.filter(r => r.quarantined).length;

  const totalScreened = allResults.length;
  const averageScore = totalScreened > 0
    ? Math.round(allResults.reduce((acc, curr) => acc + curr.legitimacyScore, 0) / totalScreened)
    : 100;

  const auditReport = {
    scanId: `scan_midnight_${Date.now()}`,
    timestamp: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    summary: {
      totalScreened,
      legitimateCount,
      plausibleCount,
      suspiciousCount,
      hoaxCount,
      quarantinedCount,
      averageScore,
      healthStatus: quarantinedCount === 0 ? 'CLEAN' : (hoaxCount > 0 ? 'THREATS_QUARANTINED' : 'ANOMALIES_DETECTED')
    },
    quarantinedItems: allResults.filter(r => r.quarantined),
    advisories: screenedAdvisories,
    xPosts: screenedXPosts
  };

  saveLegitimacyAudit(auditReport);

  return auditReport;
}
