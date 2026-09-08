import { composeTweet, generateHashtags, publishToX, getSocialLogs } from '../lib/xPublisher.js';
import { getPublishedArticles, getPublishedArticleById } from '../lib/newsStore.js';

console.log("\n======================================================");
console.log("   HACKERPOST SOCIAL & X AUTOPUBLISH VERIFICATION     ");
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
  const articles = getPublishedArticles();
  assert(articles.length >= 4, `Found ${articles.length} published articles to test`);

  console.log("\n--- 1. Testing Tweet Formatting & Length Boundaries (<= 280 Chars) ---");
  for (const article of articles) {
    const tweet = composeTweet(article);
    assert(tweet.charCount <= 280, `Tweet for '${article.title.slice(0, 30)}...' length: ${tweet.charCount} <= 280 chars`);
    assert(tweet.text.includes('https://hackerpost.online/news/'), `Tweet includes canonical URL`);
    assert(tweet.hashtags.length >= 3, `Tweet includes ${tweet.hashtags.length} targeted hashtags`);
    console.log(`\n  [Preview for ${article.id}]:\n  ${tweet.text.replace(/\n/g, '\n  ')}\n`);
  }

  console.log("--- 2. Testing Category-Specific Hashtag Intelligence ---");
  const startupArt = getPublishedArticleById("pub-startup-1");
  const startupTags = generateHashtags(startupArt);
  assert(startupTags.includes('#SecTech') || startupTags.includes('#Startups'), `Startup article has #SecTech / #Startups tag`);

  const cveArt = getPublishedArticleById("pub-1");
  const cveTags = generateHashtags(cveArt);
  assert(cveTags.some(t => t.toLowerCase().includes('cve')), `CVE article has #CVE tag (${cveTags.join(' ')})`);

  const benchArt = getPublishedArticleById("pub-bench-1");
  const benchTags = generateHashtags(benchArt);
  assert(benchTags.includes('#AISecurity') || benchTags.includes('#LLM'), `Benchmark article has #AISecurity tag`);

  const maArt = getPublishedArticleById("pub-ma-1");
  const maTags = generateHashtags(maArt);
  assert(maTags.includes('#MandA') || maTags.includes('#TechDeals'), `M&A article has #MandA tag`);

  console.log("\n--- 3. Testing X Broadcast & Social Syndication Engine ---");
  const broadcastResult = await publishToX(startupArt);
  assert(broadcastResult && broadcastResult.id, `Broadcast generated unique log ID: ${broadcastResult.id}`);
  assert(broadcastResult.handle === "@HackerPost2", `Target X handle is @HackerPost2`);
  assert(broadcastResult.status === "simulated" || broadcastResult.status === "published", `Broadcast status: ${broadcastResult.status}`);

  const logs = getSocialLogs();
  assert(logs.length > 0, `Social log persisted to disk (${logs.length} total entries)`);
  assert(logs[0].articleId === startupArt.id, `Most recent log matches broadcasted article`);

  console.log("\n======================================================");
  console.log(`   TEST RESULTS: ${passed}/${passed + failed} Passed (${failed} Failed)   `);
  console.log("======================================================\n");

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
