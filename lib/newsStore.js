import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Mock data to seed the database if it doesn't exist
const SEED_PROVIDERS = [
  { id: "prov-cisa", name: "Cybersecurity & Infrastructure Security Agency (CISA)", category: "Advisories", trustScore: 99, verifiedUrl: "https://www.cisa.gov/resources-tools/groups-lists/alerts" },
  { id: "prov-nvd", name: "National Vulnerability Database (NVD)", category: "Advisories", trustScore: 98, verifiedUrl: "https://nvd.nist.gov" },
  { id: "prov-github", name: "GitHub Advisory Database", category: "Exploits", trustScore: 95, verifiedUrl: "https://github.com/advisories" },
  { id: "prov-crowdstrike", name: "CrowdStrike Intel", category: "Data Breaches", trustScore: 94, verifiedUrl: "https://www.crowdstrike.com/blog/category/threat-intel/" },
  { id: "prov-sentinel", name: "SentinelOne Threat Labs", category: "Ransomware", trustScore: 96, verifiedUrl: "https://www.sentinelone.com/labs/" }
];

const SEED_RAW_ARTICLES = [
  {
    id: "raw-1",
    providerId: "prov-github",
    title: "Critical Remote Code Execution Vulnerability in OpenSSH (CVE-2026-3829)",
    content: "A regression vulnerability was discovered in the OpenSSH server (sshd) that allows unauthenticated remote code execution on glibc-based Linux systems. This vulnerability stems from a race condition in sshd's signal handler during authentication timeouts. Security researchers successfully developed a working exploit payload that executes shellcode via socket buffers.\n\n### Exploitation Vector & Code\nAn attacker can trigger this vulnerability by sending a carefully timed sequence of connection requests. Under unsafe conditions, the sshd signal handler fires when the connection times out, running in a privileged context. The following hex code block triggers socket buffer heap alignment:\n\n```c\n// Raw exploit payload block (Simulated)\nchar shellcode[] = \"\\x48\\x31\\xc0\\x48\\x89\\xc2\\x48\\x89\\xc6\\x48\\x8d\\x3d\\x04\\x00\\x00\\x00\\x04\\x3b\\x0f\\x05/bin/sh\";\nvoid exec_payload() {\n    // Malicious shellcode execution logic\n    uintptr_t target_addr = 0xffffffff81002040;\n    asm(\"jmp *%0\" : : \"r\"(target_addr));\n}\n```",
    publishedAt: "2026-08-11T14:30:00Z",
    sourceUrl: "https://github.com/advisories/GHSA-openssh-rce-2026",
    category: "Exploits",
    defaultZipCode: "CVE-2026-3829",
    severity: "Critical",
    cve: "CVE-2026-3829",
    affectedProduct: "OpenSSH Server 8.5p1 - 9.7p1",
    disclosureStatus: "Patched"
  },
  {
    id: "raw-2",
    providerId: "prov-sentinel",
    title: "Active Ransomware Campaign Targeting Enterprise VMware ESXi Servers",
    content: "Threat analysts have identified a coordinated ransomware campaign targeting unpatched VMware ESXi systems. The threat group, tracked as Storm-1204, leverages compromised administrator credentials to access the ESXi command-line interface. Once inside, they execute Python-based payload modules that encrypt virtual machine disk images (.vmdk files).\n\n### Mitigation Guidance\nVerify that SSH access is disabled on all ESXi hosts. Upgrade hypervisors to ESXi 8.0 Update 3 or later. Limit vCenter Server access to trusted internal IP ranges.",
    publishedAt: "2026-08-12T08:15:00Z",
    sourceUrl: "https://www.sentinelone.com/labs/active-vmware-ransomware-analysis",
    category: "Ransomware",
    defaultZipCode: "CVE-2026-1104",
    severity: "High",
    cve: "CVE-2026-1104",
    affectedProduct: "VMware ESXi 7.0 & 8.0",
    disclosureStatus: "Mitigated"
  },
  {
    id: "raw-3",
    providerId: "prov-nvd",
    title: "Zero-Day Exploit Disclosed in Windows Kernel Local Privilege Escalation (CVE-2026-9912)",
    content: "Microsoft has disclosed a local privilege escalation zero-day vulnerability in the Windows Kernel (CVE-2026-9912). The flaw resides in the input validation checks of desktop window manager API endpoints. A local attacker can trigger double-free memory corruption to execute arbitrary code as SYSTEM.\n\n### Proof of Concept (PoC) Details\nThe vulnerability can be triggered from low-integrity sandboxes. The PoC uses direct kernel handle allocations:\n\n```cpp\n// Windows handle allocation PoC\nHANDLE hDwm = DwmGetWindowHandle(0x1337);\nif (hDwm == INVALID_HANDLE_VALUE) {\n    exit(1);\n}\n```",
    publishedAt: "2026-08-10T05:00:00Z",
    sourceUrl: "https://nvd.nist.gov/vuln/detail/CVE-2026-9912",
    category: "Zero-Days",
    defaultZipCode: "CVE-2026-9912",
    severity: "High",
    cve: "CVE-2026-9912",
    affectedProduct: "Windows 11 & Windows Server 2025",
    disclosureStatus: "Disclosed"
  }
];

const SEED_PUBLISHED_ARTICLES = [
  {
    id: "pub-1",
    rawId: "raw-1",
    providerName: "GitHub Advisory Database",
    originalTitle: "Critical Remote Code Execution Vulnerability in OpenSSH (CVE-2026-3829)",
    title: "Critical RCE Regression in OpenSSH (sshd) Patched Globally",
    content: "# Security Advisory: OpenSSH Remote Code Execution (CVE-2026-3829)\n\nA critical regression vulnerability was discovered in the OpenSSH server (`sshd`) that allows unauthenticated remote code execution on glibc-based Linux systems. This vulnerability stems from a race condition in `sshd`'s signal handler during authentication timeouts.\n\n## Technical Details\n\nWhen a client fails to authenticate within `LoginGraceTime` (default 120 seconds), `sshd`'s SIGALRM handler is invoked asynchronously. This handler calls various non-async-signal-safe functions (like `syslog()`), leading to heap corruption. An attacker can exploit this condition to execute arbitrary binary payloads.\n\n## Exploit Code Signature\n\n```c\n// Raw exploit payload (Simulated shellcode)\nchar shellcode[] = \"\\x48\\x31\\xc0\\x48\\x89\\xc2\\x48\\x89\\xc6\\x48\\x8d\\x3d\\x04\\x00\\x00\\x00\\x04\\x3b\\x0f\\x05/bin/sh\";\nvoid trigger_race() {\n    // Signals sshd heap realignment\n    syslog(LOG_ERR, \"Heap corruption triggered\");\n}\n```\n\n## Remediation\n\nUpgrade your OpenSSH instances to version **9.8p1** or later. If upgrades are not immediately possible, mitigate this issue by setting `LoginGraceTime 0` in your `sshd_config` file, which disables the timeout handler but may lead to denial-of-service exposure.\n\n---\n\n*This security bulletin was compiled using AI by cross-referencing verified primary updates. Original advisory sourced from **GitHub Advisory Database** (https://github.com/advisories/GHSA-openssh-rce-2026).* \n\n*Disclosure timeline: 2026-08-01: Reported; 2026-08-05: Patch released; 2026-08-11: Public advisory published.*",
    category: "Exploits",
    location: "CVE-2026-3829",
    publishedAt: "2026-08-11T16:00:00Z",
    sourceUrl: "https://github.com/advisories/GHSA-openssh-rce-2026",
    similarityScore: 12,
    views: 456,
    severity: "Critical",
    cve: "CVE-2026-3829",
    affectedProduct: "OpenSSH Server 8.5p1 - 9.7p1",
    disclosureStatus: "Patched",
    disclosureDate: "2026-08-11",
    versions: [
      {
        version: 1,
        timestamp: "2026-08-11T16:00:00.000Z",
        title: "Critical RCE Regression in OpenSSH (sshd) Discovered",
        content: "# Security Advisory: OpenSSH Remote Code Execution (CVE-2026-3829)\n\nA critical regression vulnerability was discovered in the OpenSSH server (`sshd`) that allows unauthenticated remote code execution on glibc-based Linux systems."
      },
      {
        version: 2,
        timestamp: "2026-08-12T10:00:00.000Z",
        title: "Critical RCE Regression in OpenSSH (sshd) Patched Globally",
        content: "# Security Advisory: OpenSSH Remote Code Execution (CVE-2026-3829)\n\nA critical regression vulnerability was discovered in the OpenSSH server (`sshd`) that allows unauthenticated remote code execution on glibc-based Linux systems. This vulnerability stems from a race condition in `sshd`'s signal handler during authentication timeouts.\n\n## Technical Details\n\nWhen a client fails to authenticate within `LoginGraceTime` (default 120 seconds), `sshd`'s SIGALRM handler is invoked asynchronously. This handler calls various non-async-signal-safe functions (like `syslog()`), leading to heap corruption. An attacker can exploit this condition to execute arbitrary binary payloads.\n\n## Exploit Code Signature\n\n```c\n// Raw exploit payload (Simulated shellcode)\nchar shellcode[] = \"\\x48\\x31\\xc0\\x48\\x89\\xc2\\x48\\x89\\xc6\\x48\\x8d\\x3d\\x04\\x00\\x00\\x00\\x04\\x3b\\x0f\\x05/bin/sh\";\nvoid trigger_race() {\n    // Signals sshd heap realignment\n    syslog(LOG_ERR, \"Heap corruption triggered\");\n}\n```\n\n## Remediation\n\nUpgrade your OpenSSH instances to version **9.8p1** or later. If upgrades are not immediately possible, mitigate this issue by setting `LoginGraceTime 0` in your `sshd_config` file, which disables the timeout handler but may lead to denial-of-service exposure.\n\n---\n\n*This security bulletin was compiled using AI by cross-referencing verified primary updates. Original advisory sourced from **GitHub Advisory Database** (https://github.com/advisories/GHSA-openssh-rce-2026).* \n\n*Disclosure timeline: 2026-08-01: Reported; 2026-08-05: Patch released; 2026-08-11: Public advisory published.*"
      }
    ]
  }
];

// Helper to guarantee database initialization
function getDB() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(DB_FILE)) {
    const defaultData = {
      providers: SEED_PROVIDERS,
      rawArticles: SEED_RAW_ARTICLES,
      publishedArticles: SEED_PUBLISHED_ARTICLES,
      searchLogs: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }

  try {
    const rawData = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(rawData);
    if (!parsed.searchLogs) parsed.searchLogs = [];
    if (!parsed.providers || parsed.providers.length === 0 || parsed.providers[0].id === 'prov-mta') {
      // Re-seed if old hyperlocal database detected
      parsed.providers = SEED_PROVIDERS;
      parsed.rawArticles = SEED_RAW_ARTICLES;
      parsed.publishedArticles = SEED_PUBLISHED_ARTICLES;
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch (err) {
    console.error("Error reading database file, resetting to defaults", err);
    const defaultData = {
      providers: SEED_PROVIDERS,
      rawArticles: SEED_RAW_ARTICLES,
      publishedArticles: SEED_PUBLISHED_ARTICLES,
      searchLogs: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
}

function saveDB(data) {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Store Functions
export function getProviders() {
  const db = getDB();
  return db.providers;
}

export function getRawArticles() {
  const db = getDB();
  // Attach provider info
  return db.rawArticles.map(art => {
    const provider = db.providers.find(p => p.id === art.providerId);
    return {
      ...art,
      providerName: provider ? provider.name : "Unknown Provider",
      providerTrustScore: provider ? provider.trustScore : 50
    };
  });
}

export function getRawArticleById(id) {
  const db = getDB();
  const art = db.rawArticles.find(a => a.id === id);
  if (!art) return null;
  const provider = db.providers.find(p => p.id === art.providerId);
  return {
    ...art,
    providerName: provider ? provider.name : "Unknown Provider",
    providerTrustScore: provider ? provider.trustScore : 50
  };
}

export function logSearch(term) {
  if (!term || typeof term !== "string") return;
  const cleanTerm = term.trim().toLowerCase();
  if (cleanTerm.length < 2) return;
  
  const db = getDB();
  if (!db.searchLogs) db.searchLogs = [];
  
  db.searchLogs.push({
    term: cleanTerm,
    timestamp: new Date().toISOString()
  });
  
  saveDB(db);
}

export function getTrendingSearches() {
  const db = getDB();
  if (!db.searchLogs) return [];
  
  const counts = {};
  db.searchLogs.forEach(log => {
    const t = log.term.toUpperCase();
    counts[t] = (counts[t] || 0) + 1;
  });
  
  return Object.entries(counts)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export function seedSearchLogs() {
  const db = getDB();
  db.searchLogs = [
    { term: "CVE-2026-3829", timestamp: new Date().toISOString() },
    { term: "OpenSSH", timestamp: new Date().toISOString() },
    { term: "VMware", timestamp: new Date().toISOString() },
    { term: "Ransomware", timestamp: new Date().toISOString() },
    { term: "Zero-Days", timestamp: new Date().toISOString() }
  ];
  saveDB(db);
}

export function getPublishedArticles(filterLocation = "") {
  const db = getDB();
  let articles = db.publishedArticles;
  
  if (filterLocation) {
    logSearch(filterLocation);
    const loc = filterLocation.trim().toLowerCase();
    articles = articles.filter(art => 
      (art.location && art.location.toLowerCase().includes(loc)) || 
      (art.cve && art.cve.toLowerCase().includes(loc)) ||
      (art.affectedProduct && art.affectedProduct.toLowerCase().includes(loc)) ||
      (art.severity && art.severity.toLowerCase().includes(loc)) ||
      art.content.toLowerCase().includes(loc) ||
      art.title.toLowerCase().includes(loc)
    );
  }

  return articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

export function getPublishedArticleById(id) {
  const db = getDB();
  const art = db.publishedArticles.find(a => a.id === id);
  if (art) {
    art.views = (art.views || 0) + 1;
    saveDB(db);
  }
  return art;
}

export function addPublishedArticle(article) {
  const db = getDB();
  const newArticle = {
    id: `pub-${Date.now()}`,
    views: 0,
    publishedAt: new Date().toISOString(),
    severity: article.severity || "Medium",
    cve: article.cve || "",
    affectedProduct: article.affectedProduct || "",
    disclosureStatus: article.disclosureStatus || "Under Review",
    disclosureDate: article.disclosureDate || new Date().toISOString().split('T')[0],
    versions: [
      {
        version: 1,
        timestamp: new Date().toISOString(),
        title: article.title,
        content: article.content
      }
    ],
    ...article
  };
  
  db.publishedArticles.push(newArticle);
  
  if (article.rawId) {
    db.rawArticles = db.rawArticles.filter(art => art.id !== article.rawId);
  }

  saveDB(db);
  return newArticle;
}

export function updatePublishedArticle(id, updatedFields) {
  const db = getDB();
  const index = db.publishedArticles.findIndex(art => art.id === id);
  if (index === -1) return null;

  const current = db.publishedArticles[index];
  const currentVersions = current.versions || [
    {
      version: 1,
      timestamp: current.publishedAt || new Date().toISOString(),
      title: current.title,
      content: current.content
    }
  ];

  const newVersionNumber = currentVersions.length + 1;
  const newVersion = {
    version: newVersionNumber,
    timestamp: new Date().toISOString(),
    title: updatedFields.title || current.title,
    content: updatedFields.content || current.content
  };

  const updatedArticle = {
    ...current,
    ...updatedFields,
    versions: [...currentVersions, newVersion]
  };

  db.publishedArticles[index] = updatedArticle;
  saveDB(db);
  return updatedArticle;
}

export function deletePublishedArticle(id) {
  const db = getDB();
  db.publishedArticles = db.publishedArticles.filter(art => art.id !== id);
  saveDB(db);
  return true;
}

export function addRawArticle(article) {
  const db = getDB();
  const newArticle = {
    id: `raw-${Date.now()}`,
    publishedAt: new Date().toISOString(),
    ...article
  };
  db.rawArticles.push(newArticle);
  saveDB(db);
  return newArticle;
}

export function addProvider(provider) {
  const db = getDB();
  const newProvider = {
    id: `prov-${Date.now()}`,
    trustScore: 85,
    ...provider
  };
  db.providers.push(newProvider);
  saveDB(db);
  return newProvider;
}
