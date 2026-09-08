import fs from 'fs';
import path from 'path';

console.log("\n======================================================");
console.log("   HACKERPOST INBOUND MAGNET & PR PORTAL VERIFICATION ");
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

  console.log("--- 1. Testing Viral Embeddable Trust Badges ---");
  const badge1 = path.join(projectRoot, 'public', 'badges', 'verified-sectech-2026.svg');
  const badge2 = path.join(projectRoot, 'public', 'badges', 'top-ai-secllm-2026.svg');

  assert(fs.existsSync(badge1), "verified-sectech-2026.svg badge asset exists");
  assert(fs.existsSync(badge2), "top-ai-secllm-2026.svg badge asset exists");

  const badge1Content = fs.readFileSync(badge1, 'utf-8');
  assert(badge1Content.includes('VERIFIED SECTECH 2026'), "Badge 1 includes verified title");
  assert(badge1Content.includes('HackerPost.online Wire'), "Badge 1 includes domain wire attribution");

  console.log("\n--- 2. Testing Inbound Pitch Desk Submissions Store ---");
  const { getSubmissions, addSubmission, updateSubmissionStatus } = await import('../lib/submissionsStore.js');

  const initialList = getSubmissions();
  assert(Array.isArray(initialList), "Submissions store returns an array");

  const testPitch = addSubmission({
    companyName: "Wiz Security Labs",
    contactName: "Assaf Rappaport",
    contactEmail: "press@wiz.io",
    website: "https://www.wiz.io",
    title: "Cloud Native SecTech Wiz Unveils Next-Gen AI SOC Defense",
    fundingAmount: "$1B",
    fundingRound: "Growth Round",
    tier: "FastTrack",
    type: "funding",
    summary: "Cloud security leader Wiz announces major new agentic threat remediation suite for multi-cloud enterprise deployments."
  });

  assert(testPitch && testPitch.id.startsWith("sub-"), "Submission created with unique ID");
  assert(testPitch.tier === "FastTrack", "Submission captures FastTrack tier ($299)");
  assert(testPitch.status === "pending_review", "Initial status is pending_review");

  const updated = updateSubmissionStatus(testPitch.id, "approved_published");
  assert(updated && updated.status === "approved_published", "Admin can update submission status to approved_published");

  console.log("\n--- 3. Testing Submit Portal Frontend & Navigation Integration ---");
  const submitPagePath = path.join(projectRoot, 'app', 'submit', 'page.js');
  assert(fs.existsSync(submitPagePath), "app/submit/page.js exists");

  const submitPageContent = fs.readFileSync(submitPagePath, 'utf-8');
  assert(submitPageContent.includes('FastTrack'), "Submit page supports FastTrack tier ($299)");
  assert(submitPageContent.includes('Spotlight'), "Submit page supports Spotlight tier ($699)");
  assert(submitPageContent.includes('badgeHtml'), "Submit page includes embeddable trust badge snippet generator");

  const headerPath = path.join(projectRoot, 'app', 'components', 'Header.js');
  const headerContent = fs.readFileSync(headerPath, 'utf-8');
  assert(headerContent.includes('/submit'), "Header includes link to /submit portal");
  assert(headerContent.includes('Pitch a Story'), "Header includes 'Pitch a Story' call to action");

  const articleClientPath = path.join(projectRoot, 'app', 'news', '[id]', 'ArticleClient.js');
  const articleClientContent = fs.readFileSync(articleClientPath, 'utf-8');
  assert(articleClientContent.includes('Claim Company Profile'), "Article sidebar includes Claim Company Profile inbound funnel");

  console.log("\n======================================================");
  console.log(`   TEST RESULTS: ${passed}/${passed + failed} Passed (${failed} Failed)   `);
  console.log("======================================================\n");

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
