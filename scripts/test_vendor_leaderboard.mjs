import assert from 'node:assert';
import { 
  getVendorLeaderboard, 
  getVendorById, 
  castVendorVote, 
  submitStartupNomination,
  calculateCisoCompositeScore
} from '../lib/vendorStore.js';

console.log("=== Running CISO Vendor Leaderboard Unit & Integration Tests ===");

// 1. Test default leaderboard retrieval
const initialData = getVendorLeaderboard();
assert.strictEqual(initialData.success, true, "Leaderboard retrieval should succeed");
assert.ok(initialData.vendors.length >= 15, `Expected >= 15 vendors, got ${initialData.vendors.length}`);
assert.strictEqual(initialData.vendors[0].rank, 1, "Top vendor should have rank 1");
console.log(`✓ 1. Retrieved ${initialData.vendors.length} vendors. Top ranked: #${initialData.vendors[0].rank} ${initialData.vendors[0].name} (Score: ${initialData.vendors[0].cisoScore})`);

// 2. Test category filtering
const cloudData = getVendorLeaderboard({ category: "Cloud Security & DSPM" });
assert.ok(cloudData.vendors.length >= 2, "Expected at least 2 Cloud Security vendors");
for (const v of cloudData.vendors) {
  assert.ok(v.category.includes("Cloud Security"), `Vendor ${v.name} should be in Cloud Security category`);
}
console.log(`✓ 2. Category filtering works: found ${cloudData.vendors.length} Cloud & DSPM platforms.`);

// 3. Test search query
const searchWiz = getVendorLeaderboard({ search: "Wiz" });
assert.ok(searchWiz.vendors.length >= 1, "Should find Wiz by search");
assert.strictEqual(searchWiz.vendors[0].name, "Wiz");
console.log(`✓ 3. Search query works: matched "${searchWiz.vendors[0].name}"`);

// 4. Test composite score calculation
const sampleVendor = {
  autonomyScore: 90,
  precisionScore: 90,
  integrationScore: 90,
  valueScore: 90,
  upvotes: 100,
  downvotes: 0
};
const calculatedScore = calculateCisoCompositeScore(sampleVendor);
assert.ok(calculatedScore >= 90 && calculatedScore <= 100, `Score ${calculatedScore} should be in expected range`);
console.log(`✓ 4. Composite score calculation verified: ${calculatedScore}`);

// 5. Test CISO vote / endorsement
const testVendorId = "wiz-cloud";
const beforeVendor = getVendorById(testVendorId);
const beforeUpvotes = beforeVendor.upvotes;

const voteResult = castVendorVote({
  vendorId: testVendorId,
  voteType: "up",
  voterRole: "Chief Information Security Officer",
  voterOrg: "Global Financial Institution"
});

assert.strictEqual(voteResult.success, true, "Voting should succeed");
assert.strictEqual(voteResult.vendor.upvotes, beforeUpvotes + 1, "Upvotes should increment by 1");
console.log(`✓ 5. CISO Endorsement recorded: ${voteResult.vendor.name} upvotes incremented from ${beforeUpvotes} to ${voteResult.vendor.upvotes}`);

// 6. Test startup nomination
const nominationResult = submitStartupNomination({
  companyName: "ShieldAgent AI",
  website: "https://shieldagent.ai",
  category: "Autonomous SOC & AI Defense",
  founderEmail: "founder@shieldagent.ai",
  valuationOrFunding: "$10M Seed",
  differentiator: "Self-healing enterprise API firewall with real-time prompt isolation"
});

assert.strictEqual(nominationResult.success, true, "Nomination should succeed");
assert.ok(nominationResult.nominationId, "Should return nomination ID");
console.log(`✓ 6. Startup nomination verified: ${nominationResult.nominationId}`);

// 7. Test sorting by autonomy
const sortedByAutonomy = getVendorLeaderboard({ sortBy: "autonomy" });
assert.ok(sortedByAutonomy.vendors[0].autonomyScore >= sortedByAutonomy.vendors[1].autonomyScore, "Should be sorted by autonomy descending");
console.log(`✓ 7. Sort by autonomy verified: top is ${sortedByAutonomy.vendors[0].name} (${sortedByAutonomy.vendors[0].autonomyScore}%)`);

console.log("\n>>> ALL 7 LEADERBOARD TESTS PASSED (0 FAILED) <<<");
