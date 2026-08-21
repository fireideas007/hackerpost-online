/**
 * Multi-Source Cybersecurity & Venture Intelligence Harvester.
 * Gathers breaking zero-days, enterprise breaches, startup launches, VC funding,
 * and M&A deals from CISA, TechCrunch Security, SecurityWeek M&A, VentureBeat,
 * The Hacker News, BleepingComputer, and GitHub Security Advisories.
 */

const FEED_SOURCES = [
  {
    id: "prov-techcrunch",
    name: "TechCrunch Security",
    url: "https://techcrunch.com/category/security/feed/",
    type: "rss"
  },
  {
    id: "prov-securityweek-ma",
    name: "SecurityWeek M&A & Funding",
    url: "https://www.securityweek.com/category/mergers-acquisitions/feed/",
    type: "rss"
  },
  {
    id: "prov-venturebeat",
    name: "VentureBeat Enterprise Security",
    url: "https://venturebeat.com/category/security/feed/",
    type: "rss"
  },
  {
    id: "prov-cisa",
    name: "CISA Official Advisory Wire",
    url: "https://www.cisa.gov/cybersecurity-advisories/all.xml",
    type: "rss"
  },
  {
    id: "prov-thn",
    name: "The Hacker News (THN)",
    url: "https://thehackernews.com/feeds/posts/default?alt=rss",
    type: "rss"
  },
  {
    id: "prov-bleepingcomputer",
    name: "BleepingComputer Threat Feed",
    url: "https://www.bleepingcomputer.com/feed/",
    type: "rss"
  },
  {
    id: "prov-github",
    name: "GitHub Security Advisories",
    url: "https://github.com/advisories.atom",
    type: "atom"
  }
];

// Helper to decode basic XML / HTML entities and clean HTML tags
function cleanText(str) {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1") // Strip CDATA
    .replace(/<[^>]*>/g, " ") // Strip nested html tags
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts key metadata (CVE, Startup Name, Funding, Severity, Category) from text.
 */
function extractThreatMetadata(title, description, feedId) {
  const combined = (title + " " + description).trim();

  // 1. Check for Startup, Funding, & M&A Signals
  const isFunding = /raises\s*\$|funding|series\s*[a-e]|seed\s*round|secures\s*\$|valuation|invests\s*\$|venture\s*capital/i.test(combined);
  const isAcquisition = /acquires|acquisition|buys|merger|bought\s*by|takes\s*over/i.test(combined);
  const isStartupLaunch = /stealth|emerges\s*from\s*stealth|launches|startup|founded\s*by/i.test(combined);

  // Extract Funding Amount ($15M, $100 Million, etc.)
  const fundingMatch = combined.match(/\$(\d+(\.\d+)?)\s*(million|m|billion|b)?/i);
  const fundingAmount = fundingMatch ? fundingMatch[0] : "";

  // Extract Funding Round
  let fundingRound = "";
  if (/seed/i.test(combined)) fundingRound = "Seed";
  else if (/series\s*a/i.test(combined)) fundingRound = "Series A";
  else if (/series\s*b/i.test(combined)) fundingRound = "Series B";
  else if (/series\s*c/i.test(combined)) fundingRound = "Series C";
  else if (/growth/i.test(combined)) fundingRound = "Growth Round";
  else if (isAcquisition) fundingRound = "M&A Acquisition";
  else if (isStartupLaunch) fundingRound = "Stealth Launch";

  // 2. Detect CVE Identifiers
  const cveMatch = combined.match(/CVE-\d{4}-\d{4,7}/i);
  const cve = cveMatch ? cveMatch[0].toUpperCase() : "";

  // 3. Detect Enterprise Vendor / Startup Product
  const vendorMatch = combined.match(/(Wiz|Snyk|CrowdStrike|Palo Alto|SentinelOne|Zscaler|Fortinet|Cisco|Microsoft|Ivanti|VMware|ESXi|Apple|Google|Linux|Siemens|Apache|OpenSSH|Citrix|Juniper|SolarWinds|Okta|Salesforce|Kubernetes|Docker|Cyera|Island|Vanta|Drata|Abnormal Security|Claroty|Axonius)/i);
  const affectedProduct = vendorMatch ? vendorMatch[0] : (cve ? "Enterprise Systems" : (isFunding || isAcquisition ? "SecTech Startup" : "Multi-Platform"));

  // 4. Categorization
  let category = "Advisories";
  if (isAcquisition) {
    category = "M&A & Funding";
  } else if (isFunding || isStartupLaunch || feedId === "prov-techcrunch" || feedId === "prov-securityweek-ma" || feedId === "prov-venturebeat") {
    category = "SecTech & Startups";
  } else if (/zero-day|0-day|unpatched|in the wild|actively exploited/i.test(combined)) {
    category = "Zero-Days";
  } else if (/ransomware|lockbit|blackcat|gunra|extortion|ransom/i.test(combined)) {
    category = "Ransomware";
  } else if (/leak|breach|exfiltrat|stolen data|database dump/i.test(combined)) {
    category = "Data Breaches";
  } else if (/supply chain|npm|pypi|github|package|dependency|backdoor/i.test(combined) || feedId === "prov-github") {
    category = "Supply Chain";
  } else if (/exploit|poc|remote code execution|rce/i.test(combined)) {
    category = "Exploits";
  }

  // 5. Severity Assessment (For Startups, we assign High/Medium impact based on funding)
  let severity = "Medium";
  if (isFunding || isAcquisition) {
    severity = fundingMatch && (fundingMatch[0].includes("b") || parseInt(fundingMatch[1]) > 50) ? "Critical" : "High";
  } else if (/critical|cvss 9|cvss 10|active exploitation|remote code execution|rce|zero-day/i.test(combined)) {
    severity = "Critical";
  } else if (/high|cvss 7|cvss 8|privilege escalation|authentication bypass/i.test(combined)) {
    severity = "High";
  } else if (/low|informational/i.test(combined)) {
    severity = "Low";
  }

  return { 
    cve, 
    affectedProduct, 
    category, 
    severity,
    fundingAmount,
    fundingRound,
    isStartupStory: isFunding || isAcquisition || isStartupLaunch
  };
}

/**
 * Scrapes an RSS 2.0 XML feed.
 */
async function parseRssFeed(source) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000); // 7s timeout

    const res = await fetch(source.url, {
      headers: {
        "User-Agent": "HackerPost-SecTech-Newsroom/2.0 (+https://hackerpost.online)"
      },
      signal: controller.signal,
      next: { revalidate: 60 }
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const xmlText = await res.text();

    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items = [];
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1];

      const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
      const title = titleMatch ? cleanText(titleMatch[1]) : "";

      const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
      const link = linkMatch ? linkMatch[1].trim() : "";

      const descMatch = itemContent.match(/<description>([\s\S]*?)<\/description>/);
      const description = descMatch ? cleanText(descMatch[1]) : "";

      const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const pubDateString = pubDateMatch ? pubDateMatch[1].trim() : new Date().toUTCString();
      const publishedAt = new Date(pubDateString).toISOString();

      if (!title) continue;

      const meta = extractThreatMetadata(title, description, source.id);

      items.push({
        providerId: source.id,
        providerName: source.name,
        title,
        content: description || title,
        publishedAt,
        sourceUrl: link,
        category: meta.category,
        defaultZipCode: meta.cve || (meta.isStartupStory ? "SecTech" : "Threat-Wire"),
        severity: meta.severity,
        cve: meta.cve,
        affectedProduct: meta.affectedProduct,
        fundingAmount: meta.fundingAmount,
        fundingRound: meta.fundingRound,
        disclosureStatus: meta.isStartupStory ? (meta.fundingRound || "Funded") : "Disclosed"
      });
    }

    return items;
  } catch (err) {
    console.error(`Error scraping ${source.name}:`, err.message);
    return [];
  }
}

/**
 * Scrapes an Atom 1.0 XML feed (e.g., GitHub Security Advisories).
 */
async function parseAtomFeed(source) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(source.url, {
      headers: {
        "User-Agent": "HackerPost-SecTech-Newsroom/2.0 (+https://hackerpost.online)"
      },
      signal: controller.signal,
      next: { revalidate: 60 }
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const xmlText = await res.text();

    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const items = [];
    let match;

    while ((match = entryRegex.exec(xmlText)) !== null) {
      const entryContent = match[1];

      const titleMatch = entryContent.match(/<title[^>]*>([\s\S]*?)<\/title>/);
      const title = titleMatch ? cleanText(titleMatch[1]) : "";

      const linkMatch = entryContent.match(/<link[^>]*href="([^"]*)"/);
      const link = linkMatch ? linkMatch[1].trim() : "";

      const summaryMatch = entryContent.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) || entryContent.match(/<content[^>]*>([\s\S]*?)<\/content>/);
      const description = summaryMatch ? cleanText(summaryMatch[1]) : "";

      const updatedMatch = entryContent.match(/<updated>([\s\S]*?)<\/updated>/);
      const pubDateString = updatedMatch ? updatedMatch[1].trim() : new Date().toUTCString();
      const publishedAt = new Date(pubDateString).toISOString();

      if (!title) continue;

      const meta = extractThreatMetadata(title, description, source.id);

      items.push({
        providerId: source.id,
        providerName: source.name,
        title,
        content: description || title,
        publishedAt,
        sourceUrl: link,
        category: meta.category,
        defaultZipCode: meta.cve || "Supply-Chain",
        severity: meta.severity,
        cve: meta.cve,
        affectedProduct: meta.affectedProduct,
        fundingAmount: meta.fundingAmount,
        fundingRound: meta.fundingRound,
        disclosureStatus: "Disclosed"
      });
    }

    return items;
  } catch (err) {
    console.error(`Error scraping ${source.name}:`, err.message);
    return [];
  }
}

/**
 * Master multi-feed aggregator.
 * Queries TechCrunch, SecurityWeek M&A, VentureBeat, CISA, THN, BleepingComputer, and GitHub in parallel.
 */
export async function scrapeAllSecurityFeeds() {
  const promises = FEED_SOURCES.map(source => {
    if (source.type === "atom") {
      return parseAtomFeed(source);
    }
    return parseRssFeed(source);
  });

  const results = await Promise.allSettled(promises);
  let aggregated = [];

  for (const result of results) {
    if (result.status === "fulfilled" && Array.isArray(result.value)) {
      aggregated = aggregated.concat(result.value);
    }
  }

  // Deduplicate items by sourceUrl and title
  const seenUrls = new Set();
  const uniqueItems = [];

  for (const item of aggregated) {
    const key = (item.sourceUrl || item.title).toLowerCase().trim();
    if (!seenUrls.has(key)) {
      seenUrls.add(key);
      uniqueItems.push(item);
    }
  }

  // Sort newest first
  return uniqueItems.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

// Backward compatibility export
export async function scrapeCisaAlerts() {
  return scrapeAllSecurityFeeds();
}
