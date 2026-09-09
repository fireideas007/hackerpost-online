import fs from 'fs';
import path from 'path';
import { scrapeAllSecurityFeeds, resolveArticleThumbnail } from '../lib/scraper.js';
import { simulateAiRewrite } from '../lib/aiRewriter.js';
import { auditPlagiarism } from '../lib/similarity.js';
import { verifyAdvisoryLegitimacy } from '../lib/feedLegitimacyVerifier.js';
import { slugify } from '../lib/newsStore.js';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

async function main() {
  console.log("===============================================================");
  console.log("  HackerPost: Harvesting Real-World Threat Intelligence & News");
  console.log("===============================================================");

  // 1. Scrape all 12 live feeds
  console.log("\n[1/4] Scraping 12 tier-1 security feeds in parallel...");
  const rawItems = await scrapeAllSecurityFeeds();
  console.log(`✓ Fetched ${rawItems.length} raw real-world dispatches.`);

  if (rawItems.length === 0) {
    console.error("No items scraped, exiting.");
    process.exit(1);
  }

  // 2. Load existing db.json
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  const existingUrls = new Set(db.publishedArticles.map(a => a.sourceUrl?.toLowerCase()));
  const existingTitles = new Set(db.publishedArticles.map(a => a.title?.toLowerCase().trim()));

  console.log(`\n[2/4] Processing & synthesizing CISO briefings with thumbnails...`);
  
  // Prioritize critical and high severity real-world items
  const processedArticles = [];
  const seenSlugs = new Set(db.publishedArticles.map(a => a.slug));

  for (const rawItem of rawItems) {
    if (!rawItem.title || rawItem.title.length < 15) continue;
    if (existingUrls.has(rawItem.sourceUrl?.toLowerCase())) continue;
    if (existingTitles.has(rawItem.title?.toLowerCase().trim())) continue;

    // Verify legitimacy / anti-hoax
    const legitimacy = verifyAdvisoryLegitimacy(rawItem);
    if (legitimacy.quarantined) {
      continue;
    }

    // AI CISO Synthesis
    const rewrite = simulateAiRewrite(
      rawItem.title,
      rawItem.content,
      rawItem.cve || rawItem.defaultZipCode || "Global Advisory",
      rawItem.providerName || "Verified Wire",
      rawItem.sourceUrl
    );

    // Similarity / Plagiarism check
    const audit = auditPlagiarism(rawItem.content, rewrite.content);

    // Resolve high-resolution thumbnail
    const imageUrl = resolveArticleThumbnail(rawItem.category, rawItem.title, rawItem.imageUrl);

    let baseSlug = slugify(rewrite.title) || `bulletin-${Date.now()}`;
    let finalSlug = baseSlug;
    let counter = 1;
    while (seenSlugs.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter++}`;
    }
    seenSlugs.add(finalSlug);

    const publishedArt = {
      id: `pub-${Date.now()}-${processedArticles.length}`,
      slug: finalSlug,
      rawId: `raw-${Date.now()}-${processedArticles.length}`,
      providerName: rawItem.providerName || "Threat Wire",
      originalTitle: rawItem.title,
      title: rewrite.title,
      content: rewrite.content,
      category: rawItem.category || "Advisories",
      location: rawItem.cve || "CVE-Advisory",
      sourceUrl: rawItem.sourceUrl,
      similarityScore: audit.score,
      views: Math.floor(Math.random() * 350) + 75,
      severity: rawItem.severity || "High",
      cve: rawItem.cve || "",
      affectedProduct: rawItem.affectedProduct || "Enterprise Systems",
      fundingAmount: rawItem.fundingAmount || "",
      fundingRound: rawItem.fundingRound || "",
      disclosureStatus: rawItem.disclosureStatus || "Disclosed",
      disclosureDate: rawItem.publishedAt ? rawItem.publishedAt.split('T')[0] : new Date().toISOString().split('T')[0],
      publishedAt: rawItem.publishedAt || new Date().toISOString(),
      imageUrl,
      versions: [
        {
          version: 1,
          timestamp: rawItem.publishedAt || new Date().toISOString(),
          title: rewrite.title,
          content: rewrite.content
        }
      ]
    };

    processedArticles.push(publishedArt);
    existingUrls.add(rawItem.sourceUrl?.toLowerCase());
    existingTitles.add(rawItem.title?.toLowerCase().trim());
  }

  console.log(`✓ Synthesized ${processedArticles.length} new real-world articles with thumbnails.`);

  // Ensure older existing articles also have valid thumbnails attached
  let updatedExistingCount = 0;
  db.publishedArticles.forEach(art => {
    if (!art.imageUrl) {
      art.imageUrl = resolveArticleThumbnail(art.category, art.title);
      updatedExistingCount++;
    }
  });

  // Combine: New real-world articles first, followed by preserved existing articles
  const allArticles = [...processedArticles, ...db.publishedArticles];
  
  // Sort by publishedAt descending
  allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  // Cap database to 60 top fresh articles to keep DB lean and fast
  db.publishedArticles = allArticles.slice(0, 60);

  // Update rawArticles with remainder
  db.rawArticles = rawItems.slice(0, 20).map((r, idx) => ({
    id: `raw-${Date.now()}-${idx}`,
    ...r
  }));

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  console.log(`\n[3/4] Saved updated database to data/db.json!`);
  console.log(`- Total published articles in DB: ${db.publishedArticles.length}`);
  console.log(`- Sample real-world dispatches:`);
  db.publishedArticles.slice(0, 5).forEach((a, i) => {
    console.log(`  ${i + 1}. [${a.providerName}] ${a.title}`);
    console.log(`     Category: ${a.category} | Image: ${a.imageUrl?.slice(0, 60)}...`);
    console.log(`     Published: ${a.publishedAt}`);
  });

  console.log("\n[4/4] Ingestion complete!");
}

main().catch(err => {
  console.error("Harvesting failed:", err);
  process.exit(1);
});
