/**
 * Multi-Source Cybersecurity Threat Intelligence Harvester.
 * Gathers breaking zero-days, ransomware campaigns, supply chain exploits,
 * and government security bulletins from CISA, The Hacker News, BleepingComputer,
 * and GitHub Security Advisories.
 */

const FEED_SOURCES = [
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
 * Extracts key metadata (CVE, Vendor, Severity, Category) from text.
 */
function extractThreatMetadata(title, description, feedId) {
  const combined = (title + " " + description).trim();

  // 1. Detect CVE Identifiers
  const cveMatch = combined.match(/CVE-\d{4}-\d{4,7}/i);
  const cve = cveMatch ? cveMatch[0].toUpperCase() : "";

  // 2. Detect Enterprise Vendor / Affected Product
  const vendorMatch = combined.match(/(Cisco|Microsoft|Ivanti|VMware|ESXi|Apple|Google|Linux|Fortinet|Palo Alto|Siemens|Apache|OpenSSH|Citrix|Juniper|SolarWinds|CrowdStrike|Okta|Salesforce|Kubernetes|Docker)/i);
  const affectedProduct = vendorMatch ? vendorMatch[0] : (cve ? "Enterprise Systems" : "Multi-Platform");

  // 3. Categorization
  let category = "Advisories";
  if (/zero-day|0-day|unpatched|in the wild|actively exploited/i.test(combined)) {
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

  // 4. Severity Assessment
  let severity = "Medium";
  if (/critical|cvss 9|cvss 10|active exploitation|remote code execution|rce|zero-day/i.test(combined)) {
    severity = "Critical";
  } else if (/high|cvss 7|cvss 8|privilege escalation|authentication bypass/i.test(combined)) {
    severity = "High";
  } else if (/low|informational/i.test(combined)) {
    severity = "Low";
  }

  return { cve, affectedProduct, category, severity };
}

/**
 * Scrapes an RSS 2.0 XML feed.
 */
async function parseRssFeed(source) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(source.url, {
      headers: {
        "User-Agent": "HackerPost-CISO-Threat-Agent/2.0 (+https://hackerpost.online)"
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
        defaultZipCode: meta.cve || "Threat-Wire",
        severity: meta.severity,
        cve: meta.cve,
        affectedProduct: meta.affectedProduct,
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
 * Scrapes an Atom 1.0 XML feed (e.g., GitHub Security Advisories).
 */
async function parseAtomFeed(source) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(source.url, {
      headers: {
        "User-Agent": "HackerPost-CISO-Threat-Agent/2.0 (+https://hackerpost.online)"
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
 * Master multi-feed scraper.
 * Queries CISA, The Hacker News, BleepingComputer, and GitHub in parallel.
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

// Backward compatibility export for legacy callers
export async function scrapeCisaAlerts() {
  return scrapeAllSecurityFeeds();
}
