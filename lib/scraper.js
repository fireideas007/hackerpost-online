/**
 * Cybersecurity Advisory RSS Scraper Module.
 * Fetches and parses security alerts live from the CISA advisory XML feeds
 * without external XML parser dependencies.
 */

const CISA_FEED_URL = "https://www.cisa.gov/cybersecurity-advisories/all.xml";

// Helper to decode basic XML / HTML entities
function decodeEntities(str) {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1") // Strip CDATA wrappers
    .replace(/<[^>]*>/g, ""); // Strip nested html tags
}

export async function scrapeCisaAlerts() {
  try {
    const res = await fetch(CISA_FEED_URL, {
      headers: {
        "User-Agent": "HackerPost-Threat-Scraper/2.0 (+https://hackerpost.online)"
      },
      next: { revalidate: 60 } // cache for 1 minute
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch CISA feed: HTTP ${res.status}`);
    }

    const xmlText = await res.text();
    
    // Parse <item> blocks using regex
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items = [];
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1];

      // Extract Title
      const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
      const title = titleMatch ? decodeEntities(titleMatch[1]).trim() : "";

      // Extract Link
      const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
      const link = linkMatch ? linkMatch[1].trim() : "";

      // Extract Description / Content
      const descMatch = itemContent.match(/<description>([\s\S]*?)<\/description>/);
      const description = descMatch ? decodeEntities(descMatch[1]).trim() : "";

      // Extract Publication Date
      const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const pubDateString = pubDateMatch ? pubDateMatch[1].trim() : new Date().toUTCString();
      const publishedAt = new Date(pubDateString).toISOString();

      // Detect CVE IDs (e.g. CVE-2026-1234)
      const cveMatch = (title + " " + description).match(/CVE-\d{4}-\d{4,7}/i);
      const cve = cveMatch ? cveMatch[0].toUpperCase() : "";

      // Determine product / vendor
      const vendorMatch = (title + " " + description).match(/(Cisco|Microsoft|Ivanti|VMware|Apple|Google|Linux|Fortinet|Palo Alto)/i);
      const affectedProduct = vendorMatch ? vendorMatch[0] : "Multi-Vendor";

      // Classify category based on title contents
      let category = "Advisories";
      if (/exploit|zero-day/i.test(title + description)) category = "Zero-Days";
      else if (/ransomware/i.test(title + description)) category = "Ransomware";
      else if (/leak|breach|exfiltrat/i.test(title + description)) category = "Data Breaches";

      // Assess severity
      let severity = "Medium";
      if (/critical|active exploit/i.test(title + description)) severity = "Critical";
      else if (/high|remote code|privilege escalation/i.test(title + description)) severity = "High";

      items.push({
        providerId: "prov-cisa",
        title,
        content: description,
        publishedAt,
        sourceUrl: link,
        category,
        defaultZipCode: cve || "Threat-Intel", // back-compatible with default location attribute
        severity,
        cve,
        affectedProduct,
        disclosureStatus: "Disclosed"
      });
    }

    return items;
  } catch (err) {
    console.error("Scraper Error: ", err);
    return [];
  }
}
