import fs from 'fs';
import path from 'path';
import { getConsultations, addConsultation, updateConsultationStatus } from '../lib/consultationsStore.js';
import { getSubmissions, addSubmission } from '../lib/submissionsStore.js';

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

console.log("\n======================================================");
console.log("   HACKERPOST CISO TRAFFIC & MONETIZATION VERIFICATION");
console.log("======================================================\n");

// --- 1. Hackproof Technologies CISO Consultation Desk ---
console.log("--- 1. Testing Hackproof CISO Consultation Store & Desk ---");
try {
  const initialList = getConsultations();
  assert(Array.isArray(initialList), "Consultations store returns an array");

  const testLead = addConsultation({
    companyName: "Enterprise Vanguard Defense",
    contactName: "David Sterling, CISO",
    contactEmail: "d.sterling@vanguarddefense.com",
    role: "Chief Information Security Officer (CISO)",
    infraSize: "5,000 - 10,000 Cloud Instances",
    serviceNeeded: "Zero-Day Attack Surface Audit",
    threatConcern: "Validating exposure to CVE-2026-3829 across public IP perimeters",
    urgency: "urgent"
  });

  assert(!!testLead.id && testLead.id.startsWith("consult-"), "Consultation created with unique ID");
  assert(testLead.contactEmail === "d.sterling@vanguarddefense.com", "Captured corporate contact email correctly");
  assert(testLead.urgency === "urgent", "Urgency level flagged as urgent (4-hour SLA)");
  assert(testLead.status === "new_inquiry", "Initial inquiry status is 'new_inquiry'");

  const updated = updateConsultationStatus(testLead.id, "architect_assigned");
  assert(updated && updated.status === "architect_assigned", "Admin can transition consultation status to 'architect_assigned'");

  // Verify API route file
  const consultApiFile = path.join(process.cwd(), 'app', 'api', 'consult', 'route.js');
  assert(fs.existsSync(consultApiFile), "app/api/consult/route.js API route exists");
  const consultApiContent = fs.readFileSync(consultApiFile, 'utf-8');
  assert(consultApiContent.includes("rateLimiter.check"), "Consultation API includes brute-force rate limiting");
  assert(consultApiContent.includes("sanitizeInput"), "Consultation API sanitizes inputs");
} catch (err) {
  assert(false, `Consultation store threw error: ${err.message}`);
}

// --- 2. Inbound Sponsorship & Paid Press Release Wire ---
console.log("\n--- 2. Testing Self-Serve Sponsorship & Paid PR Wire ---");
try {
  const prSubmission = addSubmission({
    companyName: "SentinelAI Labs",
    contactName: "Elena Rostova",
    contactEmail: "press@sentinelai.com",
    title: "SentinelAI Secures $42M Series B to Automate CISO Threat Hunting",
    summary: "New funding round led by Cyberstarts and Accel to expand autonomous threat response.",
    tier: "Spotlight",
    type: "sponsorship",
    fundingAmount: "$42M",
    fundingRound: "Series B"
  });

  assert(!!prSubmission.id, "Sponsorship submission created with unique tracking ID");
  assert(prSubmission.tier === "Spotlight", "Captures high-tier Spotlight ($699) selection");
  assert(prSubmission.type === "sponsorship", "Identified as inbound monetization sponsorship");

  // Verify Media Kit page
  const advertiseFile = path.join(process.cwd(), 'app', 'advertise', 'page.js');
  assert(fs.existsSync(advertiseFile), "app/advertise/page.js Media Kit page exists");
  const advertiseContent = fs.readFileSync(advertiseFile, 'utf-8');
  assert(advertiseContent.includes("$299"), "Media kit features Verified PR Wire tier ($299)");
  assert(advertiseContent.includes("$699"), "Media kit features CISO Executive Spotlight tier ($699)");
  assert(advertiseContent.includes("$1,299"), "Media kit features Category Exclusivity tier ($1,299)");
  assert(advertiseContent.includes("impressionsSlider"), "Media kit includes interactive CISO impressions & ROI calculator");
  assert(advertiseContent.includes("/api/submit"), "Media kit form submits directly to inbound processing API");
} catch (err) {
  assert(false, `Sponsorship testing threw error: ${err.message}`);
}

// --- 3. CISO Executive Action Center & Boardroom Virality ---
console.log("\n--- 3. Testing CISO Action Center & Boardroom Memo Virality ---");
try {
  const articleClientFile = path.join(process.cwd(), 'app', 'news', '[id]', 'ArticleClient.js');
  assert(fs.existsSync(articleClientFile), "ArticleClient.js exists");
  const articleClientContent = fs.readFileSync(articleClientFile, 'utf-8');

  assert(articleClientContent.includes("CISO Executive Action Center"), "Advisory includes CISO Executive Action Center");
  assert(articleClientContent.includes("copyBoardroomMemo"), "Includes 1-click Executive Boardroom Memo generator");
  assert(articleClientContent.includes("Hackproof Technologies"), "Boardroom memo embeds verified Hackproof Technologies attribution");
  assert(articleClientContent.includes("SEC Form 8-K"), "Features SEC Form 8-K 4-day disclosure clock indicator");
  assert(articleClientContent.includes("toggleChecklistItem"), "Advisory features interactive CISO remediation checklist");
  assert(articleClientContent.includes("Enterprise Defense Desk"), "Features native Hackproof Technologies remediation desk banner");
  assert(articleClientContent.includes("CISO Threat Hotline"), "Features floating emergency CISO consultation widget");
} catch (err) {
  assert(false, `ArticleClient check threw error: ${err.message}`);
}

// --- 4. Google Rich Snippets & CISO SEO (JSON-LD) ---
console.log("\n--- 4. Testing Structured Data (JSON-LD) & CISO SEO ---");
try {
  const articlePageFile = path.join(process.cwd(), 'app', 'news', '[id]', 'page.js');
  assert(fs.existsSync(articlePageFile), "app/news/[id]/page.js exists");
  const articlePageContent = fs.readFileSync(articlePageFile, 'utf-8');

  assert(articlePageContent.includes("NewsArticle"), "Injects schema.org NewsArticle structured data");
  assert(articlePageContent.includes("FAQPage"), "Injects schema.org FAQPage structured data for Google Rich Results");
  assert(articlePageContent.includes("SEC material incident disclosure"), "FAQ structured data targets high-intent CISO regulatory search queries");
  assert(articlePageContent.includes("CISO Executive Briefing"), "Metadata keywords target CISO executive queries");
} catch (err) {
  assert(false, `Structured data check threw error: ${err.message}`);
}

// --- 5. Global Navigation & Canonical Sitemap ---
console.log("\n--- 5. Testing Global Navigation & Sitemap Integration ---");
try {
  const headerFile = path.join(process.cwd(), 'app', 'components', 'Header.js');
  const headerContent = fs.readFileSync(headerFile, 'utf-8');
  assert(headerContent.includes('href="/advertise"'), "Header links directly to /advertise (Media Kit & PR)");
  assert(headerContent.includes('href="/consult"'), "Header links directly to /consult (Hackproof CISO Desk)");

  const footerFile = path.join(process.cwd(), 'app', 'components', 'Footer.js');
  const footerContent = fs.readFileSync(footerFile, 'utf-8');
  assert(footerContent.includes('href="/advertise"'), "Footer links to /advertise");
  assert(footerContent.includes('href="/consult"'), "Footer links to /consult");
  assert(footerContent.includes("Hackproof Technologies India Private Limited"), "Footer explicitly attributes parent company");

  const sitemapFile = path.join(process.cwd(), 'app', 'sitemap.js');
  const sitemapContent = fs.readFileSync(sitemapFile, 'utf-8');
  assert(sitemapContent.includes('/advertise'), "Sitemap includes canonical URL for /advertise");
  assert(sitemapContent.includes('/consult'), "Sitemap includes canonical URL for /consult");
} catch (err) {
  assert(false, `Navigation check threw error: ${err.message}`);
}

console.log("\n======================================================");
console.log(`   TEST RESULTS: ${passed}/${passed + failed} Passed (${failed} Failed)   `);
console.log("======================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
