import { getPublishedArticles, getPublishedArticleById } from '../lib/newsStore.js';

console.log("\n======================================================");
console.log("     HACKERPOST THREAT FEED & SEO URL VERIFICATION    ");
console.log("======================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`✗ [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("--- 1. Testing Published Feed Articles & Slugs ---");
  const articles = getPublishedArticles();
  assert(articles.length >= 10, `Found ${articles.length} published articles (>= 10)`);

  for (const art of articles) {
    assert(!!art.slug, `Article '${art.title.slice(0, 35)}...' has slug: /news/${art.slug}`);
    assert(art.slug.length <= 90, `Slug length is SEO-friendly (${art.slug.length} chars)`);
  }

  console.log("\n--- 2. Testing SEO Slug & Legacy ID Resolution ---");
  
  // Test slug lookup
  const cyera = getPublishedArticleById("cyera-secures-300m-series-d-enterprise-ai-dspm");
  assert(cyera !== null, "Resolved /news/cyera-secures-300m-series-d-enterprise-ai-dspm by full slug");
  assert(cyera?.category === "SecTech & Startups", "Cyera article category is SecTech & Startups");

  // Test legacy ID lookup
  const legacyStartup = getPublishedArticleById("pub-startup-1");
  assert(legacyStartup !== null, "Resolved /news/pub-startup-1 by legacy ID");

  const legacyMa = getPublishedArticleById("pub-ma-1");
  assert(legacyMa !== null, "Resolved /news/pub-ma-1 by legacy ID");

  const legacyBench = getPublishedArticleById("pub-bench-1");
  assert(legacyBench !== null, "Resolved /news/pub-bench-1 by legacy ID");

  const legacyCve = getPublishedArticleById("pub-1");
  assert(legacyCve !== null, "Resolved /news/pub-1 by legacy ID");

  console.log("\n--- 3. Testing CVE & Partial Keyword Resolution ---");
  const byCve = getPublishedArticleById("cve-2026-3829");
  assert(byCve !== null, "Resolved /news/cve-2026-3829 by CVE identifier");

  const byPartialSlug = getPublishedArticleById("cyera-secures-300m");
  assert(byPartialSlug !== null, "Resolved /news/cyera-secures-300m by partial slug");

  const byIvantiCve = getPublishedArticleById("cve-2026-21887");
  assert(byIvantiCve !== null, "Resolved /news/cve-2026-21887 by CVE code");

  console.log("\n======================================================");
  console.log(`   TEST RESULTS: ${passed}/${passed + failed} Passed (${failed} Failed)   `);
  console.log("======================================================\n");

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
