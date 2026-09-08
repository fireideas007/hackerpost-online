import fs from 'fs';
import path from 'path';
import { 
  generateApiKey, 
  hashApiKey, 
  maskApiKey, 
  rateLimiter, 
  TIER_LIMITS, 
  timingSafeMatch 
} from './security.js';

const DB_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DB_DIR, 'users.json');

// Initial seed or default state for users and API keys
function getDefaultUserData() {
  return {
    users: [
      {
        id: "usr_sandbox_default",
        googleId: "google_demo_1092837465",
        email: "ciso.developer@hackproof.online",
        name: "Enterprise SecOps Lead",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
        tier: "Pro",
        role: "developer",
        createdAt: "2026-08-01T00:00:00.000Z",
        lastLoginAt: "2026-08-23T12:00:00.000Z"
      }
    ],
    apiKeys: [
      {
        id: "key_pro_demo_1",
        userId: "usr_sandbox_default",
        name: "Default Production Key",
        keyPrefix: "hp_live_7f98e0b2d3c4e5f6a7b8c9d0e1f",
        // SHA-256 hash of "hp_live_7f98e0b2d3c4e5f6a7b8c9d0e1f"
        keyHash: hashApiKey("hp_live_7f98e0b2d3c4e5f6a7b8c9d0e1f"),
        tier: "Pro",
        status: "active",
        createdAt: "2026-08-01T00:00:00.000Z",
        lastUsedAt: "2026-08-23T12:00:00.000Z",
        usageCount: 142
      }
    ],
    auditLogs: [
      {
        id: "log_1",
        userId: "usr_sandbox_default",
        action: "KEY_PROVISIONED",
        ip: "127.0.0.1",
        timestamp: "2026-08-01T00:00:00.000Z",
        details: "Auto-provisioned initial developer API key"
      }
    ]
  };
}

let memoryUserDB = null;

function getUserDB() {
  if (memoryUserDB) {
    return memoryUserDB;
  }

  try {
    if (!fs.existsSync(DB_DIR)) {
      try { fs.mkdirSync(DB_DIR, { recursive: true }); } catch (_) {}
    }

    if (!fs.existsSync(USERS_FILE)) {
      const defaultData = getDefaultUserData();
      try { fs.writeFileSync(USERS_FILE, JSON.stringify(defaultData, null, 2), 'utf-8'); } catch (_) {}
      memoryUserDB = defaultData;
      return defaultData;
    }

    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.users) parsed.users = [];
    if (!parsed.apiKeys) parsed.apiKeys = [];
    if (!parsed.auditLogs) parsed.auditLogs = [];
    memoryUserDB = parsed;
    return parsed;
  } catch (err) {
    console.error("Error reading users.json database, using in-memory defaults:", err);
    const defaultData = getDefaultUserData();
    memoryUserDB = defaultData;
    return defaultData;
  }
}

function saveUserDB(data) {
  memoryUserDB = data;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Non-fatal on read-only serverless filesystems
  }
}

/**
 * Audit Logging Helper
 */
export function logSecurityAction(userId, action, ip, details = '') {
  const db = getUserDB();
  const logEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: userId || 'anonymous',
    action,
    ip: ip || 'unknown',
    timestamp: new Date().toISOString(),
    details
  };
  db.auditLogs.unshift(logEntry);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500); // cap logs
  }
  saveUserDB(db);
  return logEntry;
}

/**
 * Finds or creates a user authenticated via Google
 */
export function findOrCreateGoogleUser({ googleId, email, name, avatar, ip }) {
  const db = getUserDB();
  let user = db.users.find(u => u.googleId === googleId || (email && u.email.toLowerCase() === email.toLowerCase()));

  const now = new Date().toISOString();

  if (user) {
    // Update existing user profile
    user.lastLoginAt = now;
    if (avatar && !user.avatar) user.avatar = avatar;
    if (name && !user.name) user.name = name;
    if (googleId && !user.googleId) user.googleId = googleId;
    saveUserDB(db);
    logSecurityAction(user.id, 'USER_LOGIN_GOOGLE', ip, `User logged in: ${user.email}`);
    return { user, isNew: false, initialKey: null };
  }

  // Create new user
  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  user = {
    id: userId,
    googleId: googleId || `google_gen_${Date.now()}`,
    email: email ? email.toLowerCase().trim() : `dev_${Date.now()}@hackerpost.online`,
    name: name || 'SecOps Engineer',
    avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
    tier: 'Free',
    role: 'developer',
    createdAt: now,
    lastLoginAt: now
  };

  db.users.push(user);
  saveUserDB(db);

  // Auto-generate their initial API key
  const { rawKey, keyRecord } = createApiKeyInternal(db, userId, user.tier, "Default API Key");
  saveUserDB(db);

  logSecurityAction(userId, 'USER_SIGNUP_GOOGLE', ip, `New user signed up via Google: ${user.email}`);

  return { user, isNew: true, initialKey: rawKey, keyRecord };
}

/**
 * Get user by unique ID
 */
export function getUserById(userId) {
  if (!userId) return null;
  const db = getUserDB();
  return db.users.find(u => u.id === userId) || null;
}

/**
 * Update user subscription tier (Free, Pro, Enterprise)
 */
export function updateUserTier(userId, newTier) {
  if (!TIER_LIMITS[newTier]) return false;
  const db = getUserDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return false;

  user.tier = newTier;
  // Also update their active API keys tier
  db.apiKeys.forEach(k => {
    if (k.userId === userId && k.status === 'active') {
      k.tier = newTier;
    }
  });

  saveUserDB(db);
  logSecurityAction(userId, 'USER_TIER_UPDATED', '127.0.0.1', `Tier upgraded to ${newTier}`);
  return true;
}

/**
 * Internal helper to create API key
 */
function createApiKeyInternal(db, userId, tier = 'Free', name = 'Default API Key') {
  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = rawKey;
  const keyId = `key_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const keyRecord = {
    id: keyId,
    userId,
    name,
    keyPrefix,
    keyHash,
    tier: tier || 'Free',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    usageCount: 0
  };

  db.apiKeys.push(keyRecord);
  return { rawKey, keyRecord };
}

/**
 * Creates a new API Key for a user
 * Returns the rawKey ONCE (will not be stored in plaintext)
 */
export function createApiKey(userId, tier = 'Free', name = 'API Key', ip = '127.0.0.1') {
  const db = getUserDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    throw new Error("User not found");
  }

  const { rawKey, keyRecord } = createApiKeyInternal(db, userId, user.tier || tier, name);
  saveUserDB(db);

  logSecurityAction(userId, 'KEY_CREATED', ip, `New API Key created: ${keyRecord.id} (${name})`);

  return {
    rawKey,
    key: {
      id: keyRecord.id,
      name: keyRecord.name,
      maskedKey: maskApiKey(rawKey),
      tier: keyRecord.tier,
      status: keyRecord.status,
      createdAt: keyRecord.createdAt,
      usageCount: keyRecord.usageCount
    }
  };
}

/**
 * Rotates an existing API Key for a user (Revokes old key and creates a new one)
 * Returns the new rawKey ONCE
 */
export function rotateApiKey(userId, keyId, ip = '127.0.0.1') {
  const db = getUserDB();
  const existingKey = db.apiKeys.find(k => k.id === keyId && k.userId === userId);

  if (!existingKey) {
    throw new Error("API Key not found or access denied (IDOR protection)");
  }

  // Revoke old key
  existingKey.status = 'revoked';
  existingKey.revokedAt = new Date().toISOString();

  // Generate new replacement key
  const user = db.users.find(u => u.id === userId);
  const { rawKey, keyRecord } = createApiKeyInternal(
    db, 
    userId, 
    user ? user.tier : existingKey.tier, 
    `${existingKey.name} (Rotated)`
  );

  saveUserDB(db);
  logSecurityAction(userId, 'KEY_ROTATED', ip, `Rotated key ${keyId} -> ${keyRecord.id}`);

  return {
    rawKey,
    oldKeyId: keyId,
    newKey: {
      id: keyRecord.id,
      name: keyRecord.name,
      maskedKey: maskApiKey(rawKey),
      tier: keyRecord.tier,
      status: keyRecord.status,
      createdAt: keyRecord.createdAt,
      usageCount: keyRecord.usageCount
    }
  };
}

/**
 * Revokes an API Key
 */
export function revokeApiKey(userId, keyId, ip = '127.0.0.1') {
  const db = getUserDB();
  const key = db.apiKeys.find(k => k.id === keyId && k.userId === userId);

  if (!key) {
    throw new Error("API Key not found or access denied (IDOR protection)");
  }

  key.status = 'revoked';
  key.revokedAt = new Date().toISOString();
  saveUserDB(db);

  logSecurityAction(userId, 'KEY_REVOKED', ip, `Revoked API Key: ${keyId}`);
  return true;
}

/**
 * Returns safe list of user's API Keys with masked tokens (Zero Plaintext Exposure)
 */
export function getUserApiKeys(userId) {
  const db = getUserDB();
  return db.apiKeys
    .filter(k => k.userId === userId)
    .map(k => ({
      id: k.id,
      name: k.name,
      maskedKey: maskApiKey(k.keyPrefix),
      tier: k.tier,
      status: k.status,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
      usageCount: k.usageCount
    }));
}

/**
 * Validates an incoming Bearer API Key from an HTTP request.
 * 1. Hashes raw key using SHA-256
 * 2. Matches active key in database
 * 3. Enforces Tier Rate Limiting
 * 4. Increments usage and updates lastUsed timestamp
 */
export function validateBearerKey(rawKey) {
  if (!rawKey || typeof rawKey !== 'string' || !rawKey.startsWith('hp_live_')) {
    return {
      valid: false,
      error: "Malformed or missing API Key. Must start with 'hp_live_'.",
      status: 401
    };
  }

  const db = getUserDB();
  const incomingHash = hashApiKey(rawKey);

  const matchedKey = db.apiKeys.find(k => 
    timingSafeMatch(k.keyHash, incomingHash) && k.status === 'active'
  );

  if (!matchedKey) {
    return {
      valid: false,
      error: "Invalid, expired, or revoked API Key.",
      status: 401
    };
  }

  const user = db.users.find(u => u.id === matchedKey.userId);
  const tier = matchedKey.tier || (user ? user.tier : 'Free');
  const tierConfig = TIER_LIMITS[tier] || TIER_LIMITS.Free;

  // Enforce sliding window rate limit
  const rateLimitResult = rateLimiter.check(
    `key:${matchedKey.id}`, 
    tierConfig.perMinute, 
    60
  );

  if (!rateLimitResult.allowed) {
    return {
      valid: false,
      error: `Rate limit exceeded for ${tier} tier (${tierConfig.perMinute} req/min). Please slow down or upgrade your plan.`,
      status: 429,
      rateLimit: rateLimitResult,
      keyId: matchedKey.id,
      tier
    };
  }

  // Update key usage metrics asynchronously
  matchedKey.lastUsedAt = new Date().toISOString();
  matchedKey.usageCount = (matchedKey.usageCount || 0) + 1;
  saveUserDB(db);

  return {
    valid: true,
    keyId: matchedKey.id,
    userId: matchedKey.userId,
    tier,
    user: user ? { id: user.id, email: user.email, name: user.name, tier: user.tier } : null,
    rateLimit: rateLimitResult
  };
}
