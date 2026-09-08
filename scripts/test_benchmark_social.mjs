import fs from 'fs';
import path from 'path';

console.log("\n======================================================");
console.log("   HACKERPOST BENCHMARK SOCIAL SHARE VERIFICATION     ");
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
  const projectRoot = process.cwd();

  console.log("--- 1. Testing Creative Benchmark SVG Asset ---");
  const svgPath = path.join(projectRoot, 'public', 'ai-benchmark-card.svg');
  assert(fs.existsSync(svgPath), "public/ai-benchmark-card.svg asset exists");
  
  const svgContent = fs.readFileSync(svgPath, 'utf-8');
  assert(svgContent.includes('AI SECURITY MODEL LEADERBOARD'), "SVG includes main title header");
  assert(svgContent.includes('Claude 3.7 Sonnet'), "SVG highlights #1 model Claude 3.7 Sonnet");
  assert(svgContent.includes('94.2'), "SVG features top score index");
  assert(svgContent.includes('hackerpost.online/benchmarks'), "SVG includes canonical domain callout");

  console.log("\n--- 2. Testing Social Share Component & Pre-Text ---");
  const compPath = path.join(projectRoot, 'app', 'components', 'BenchmarkSocialShare.js');
  assert(fs.existsSync(compPath), "app/components/BenchmarkSocialShare.js exists");

  const compContent = fs.readFileSync(compPath, 'utf-8');
  assert(compContent.includes('twitter.com/intent/tweet'), "Component has X / Twitter 1-click share intent");
  assert(compContent.includes('linkedin.com/sharing/share-offsite'), "Component has LinkedIn share integration");
  assert(compContent.includes('reddit.com/submit'), "Component has Reddit share integration");
  assert(compContent.includes('t.me/share'), "Component has Telegram share integration");
  assert(compContent.includes('@HackerPost2'), "Pre-text mentions official X account @HackerPost2");
  assert(compContent.includes('Claude 3.7 Sonnet'), "Pre-text summarizes leaderboard highlights");

  console.log("\n--- 3. Testing OpenGraph & Twitter Card Metadata ---");
  const layoutPath = path.join(projectRoot, 'app', 'benchmarks', 'layout.js');
  assert(fs.existsSync(layoutPath), "app/benchmarks/layout.js metadata exists");
  
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  assert(layoutContent.includes('summary_large_image'), "Twitter Card uses summary_large_image");
  assert(layoutContent.includes('/ai-benchmark-card.svg'), "OpenGraph embeds /ai-benchmark-card.svg");
  assert(layoutContent.includes('@HackerPost2'), "Twitter site and creator tags set to @HackerPost2");

  console.log("\n======================================================");
  console.log(`   TEST RESULTS: ${passed}/${passed + failed} Passed (${failed} Failed)   `);
  console.log("======================================================\n");

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
