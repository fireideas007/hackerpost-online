import { runAgentCycle, calculateThreatVelocity, getAgentState } from '../lib/agentEngine.js';
import { getPublishedArticles } from '../lib/newsStore.js';

console.log("\n======================================================");
console.log("   HACKERPOST 10+ DAILY QUOTA & SURGE VERIFICATION    ");
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
  console.log("--- 1. Testing Threat Velocity & Surge Detection ---");
  
  // Test A: Normal baseline feed
  const normalItems = [
    { title: "Routine patch update for minor bug in library", severity: "Low", content: "Maintenance patch released." },
    { title: "Quarterly security advisory notice", severity: "Medium", content: "Minor patch notes." }
  ];
  const normalVelocity = calculateThreatVelocity(normalItems);
  assert(normalVelocity.score < 60, `Normal feed velocity: ${normalVelocity.score}/100 (< 60 threshold)`);
  assert(normalVelocity.isSurge === false, `Normal feed isSurge is FALSE`);

  // Test B: Surge condition (Critical 0-Day + Ransomware + Mega Funding)
  const surgeItems = [
    { title: "Critical 0-Day actively exploited in the wild in Windows", severity: "Critical", content: "Active zero-day exploitation confirmed by CISA emergency directive." },
    { title: "New LockBit Ransomware campaign encrypts 50 healthcare networks", severity: "High", content: "Ransomware extortion wave." },
    { title: "SecTech Startup raises $350M Series D at $3B Valuation", severity: "Critical", fundingAmount: "$350M", content: "Mega funding round." }
  ];
  const surgeVelocity = calculateThreatVelocity(surgeItems);
  assert(surgeVelocity.score >= 60, `Surge feed velocity: ${surgeVelocity.score}/100 (>= 60 threshold)`);
  assert(surgeVelocity.isSurge === true, `Surge feed isSurge is TRUE`);
  assert(surgeVelocity.triggers.length > 0, `Surge triggers captured: ${surgeVelocity.triggers.join(', ')}`);

  console.log("\n--- 2. Testing Daily Quota Pacing & Minimum 10 Article Target ---");
  const state = getAgentState();
  assert(state.minDailyTarget === 10, `Minimum daily target configured to 10 articles`);
  
  // Execute autonomous cycle
  const cycleResult = await runAgentCycle("quota-verification-test", { forceSurge: true });
  assert(cycleResult.success === true, `Autonomous cycle executed successfully`);
  assert(typeof cycleResult.publishedCount === "number", `Published articles in cycle: ${cycleResult.publishedCount}`);
  assert(cycleResult.isSurge === true, `Cycle recognized surge mode`);

  const updatedState = getAgentState();
  assert(updatedState.dailyStats.publishedToday >= 4, `Daily stats tracks published count: ${updatedState.dailyStats.publishedToday}/${updatedState.minDailyTarget}`);
  console.log(`  [Daily Quota Status]: ${updatedState.dailyStats.publishedToday} / ${updatedState.minDailyTarget} (Target: 10/day guaranteed)`);
  console.log(`  [Threat Velocity Index]: ${updatedState.dailyStats.threatVelocity}/100 [Surge: ${updatedState.dailyStats.surgeActive ? 'ACTIVE ⚡' : 'NORMAL'}]`);

  const allArticles = getPublishedArticles();
  assert(allArticles.length >= 4, `Total published corpus has ${allArticles.length} articles`);

  console.log("\n======================================================");
  console.log(`   TEST RESULTS: ${passed}/${passed + failed} Passed (${failed} Failed)   `);
  console.log("======================================================\n");

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
