import assert from 'assert';
import { 
  verifyAdvisoryLegitimacy, 
  verifyXPostLegitimacy, 
  validateCve,
  screenAllFeeds
} from '../lib/feedLegitimacyVerifier.js';

console.log('--- RUNNING FEED LEGITIMACY UNIT TESTS ---');

// 1. Test CVE Validation
console.log('1. Testing CVE Validation...');
assert.strictEqual(validateCve('CVE-2026-3829').valid, true, 'Valid CVE should pass');
assert.strictEqual(validateCve('CVE-2099-1234').valid, false, 'Far future CVE should fail');
assert.strictEqual(validateCve('CVE-INVALID-FORMAT').valid, false, 'Invalid format should fail');
assert.strictEqual(validateCve('').valid, false, 'Empty CVE should fail');
console.log('   ✓ CVE Validation Passed');

// 2. Test Legitimate Advisory
console.log('2. Testing Legitimate Advisory Verification...');
const legitAdvisory = {
  id: 'adv-test-1',
  title: 'CISA Releases Security Advisory on Critical Industrial Control System Flaws',
  content: 'The Cybersecurity and Infrastructure Security Agency (CISA) has released an advisory regarding critical remote code execution vulnerabilities in industrial control hardware.',
  sourceUrl: 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa26-001a',
  cve: 'CVE-2026-1104',
  severity: 'Critical'
};
const legitResult = verifyAdvisoryLegitimacy(legitAdvisory);
assert.strictEqual(legitResult.verdict, 'LEGITIMATE', 'CISA advisory should be LEGITIMATE');
assert.strictEqual(legitResult.quarantined, false, 'Legitimate advisory should not be quarantined');
assert.ok(legitResult.legitimacyScore >= 80, `Legitimate score should be >= 80 (got ${legitResult.legitimacyScore})`);
console.log(`   ✓ Legitimate Advisory Passed (Score: ${legitResult.legitimacyScore}/100)`);

// 3. Test Malicious / Hoax Advisory
console.log('3. Testing Malicious Hoax Advisory Quarantining...');
const hoaxAdvisory = {
  id: 'adv-test-2',
  title: 'FREE 0DAY DOWNLOAD: Critical RCE in all routers click here to patch',
  content: 'Download instant rce generator now from anonfiles.com/drop.exe with unlimited bitcoin exploit.',
  sourceUrl: 'http://anonfiles.com/drop.exe',
  cve: 'CVE-2099-99999',
  severity: 'Critical'
};
const hoaxResult = verifyAdvisoryLegitimacy(hoaxAdvisory);
assert.ok(hoaxResult.legitimacyScore < 50, `Hoax score should be < 50 (got ${hoaxResult.legitimacyScore})`);
assert.strictEqual(hoaxResult.quarantined, true, 'Hoax advisory must be quarantined');
assert.ok(hoaxResult.reasons.some(r => r.includes('hoax') || r.includes('phishing') || r.includes('suspicious')), 'Should cite hoax reasons');
console.log(`   ✓ Hoax Advisory Quarantined (Score: ${hoaxResult.legitimacyScore}/100, Reasons: ${hoaxResult.reasons.length})`);

// 4. Test Legitimate X Post
console.log('4. Testing Legitimate X Threat Intel Post...');
const legitXPost = {
  id: 'x-test-1',
  handle: '@CISAgov',
  tweetText: 'CISA has added CVE-2026-3829 to our Known Exploited Vulnerabilities Catalog. Federal agencies must patch immediately.',
  articleUrl: 'https://hackerpost.online/news/cisa-exploited-vulnerabilities'
};
const legitXResult = verifyXPostLegitimacy(legitXPost);
assert.strictEqual(legitXResult.verdict, 'LEGITIMATE', 'CISAgov tweet should be LEGITIMATE');
assert.strictEqual(legitXResult.quarantined, false, 'Should not quarantine CISAgov');
console.log(`   ✓ Legitimate X Post Passed (Score: ${legitXResult.legitimacyScore}/100)`);

// 5. Test Spoofed / Typosquatting X Post
console.log('5. Testing Spoofed / Typosquat X Handle Quarantining...');
const spoofedXPost = {
  id: 'x-test-2',
  handle: '@cisa_gov_official_real_alerts',
  tweetText: 'FREE 0DAY DOWNLOAD for Windows Kernel exploit leak: http://bit.ly/fake-0day',
  articleUrl: 'http://bit.ly/fake-0day'
};
const spoofedXResult = verifyXPostLegitimacy(spoofedXPost);
assert.strictEqual(spoofedXResult.quarantined, true, 'Spoofed handle and phishing link must be quarantined');
assert.ok(spoofedXResult.legitimacyScore < 40, `Spoofed score should be < 40 (got ${spoofedXResult.legitimacyScore})`);
console.log(`   ✓ Spoofed X Post Quarantined (Score: ${spoofedXResult.legitimacyScore}/100)`);

// 6. Test Batch Screening with Quarantined Anomaly Injection
console.log('6. Testing Batch Screening Pipeline with Simulated Injections...');
const batchReport = await screenAllFeeds({
  additionalAdvisories: [hoaxAdvisory],
  additionalXPosts: [spoofedXPost]
});
assert.ok(batchReport.summary.quarantinedCount >= 2, 'Batch report must capture quarantined items');
assert.strictEqual(batchReport.summary.healthStatus, 'THREATS_QUARANTINED', 'Health status should reflect quarantined threats');
console.log(`   ✓ Batch Screening Passed (Total: ${batchReport.summary.totalScreened}, Quarantined: ${batchReport.summary.quarantinedCount})`);

console.log('\n🎉 ALL FEED LEGITIMACY UNIT TESTS PASSED SUCCESSFULLY!\n');
