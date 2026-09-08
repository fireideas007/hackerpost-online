import crypto from 'crypto';

// Secret key for HMAC signing of B2B session tokens (fallback for local development)
const SESSION_SECRET = process.env.B2B_SESSION_SECRET || 'hp_b2b_secret_session_key_2026_ciso_hardened_sig';

/**
 * Sliding Window Rate Limiter
 * Tracks request timestamps in memory per key/IP with automatic pruning.
 */
class SlidingWindowRateLimiter {
  constructor() {
    this.hits = new Map(); // key -> Array of timestamps in ms
  }

  /**
   * Checks if an identifier exceeds a rate limit.
   * @param {string} identifier - e.g. "ip:127.0.0.1" or "key:hp_live_abc123"
   * @param {number} maxRequests - Max allowed requests in window
   * @param {number} windowSeconds - Window duration in seconds
   * @returns {{ allowed: boolean, limit: number, remaining: number, resetTime: number, retryAfter: number }}
   */
  check(identifier, maxRequests = 60, windowSeconds = 60) {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const windowStart = now - windowMs;

    let timestamps = this.hits.get(identifier) || [];
    
    // Prune timestamps older than the sliding window
    timestamps = timestamps.filter(ts => ts > windowStart);

    const resetTime = Math.ceil((now + windowMs) / 1000);
    const retryAfter = timestamps.length > 0 ? Math.ceil((timestamps[0] + windowMs - now) / 1000) : windowSeconds;

    if (timestamps.length >= maxRequests) {
      this.hits.set(identifier, timestamps);
      return {
        allowed: false,
        limit: maxRequests,
        remaining: 0,
        resetTime,
        retryAfter: Math.max(1, retryAfter)
      };
    }

    timestamps.push(now);
    this.hits.set(identifier, timestamps);

    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - timestamps.length,
      resetTime,
      retryAfter: 0
    };
  }

  /**
   * Reset rate limiter for a specific key or all keys (useful in tests)
   */
  reset(identifier) {
    if (identifier) {
      this.hits.delete(identifier);
    } else {
      this.hits.clear();
    }
  }
}

export const rateLimiter = new SlidingWindowRateLimiter();

/**
 * Rate limit tiers configuration (requests per minute)
 */
export const TIER_LIMITS = {
  Free: { perMinute: 20, monthlyQuota: 500 },
  Pro: { perMinute: 120, monthlyQuota: 50000 },
  Enterprise: { perMinute: 1000, monthlyQuota: 1000000 },
  Auth: { perMinute: 10, monthlyQuota: 1000 }
};

/**
 * Generates a cryptographically strong random API Key
 * Format: hp_live_<hex string 48 chars>
 */
export function generateApiKey() {
  const randomHex = crypto.randomBytes(24).toString('hex');
  return `hp_live_${randomHex}`;
}

/**
 * Computes a deterministic SHA-256 hash of an API key for safe database storage.
 * The raw key is never stored.
 */
export function hashApiKey(rawKey) {
  if (!rawKey || typeof rawKey !== 'string') return '';
  return crypto.createHash('sha256').update(rawKey.trim()).digest('hex');
}

/**
 * Masks an API key for safe UI display (e.g. hp_live_7f98...d0e1f)
 */
export function maskApiKey(rawKeyOrPrefix) {
  if (!rawKeyOrPrefix) return '••••••••••••••••';
  if (rawKeyOrPrefix.length <= 16) return rawKeyOrPrefix;
  return `${rawKeyOrPrefix.slice(0, 11)}...${rawKeyOrPrefix.slice(-5)}`;
}

/**
 * Timing-safe string comparison to prevent timing side-channel attacks
 */
export function timingSafeMatch(strA, strB) {
  if (typeof strA !== 'string' || typeof strB !== 'string') return false;
  const bufA = Buffer.from(strA, 'utf8');
  const bufB = Buffer.from(strB, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Generates a signed, tamper-proof session token for authenticated users
 */
export function signSessionToken(payload, expiresInMs = 7 * 24 * 60 * 60 * 1000) {
  const exp = Date.now() + expiresInMs;
  const data = JSON.stringify({ ...payload, exp });
  const encodedData = Buffer.from(data).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedData)
    .digest('base64url');

  return `${encodedData}.${signature}`;
}

/**
 * Verifies and decodes a signed session token
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;

  const [encodedData, signature] = token.split('.');
  if (!encodedData || !signature) return null;

  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedData)
    .digest('base64url');

  // Use timing-safe equality check on signature
  if (!timingSafeMatch(signature, expectedSignature)) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(encodedData, 'base64url').toString('utf8');
    const payload = JSON.parse(jsonStr);

    if (!payload.exp || Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch (_) {
    return null;
  }
}

/**
 * XSS & Input Sanitization:
 * Strips script tags, HTML event handlers, javascript: pseudo-protocols, and escapes harmful entities.
 */
export function sanitizeInput(input, maxLength = 10000) {
  if (typeof input !== 'string') return '';

  let clean = input.slice(0, maxLength);

  // Remove script tags and contents
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove dangerous HTML tags
  clean = clean.replace(/<\/?(iframe|object|embed|applet|meta|link|style|base|form|input)[^>]*>/gi, '');

  // Remove inline event handlers (e.g. onerror=, onclick=, onload=)
  clean = clean.replace(/on\w+\s*=\s*(['"]).*?\1/gi, '');
  clean = clean.replace(/on\w+\s*=\s*[^ >]+/gi, '');

  // Remove javascript: URLs
  clean = clean.replace(/javascript\s*:/gi, 'blocked:');

  // Escape dangerous characters to prevent HTML/XSS injection in reflection
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return clean.trim();
}

/**
 * Unescapes sanitized input when clean plain text is needed for processing
 */
export function unescapeInput(sanitized) {
  if (typeof sanitized !== 'string') return '';
  return sanitized
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

/**
 * IDOR (Insecure Direct Object Reference) Protection:
 * Asserts that the authenticated caller has ownership of the target resource.
 */
export function assertResourceOwnership(authenticatedUserId, resourceOwnerId) {
  if (!authenticatedUserId || !resourceOwnerId) {
    return false;
  }
  return authenticatedUserId.toString() === resourceOwnerId.toString();
}

/**
 * Extracts Client IP address from request headers
 */
export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
