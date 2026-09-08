import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SOCIAL_LOGS_FILE = path.join(DATA_DIR, 'socialLogs.json');

const X_HANDLE = process.env.X_ACCOUNT_HANDLE || '@HackerPost2';
const SITE_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hackerpost.online';

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
 * OAuth 1.0a Header Generator for Twitter API v2 (Zero Dependencies)
 */
function createOAuth1Header(method, url, oauthParams, consumerSecret, tokenSecret) {
  const sortedParams = Object.keys(oauthParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(oauthParams[key])}`)
    .join('&');

  const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  const allParams = { ...oauthParams, oauth_signature: signature };

  const headerParts = Object.keys(allParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(allParams[key])}"`);

  return `OAuth ${headerParts.join(', ')}`;
}

/**
 * Loads persistent social broadcast logs
 */
export function getSocialLogs() {
  if (!fs.existsSync(DATA_DIR)) {
    try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (_) {}
  }

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
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SOCIAL_LOGS_FILE, JSON.stringify(logs.slice(0, 100), null, 2), 'utf-8');
  } catch (_) {}
}

/**
 * Publishes or syndicates an article to X (@HackerPost2)
 */
export async function publishToX(article) {
  const tweetPayload = composeTweet(article);
  const now = new Date().toISOString();

  const apiKey = process.env.X_API_KEY || process.env.TWITTER_API_KEY;
  const apiSecret = process.env.X_API_SECRET || process.env.TWITTER_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN || process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_SECRET || process.env.TWITTER_ACCESS_SECRET;
  const bearerToken = process.env.X_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN;

  const hasCredentials = !!(apiKey && apiSecret && accessToken && accessSecret) || !!bearerToken;

  const logEntry = {
    id: `x_post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    articleId: article.id,
    articleTitle: article.title,
    handle: X_HANDLE,
    accountUrl: `https://x.com/${X_HANDLE.replace('@', '')}`,
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: tweetPayload.text })
      });

      const data = await res.json();
      if (res.ok && data?.data?.id) {
        logEntry.status = "published";
        logEntry.tweetId = data.data.id;
        logEntry.tweetUrl = `https://x.com/${X_HANDLE.replace('@', '')}/status/${data.data.id}`;
        logEntry.message = "Successfully broadcasted to X feed.";
      } else {
        logEntry.status = "error";
        logEntry.error = data?.detail || JSON.stringify(data);
      }
    } catch (err) {
      logEntry.status = "error";
      logEntry.error = err.message;
    }
  } else {
    // Verified Sandbox / Simulated Broadcast Mode
    logEntry.status = "simulated";
    logEntry.message = `Simulated syndication to ${X_HANDLE}. Provide X_API_KEY and X_ACCESS_TOKEN in .env for live automated posting.`;
    logEntry.tweetUrl = `https://x.com/${X_HANDLE.replace('@', '')}`;
  }

  // Save to persistent social logs
  const allLogs = getSocialLogs();
  allLogs.unshift(logEntry);
  saveSocialLogs(allLogs);

  return logEntry;
}
