import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { updateArticleSocialMetadata } from './newsStore.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'twitterConfig.json');
const SOCIAL_LOGS_FILE = path.join(DATA_DIR, 'socialLogs.json');

const DEFAULT_HANDLE = '@HackerPost2';
const SITE_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hackerpost.online';

/**
 * Strict RFC 3986 percent-encoding required for OAuth 1.0a (RFC 5849)
 */
export function rfc3986(str) {
  return encodeURIComponent(String(str ?? '')).replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

/**
 * Ensures data directory exists
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (_) {}
  }
}

/**
 * Loads raw stored Twitter configuration from file
 */
function loadStoredConfig() {
  ensureDataDir();
  if (!fs.existsSync(CONFIG_FILE)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

/**
 * Gets Twitter configuration with intelligent environment variable fallbacks.
 * Accommodates all common naming conventions from .env or .env.example.
 */
export function getTwitterConfig() {
  const stored = loadStoredConfig() || {};

  const apiKey = (
    stored.apiKey ||
    process.env.X_API_KEY ||
    process.env.TWITTER_API_KEY ||
    ''
  ).trim();

  const apiSecret = (
    stored.apiSecret ||
    process.env.X_API_KEY_SECRET ||
    process.env.X_API_SECRET ||
    process.env.TWITTER_API_SECRET ||
    ''
  ).trim();

  const accessToken = (
    stored.accessToken ||
    process.env.X_ACCESS_TOKEN ||
    process.env.TWITTER_ACCESS_TOKEN ||
    ''
  ).trim();

  const accessSecret = (
    stored.accessSecret ||
    process.env.X_ACCESS_TOKEN_SECRET ||
    process.env.X_ACCESS_SECRET ||
    process.env.TWITTER_ACCESS_SECRET ||
    ''
  ).trim();

  const bearerToken = (
    stored.bearerToken ||
    process.env.X_BEARER_TOKEN ||
    process.env.TWITTER_BEARER_TOKEN ||
    ''
  ).trim();

  let handle = (
    stored.handle ||
    process.env.X_ACCOUNT_HANDLE ||
    process.env.TWITTER_HANDLE ||
    DEFAULT_HANDLE
  ).trim();

  if (handle && !handle.startsWith('@')) {
    handle = `@${handle}`;
  }

  const autoPost = typeof stored.autoPost === 'boolean' ? stored.autoPost : true;
  const isLiveConfigured = !!(apiKey && apiSecret && accessToken && accessSecret);

  return {
    handle,
    apiKey,
    apiSecret,
    accessToken,
    accessSecret,
    bearerToken,
    autoPost,
    isLiveConfigured,
    isVerified: !!stored.isVerified,
    verifiedAt: stored.verifiedAt || null,
    accountInfo: stored.accountInfo || null
  };
}

/**
 * Returns a sanitized/masked configuration safe for client-side consumption
 */
export function getMaskedTwitterConfig() {
  const cfg = getTwitterConfig();

  return {
    handle: cfg.handle,
    autoPost: cfg.autoPost,
    isLiveConfigured: cfg.isLiveConfigured,
    isVerified: cfg.isVerified,
    verifiedAt: cfg.verifiedAt,
    accountInfo: cfg.accountInfo,
    mode: cfg.isLiveConfigured ? 'live' : 'simulated',
    hasApiKey: !!cfg.apiKey,
    apiKeySnippet: cfg.apiKey ? `${cfg.apiKey.slice(0, 4)}...${cfg.apiKey.slice(-3)}` : '',
    hasApiSecret: !!cfg.apiSecret,
    hasAccessToken: !!cfg.accessToken,
    accessTokenSnippet: cfg.accessToken ? `${cfg.accessToken.slice(0, 4)}...${cfg.accessToken.slice(-3)}` : '',
    hasAccessSecret: !!cfg.accessSecret,
    hasBearerToken: !!cfg.bearerToken,
    accountUrl: `https://x.com/${cfg.handle.replace('@', '')}`
  };
}

/**
 * Saves Twitter configuration updates to persistent disk
 */
export function saveTwitterConfig(updates = {}) {
  ensureDataDir();
  const current = loadStoredConfig() || {};

  // Clean and preserve existing secrets if user passes placeholders or empty string
  const cleanField = (newVal, oldVal) => {
    if (newVal === undefined || newVal === null) return oldVal;
    const str = String(newVal).trim();
    if (!str || str.includes('...')) return oldVal; // Don't overwrite with masked value
    return str;
  };

  let newHandle = updates.handle ? String(updates.handle).trim() : current.handle;
  if (newHandle) {
    if (!newHandle.startsWith('@')) newHandle = `@${newHandle}`;
  }

  const updated = {
    ...current,
    handle: newHandle || current.handle || DEFAULT_HANDLE,
    apiKey: cleanField(updates.apiKey, current.apiKey),
    apiSecret: cleanField(updates.apiSecret, current.apiSecret),
    accessToken: cleanField(updates.accessToken, current.accessToken),
    accessSecret: cleanField(updates.accessSecret, current.accessSecret),
    bearerToken: cleanField(updates.bearerToken, current.bearerToken),
    autoPost: typeof updates.autoPost === 'boolean' ? updates.autoPost : (current.autoPost ?? true),
    isVerified: typeof updates.isVerified === 'boolean' ? updates.isVerified : (current.isVerified ?? false),
    verifiedAt: updates.verifiedAt !== undefined ? updates.verifiedAt : current.verifiedAt,
    accountInfo: updates.accountInfo !== undefined ? updates.accountInfo : current.accountInfo
  };

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return getMaskedTwitterConfig();
}

/**
 * OAuth 1.0a Header Generator for Twitter API v2 (RFC 5849 compliant, zero external dependencies)
 */
export function createOAuth1Header(method, url, oauthParams, consumerSecret, tokenSecret) {
  const urlObj = new URL(url);
  const baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;

  // Merge any query parameters into signature params
  const allSignatureParams = { ...oauthParams };
  urlObj.searchParams.forEach((val, key) => {
    allSignatureParams[key] = val;
  });

  const sortedParams = Object.keys(allSignatureParams)
    .sort()
    .map(key => `${rfc3986(key)}=${rfc3986(allSignatureParams[key])}`)
    .join('&');

  const baseString = `${method.toUpperCase()}&${rfc3986(baseUrl)}&${rfc3986(sortedParams)}`;
  const signingKey = `${rfc3986(consumerSecret)}&${rfc3986(tokenSecret)}`;

  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  const headerParams = { ...oauthParams, oauth_signature: signature };

  const headerParts = Object.keys(headerParams)
    .sort()
    .map(key => `${rfc3986(key)}="${rfc3986(headerParams[key])}"`);

  return `OAuth ${headerParts.join(', ')}`;
}

/**
 * Tests credentials directly against Twitter API v2 (GET /2/users/me)
 * Verifies authenticity, retrieves account username/id, and updates verified status.
 */
export async function verifyTwitterConnection(explicitCredentials = null) {
  const cfg = explicitCredentials ? { ...getTwitterConfig(), ...explicitCredentials } : getTwitterConfig();

  const apiKey = cfg.apiKey;
  const apiSecret = cfg.apiSecret;
  const accessToken = cfg.accessToken;
  const accessSecret = cfg.accessSecret;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return {
      success: false,
      error: 'Missing required OAuth 1.0a credentials. Please provide API Key, API Secret, Access Token, and Access Token Secret.',
      configured: false
    };
  }

  try {
    const endpoint = 'https://api.twitter.com/2/users/me';
    const oauthParams = {
      oauth_consumer_key: apiKey,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: accessToken,
      oauth_version: '1.0'
    };

    const authHeader = createOAuth1Header('GET', endpoint, oauthParams, apiSecret, accessSecret);

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'User-Agent': 'HackerPost-XPublisher/2.0'
      }
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data?.data?.id) {
      const liveUser = data.data;
      const detectedHandle = `@${liveUser.username}`;

      // Persist verified state and updated handle
      saveTwitterConfig({
        handle: detectedHandle,
        isVerified: true,
        verifiedAt: new Date().toISOString(),
        accountInfo: liveUser
      });

      return {
        success: true,
        handle: detectedHandle,
        user: liveUser,
        message: `Successfully authenticated with X as ${detectedHandle} (${liveUser.name}).`
      };
    } else {
      const errorMsg = data?.detail || data?.title || (Array.isArray(data?.errors) ? data.errors.map(e => e.message).join(', ') : `HTTP ${res.status}: Authentication failed`);

      // Update verification failure in store
      saveTwitterConfig({
        isVerified: false,
        verifiedAt: null
      });

      return {
        success: false,
        error: errorMsg,
        statusCode: res.status,
        details: data
      };
    }
  } catch (err) {
    return {
      success: false,
      error: `Network error connecting to Twitter API: ${err.message}`
    };
  }
}

/**
 * Generates category-specific and CVE-specific hashtags for cybersecurity news
 */
export function generateHashtags(article) {
  const tags = new Set(['#CyberSecurity', '#InfoSec', '#HackerPost']);

  // Extract CVE hashtags
  if (article.cve) {
    const cveTag = '#' + article.cve.replace(/[^a-zA-Z0-9]/g, '');
    tags.add(cveTag);
    tags.add('#0day');
    tags.add('#Vulnerability');
  }

  const category = (article.category || '').toLowerCase();
  const title = (article.title || '').toLowerCase();
  const content = (article.content || '').toLowerCase();

  // 1. AI Benchmarks
  if (category.includes('benchmark') || category.includes('ai') || title.includes('cyberseceval') || title.includes('sonnet') || title.includes('gpt')) {
    tags.add('#AISecurity');
    tags.add('#LLM');
    tags.add('#GenAI');
    tags.add('#CyberSecEval');
  }
  // 2. M&A
  else if (category.includes('m&a') || title.includes('acquisition') || title.includes('acquires') || title.includes('m&a deal')) {
    tags.add('#MandA');
    tags.add('#Acquisition');
    tags.add('#TechDeals');
    tags.add('#EnterpriseSecurity');
  }
  // 3. Startups & Funding
  else if (category.includes('startup') || category.includes('sectech') || title.includes('series ') || title.includes('secures $') || title.includes('funding')) {
    tags.add('#SecTech');
    tags.add('#Startups');
    tags.add('#VentureCapital');
    tags.add('#FundingAlert');
  }
  // 4. Exploits & Zero-Days
  else if (category.includes('exploit') || category.includes('zero-day') || title.includes('zero-day') || title.includes('rce')) {
    tags.add('#ZeroDay');
    tags.add('#Exploit');
    tags.add('#RCE');
    tags.add('#PatchNow');
  }
  // 5. Ransomware
  else if (category.includes('ransomware') || title.includes('ransomware') || content.includes('encrypt')) {
    tags.add('#Ransomware');
    tags.add('#Malware');
    tags.add('#ThreatIntel');
    tags.add('#IncidentResponse');
  }

  // Always include high-authority CISO tags
  tags.add('#CISO');

  return Array.from(tags).slice(0, 6); // Optimal 4-6 hashtags
}

/**
 * Composes an optimized, high-engagement X post (tweet) strictly within 280 characters
 */
export function composeTweet(article) {
  const category = (article.category || '').toLowerCase();
  const isBenchmark = category.includes('benchmark') || category.includes('ai') || (article.title && article.title.toLowerCase().includes('benchmark'));
  const isMA = category.includes('m&a') || (article.title && article.title.toLowerCase().includes('acquisition'));
  const isStartup = (category.includes('startup') || category.includes('sectech')) && !isMA && !isBenchmark;
  const isCritical = article.severity === 'Critical' || (article.title && article.title.toLowerCase().includes('critical'));

  let prefix = '🛡️ CISO ADVISORY:';
  if (isBenchmark) prefix = '📊 AI SEC BENCHMARK:';
  else if (isMA) prefix = '💼 M&A CONSOLIDATION:';
  else if (isStartup) prefix = '🚀 SECTECH DEAL:';
  else if (isCritical) prefix = '🚨 CRITICAL 0-DAY ALERT:';

  const rawSlug = article.slug || article.id;
  const cleanSlug = rawSlug.length > 70 ? (rawSlug.slice(0, 70).replace(/-[^-]*$/, '') || rawSlug.slice(0, 70)) : rawSlug;
  const articleUrl = `${SITE_BASE_URL}/news/${cleanSlug}`;

  const hashtags = generateHashtags(article);

  // Format key callout (e.g. funding amount, CVE, or affected product)
  let callout = '';
  if (article.cve) {
    callout = ` [${article.cve}]`;
  } else if (article.fundingAmount && (isStartup || isMA)) {
    callout = ` (${article.fundingAmount})`;
  }

  // Raw title clean up
  let cleanTitle = (article.title || 'Breaking Security Advisory')
    .replace(/^Security Advisory:\s*/i, '')
    .replace(/^SecTech Venture:\s*/i, '')
    .replace(/^M&A Deal:\s*/i, '')
    .replace(/^Benchmark Report:\s*/i, '')
    .replace(/^Executive Intelligence:\s*/i, '')
    .replace(/^Auth Bypass Bulletin:\s*/i, '')
    .replace(/^Ivanti Defense Alert:\s*/i, '')
    .replace(/^Supply Chain Advisory:\s*/i, '')
    .replace(/^Enterprise Ecosystems Defense Alert:\s*/i, '')
    .trim();

  // Dynamic iterative length fitting strictly <= 280 characters
  let currentTags = [...hashtags];
  let tweetText = `${prefix} ${cleanTitle}${callout}\n\n${currentTags.join(' ')}\n\n🔗 ${articleUrl}`;
  
  while (tweetText.length > 280 && cleanTitle.length > 25) {
    cleanTitle = cleanTitle.slice(0, cleanTitle.length - 5).trim();
    tweetText = `${prefix} ${cleanTitle}...${callout}\n\n${currentTags.join(' ')}\n\n🔗 ${articleUrl}`;
  }

  while (tweetText.length > 280 && currentTags.length > 3) {
    currentTags.pop();
    tweetText = `${prefix} ${cleanTitle}...${callout}\n\n${currentTags.join(' ')}\n\n🔗 ${articleUrl}`;
  }

  while (tweetText.length > 280 && cleanTitle.length > 10) {
    cleanTitle = cleanTitle.slice(0, cleanTitle.length - 4).trim();
    tweetText = `${prefix} ${cleanTitle}...${callout}\n\n${currentTags.join(' ')}\n\n🔗 ${articleUrl}`;
  }

  return {
    text: tweetText,
    charCount: tweetText.length,
    hashtags: currentTags,
    articleUrl,
    prefix
  };
}

/**
 * Loads persistent social broadcast logs
 */
export function getSocialLogs() {
  ensureDataDir();
  if (!fs.existsSync(SOCIAL_LOGS_FILE)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(SOCIAL_LOGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

/**
 * Saves social broadcast logs
 */
function saveSocialLogs(logs) {
  ensureDataDir();
  try {
    fs.writeFileSync(SOCIAL_LOGS_FILE, JSON.stringify(logs.slice(0, 100), null, 2), 'utf-8');
  } catch (_) {}
}

/**
 * Publishes or syndicates an article to X with dynamic configuration & idempotency guard.
 *
 * @param {Object} article - Article to syndicate
 * @param {Object} options - Options ({ force: boolean })
 */
export async function publishToX(article, options = {}) {
  const config = getTwitterConfig();
  const handle = config.handle || DEFAULT_HANDLE;
  const cleanHandle = handle.replace('@', '');

  // Idempotency check: Don't post twice if already published, unless explicitly forced
  if (!options.force && article.tweetId && article.xStatus === 'published') {
    return {
      status: 'already_published',
      tweetId: article.tweetId,
      tweetUrl: article.tweetUrl,
      handle,
      message: `Article already broadcasted to X (${handle}).`
    };
  }

  const tweetPayload = composeTweet(article);
  const now = new Date().toISOString();

  const apiKey = config.apiKey;
  const apiSecret = config.apiSecret;
  const accessToken = config.accessToken;
  const accessSecret = config.accessSecret;
  const bearerToken = config.bearerToken;

  const hasCredentials = config.isLiveConfigured || !!bearerToken;

  const logEntry = {
    id: `x_post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    articleId: article.id,
    articleTitle: article.title,
    handle,
    accountUrl: `https://x.com/${cleanHandle}`,
    tweetText: tweetPayload.text,
    charCount: tweetPayload.charCount,
    hashtags: tweetPayload.hashtags,
    articleUrl: tweetPayload.articleUrl,
    timestamp: now,
    status: hasCredentials ? "pending" : "simulated"
  };

  // If live credentials are provided, transmit directly to Twitter API v2
  if (hasCredentials) {
    try {
      const endpoint = 'https://api.twitter.com/2/tweets';
      let authHeader = '';

      if (apiKey && apiSecret && accessToken && accessSecret) {
        const oauthParams = {
          oauth_consumer_key: apiKey,
          oauth_nonce: crypto.randomBytes(16).toString('hex'),
          oauth_signature_method: 'HMAC-SHA1',
          oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
          oauth_token: accessToken,
          oauth_version: '1.0'
        };
        authHeader = createOAuth1Header('POST', endpoint, oauthParams, apiSecret, accessSecret);
      } else {
        authHeader = `Bearer ${bearerToken}`;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'User-Agent': 'HackerPost-XPublisher/2.0'
        },
        body: JSON.stringify({ text: tweetPayload.text })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.data?.id) {
        logEntry.status = "published";
        logEntry.tweetId = data.data.id;
        logEntry.tweetUrl = `https://x.com/${cleanHandle}/status/${data.data.id}`;
        logEntry.message = `Successfully broadcasted to X (${handle}).`;
      } else {
        logEntry.status = "error";
        logEntry.error = data?.detail || data?.title || (Array.isArray(data?.errors) ? data.errors.map(e => e.message).join(', ') : `HTTP ${res.status} error`);
      }
    } catch (err) {
      logEntry.status = "error";
      logEntry.error = err.message;
    }
  } else {
    // Verified Sandbox / Simulated Broadcast Mode
    logEntry.status = "simulated";
    logEntry.message = `Simulated syndication to ${handle}. Connect Twitter API keys in Admin settings for live posting.`;
    logEntry.tweetUrl = `https://x.com/${cleanHandle}`;
  }

  // Update article record in newsStore to track syndication
  if (article.id) {
    updateArticleSocialMetadata(article.id, {
      tweetId: logEntry.tweetId || null,
      tweetUrl: logEntry.tweetUrl || null,
      xStatus: logEntry.status,
      xSyndicatedAt: now,
      handle
    });
  }

  // Save to persistent social logs
  const allLogs = getSocialLogs();
  allLogs.unshift(logEntry);
  saveSocialLogs(allLogs);

  return logEntry;
}
