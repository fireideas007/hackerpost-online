import fs from 'fs';
import path from 'path';
import { resolveArticleThumbnail } from './scraper.js';

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

export function slugify(text) {
  if (!text) return "";
  const cleaned = text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics / accents
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars
    .replace(/[\s_-]+/g, "-") // Replace spaces with hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  // Cap slug length to 80 chars at word boundaries for clean, concise SEO URLs
  if (cleaned.length > 80) {
    const truncated = cleaned.slice(0, 80);
    const lastHyphen = truncated.lastIndexOf('-');
    return lastHyphen > 30 ? truncated.slice(0, lastHyphen) : truncated;
  }
  return cleaned;
}

const SEED_PUBLISHED_ARTICLES = [
  {
    id: "pub-20260916-1",
    slug: "isc-stormcast-for-wednesday-september-16th-2026",
    rawId: "raw-20260916-1",
    providerName: "SANS Internet Storm Center",
    originalTitle: "ISC Stormcast For Wednesday, September 16th, 2026 https://isc.sans.edu/podcastdetail/10096, (Wed, Sep 16th)",
    title: "ISC Stormcast For Wednesday, September 16th, 2026",
    content: "> [!IMPORTANT]\n> **Daily Threat Telemetry Briefing:**\n> * **Wire Source**: SANS Internet Storm Center (Dr. Johannes Ullrich)\n> * **Threat Class**: Multi-Vector Vulnerability Intelligence & Honeypot Analysis\n> * **Key Bulletins**: Acronis cPanel zero-day weaponization, Gitlab MCP server request forgery, and WordPress plugin backdoors.\n\nThe SANS Technology Institute has released the daily tactical threat briefing analyzing newly observed malicious traffic across global honeypot sensors, highlighting active exploitation spikes.",
    category: "Advisories",
    location: "Global SANS Telemetry",
    publishedAt: "2026-09-16T02:00:02.000Z",
    sourceUrl: "https://isc.sans.edu/podcastdetail/10096",
    severity: "High",
    cve: "SANS-2026-0916",
    affectedProduct: "Enterprise Infrastructure & Web Services",
    disclosureStatus: "Daily Intelligence",
    disclosureDate: "2026-09-16",
    imageUrl: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "pub-20260916-2",
    slug: "acronis-warns-of-actively-exploited-flaw-in-its-cpanel-backup-plugin",
    rawId: "raw-20260916-2",
    providerName: "BleepingComputer Threat Feed",
    originalTitle: "Acronis warns of actively exploited flaw in its cPanel backup plugin",
    title: "Acronis warns of actively exploited flaw in its cPanel backup plugin",
    content: "> [!CAUTION]\n> **Active Zero-Day Exploitation Alert:**\n> * **Vulnerable Component**: Acronis Backup Plugin for cPanel (Linux Hosting Systems)\n> * **Exploit Mechanics**: Remote unauthenticated command execution allowing full host takeover\n> * **Urgent CISO Action**: Update to version 2.12.0 or disable cPanel integration immediately.\n\nCybersecurity and backup software vendor Acronis has issued an emergency advisory confirming active exploitation of a zero-day vulnerability in its cPanel backup plugin across web hosting providers.",
    category: "Zero-Days",
    location: "Linux-Hosting",
    publishedAt: "2026-09-15T21:37:35.000Z",
    sourceUrl: "https://www.bleepingcomputer.com/",
    severity: "Critical",
    cve: "CVE-2026-CPANEL",
    affectedProduct: "Acronis cPanel Plugin",
    disclosureStatus: "Active Wild Exploitation",
    disclosureDate: "2026-09-16",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "pub-1789442874106-737",
    slug: "microsoft-plugs-nearly-400-security-holes",
    rawId: "raw-1789442874090",
    providerName: "Krebs on Security",
    originalTitle: "Microsoft Plugs Nearly 400 Security Holes",
    title: "Microsoft Plugs Nearly 400 Security Holes",
    content: "> [!IMPORTANT]\n> **CISO Executive Threat Advisory:**\n> * **Threat Class**: Critical Zero-Day Advisory (Active Wild Exploitation)\n> * **Affected Platform**: Microsoft Windows & Cloud Services\n> * **Primary Reporting Wire**: Krebs on Security\n> * **Operational Directive**: Emergency perimeter mitigation required. Deploy September cumulative security updates immediately.\n\nAuthoritative threat telemetry published by **Krebs on Security** has identified coordinated exploitation targeting newly disclosed vulnerabilities across Microsoft enterprise services. Multiple zero-day flaws under active wild scanning require urgent defensive action.",
    category: "Zero-Days",
    location: "CVE-Advisory",
    publishedAt: "2026-09-15T03:27:54.106Z",
    sourceUrl: "https://krebsonsecurity.com/2026/08/microsoft-plugs-nearly-400-security-holes/",
    severity: "Critical",
    cve: "CVE-2026-400-MS",
    affectedProduct: "Microsoft Windows & Azure",
    disclosureStatus: "Patched",
    disclosureDate: "2026-09-15",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "pub-1789442874013-842",
    slug: "medical-device-maker-boston-scientific-says-a-cyberattack-is-causing-a-global",
    rawId: "raw-1789442873999",
    providerName: "TechCrunch Cybersecurity",
    originalTitle: "Medical device maker Boston Scientific says a cyberattack is causing a ‘global disruption’ to its operations",
    title: "Medical device maker Boston Scientific says a cyberattack is causing a ‘global disruption’ to its operations",
    content: "> [!CAUTION]\n> **Enterprise Infrastructure & Ransomware Compromise:**\n> * **Target**: Boston Scientific Global Supply Chain & Manufacturing\n> * **Operational Impact**: Worldwide logistics disruption and isolated server downtime\n> * **Incident Response Status**: Containment protocols initiated with external digital forensics teams.\n\nMedical device manufacturer Boston Scientific has confirmed a major unauthorized access intrusion impacting internal corporate systems, triggering global operational delays across product distribution networks.",
    category: "Data Breaches",
    location: "Global Healthcare",
    publishedAt: "2026-09-15T03:27:54.013Z",
    sourceUrl: "https://techcrunch.com/2026/08/26/medical-device-maker-boston-scientific-says-a-cyberattack-is-causing-a-global-disruption-to-its-operations/",
    severity: "High",
    cve: "INC-2026-BSCI",
    affectedProduct: "Enterprise Healthcare Core",
    disclosureStatus: "Disclosed",
    disclosureDate: "2026-09-15",
    imageUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "pub-1789442873915-611",
    slug: "openai-anthropic-google-and-100-other-companies-call-for-action-to-defend",
    rawId: "raw-1789442873901",
    providerName: "TechCrunch AI Security",
    originalTitle: "OpenAI, Anthropic, Google, and 100 other companies call for action to defend against rogue AI",
    title: "OpenAI, Anthropic, Google, and 100 other companies call for action to defend against rogue AI",
    content: "> [!TIP]\n> **Frontier AI Safety & Defense Consortium:**\n> * **Signatories**: OpenAI, Anthropic, Google DeepMind, Microsoft, Meta\n> * **Joint Accord**: Establishing automated offensive vulnerability disclosure standards for autonomous reasoning models\n> * **Policy Framework**: Mandating runtime monitoring against self-replicating agentic attacks.\n\nA historic coalition of over 100 leading AI research labs and technology providers has signed a joint defense pact establishing strict verification and defensive guardrails against autonomous exploitation agents.",
    category: "AI Security",
    location: "Global AI Defense",
    publishedAt: "2026-09-15T03:27:53.915Z",
    sourceUrl: "https://techcrunch.com/category/security/",
    severity: "Critical",
    cve: "AI-DEF-2026",
    affectedProduct: "Frontier LLMs & Autonomous Agents",
    disclosureStatus: "Joint Policy Action",
    disclosureDate: "2026-09-15",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "pub-1",
    slug: "critical-rce-regression-openssh-sshd-patched-cve-2026-3829",
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
  },
  {
    id: "pub-startup-1",
    slug: "cyera-secures-300m-series-d-enterprise-ai-dspm",
    rawId: "raw-startup-1",
    providerName: "TechCrunch Security",
    originalTitle: "Cyera Secures $300M Series D to Lead Enterprise AI Data Security Posture Management",
    title: "SecTech Venture: Cyera Secures $300M Series D to Lead Enterprise AI Data Security Posture Management (DSPM)",
    content: "> [!TIP]\n> **SecTech Market & CISO Investment Takeaway:**\n> * **Transaction Profile**: Cyera — $300M (Series D, $3.0B Valuation)\n> * **Lead Institutional Backers**: Sequoia Capital, Accel, Cyberstarts\n> * **Core Innovation Focus**: Automated AI data discovery, multi-cloud DSPM, and automated sensitive data classification\n> * **CISO Budget Impact**: Enterprises are consolidating fragmented DLP tools into unified cloud DSPM platforms.\n\nCybersecurity innovator **Cyera** has announced the closing of a **$300M Series D** financing round, pushing the cloud data security leader's valuation to $3 Billion. The capital raise reflects a major acceleration in enterprise CISO spending to secure sensitive structured and unstructured data across multi-cloud and SaaS environments.\n\n### Architectural Differentiation & Technical Moat\n\nUnlike legacy Data Loss Prevention (DLP) tools that rely on cumbersome endpoint agents and brittle regular expressions, Cyera operates agentlessly across AWS, Azure, Google Cloud, and SaaS environments:\n\n* **Deep Data Discovery**: Discovers shadow datastores, AI pipeline training corpora, and orphaned data buckets in minutes.\n* **Automated Context Mapping**: Automatically classifies sensitive PII, intellectual property, and cryptographic keys.\n* **Contextual Access Governance**: Connects data exposure risks with IAM identities to prevent privilege escalation.\n\n### CISO Buyer Dynamics & Competitive Landscape\n\nSecurity leaders are shifting security budgets toward proactive data posture management:\n\n1. **AI Governance**: Rapid enterprise adoption of LLMs requires precise visibility into what data enters training and inference pipelines.\n2. **Regulatory Mandates**: Ensuring strict adherence to EU NIS2, HIPAA, and global privacy frameworks.\n3. **Operational Simplicity**: Agentless API-based deployment requires zero production downtime.\n\n---\n\n*This SecTech venture analysis was synthesized by the **HackerPost Autonomous Newsroom Engine**. Primary reporting referenced from **TechCrunch Security** (https://techcrunch.com/category/security/).*",
    category: "SecTech & Startups",
    location: "SecTech-Startups",
    publishedAt: "2026-08-20T11:00:00Z",
    sourceUrl: "https://techcrunch.com/category/security/",
    similarityScore: 0,
    views: 890,
    severity: "Critical",
    affectedProduct: "Cyera AI DSPM",
    fundingAmount: "$300M",
    fundingRound: "Series D ($3.0B Valuation)",
    disclosureStatus: "Funded (Series D)",
    disclosureDate: "2026-08-20",
    versions: [
      {
        version: 1,
        timestamp: "2026-08-20T11:00:00.000Z",
        title: "SecTech Venture: Cyera Secures $300M Series D to Lead Enterprise AI Data Security Posture Management (DSPM)",
        content: "> [!TIP]\n> **SecTech Market & CISO Investment Takeaway:**\n> * **Transaction Profile**: Cyera — $300M (Series D, $3.0B Valuation)\n> * **Lead Institutional Backers**: Sequoia Capital, Accel, Cyberstarts\n> * **Core Innovation Focus**: Automated AI data discovery, multi-cloud DSPM, and automated sensitive data classification\n> * **CISO Budget Impact**: Enterprises are consolidating fragmented DLP tools into unified cloud DSPM platforms.\n\nCybersecurity innovator **Cyera** has announced the closing of a **$300M Series D** financing round, pushing the cloud data security leader's valuation to $3 Billion."
      }
    ]
  },
  {
    id: "pub-ma-1",
    slug: "palo-alto-networks-completes-650m-acquisition-agentic-identity",
    rawId: "raw-ma-1",
    providerName: "SecurityWeek M&A & Funding",
    originalTitle: "Palo Alto Networks Completes $650M Strategic Acquisition of Agentic Identity Startup",
    title: "M&A Deal: Palo Alto Networks Completes $650M Strategic Acquisition of Agentic Identity Startup",
    content: "> [!TIP]\n> **SecTech Market & CISO Investment Takeaway:**\n> * **Transaction Profile**: Strategic Enterprise Acquisition — $650M Cash\n> * **Strategic Objective**: Integrating automated identity threat detection (ITDR) into the Cortex XSIAM SOC platform\n> * **CISO Budget Impact**: Eliminates standalone identity monitoring tools in favor of unified platform consolidation.\n\nIn a major strategic consolidation within the cybersecurity ecosystem, **Palo Alto Networks** has finalized its **$650M strategic acquisition** of leading Identity Threat Detection and Response (ITDR) pioneer. The transaction accelerates the industry-wide consolidation toward unified autonomous Security Operations Centers (SOCs).\n\n### Architectural Differentiation & Technical Moat\n\nThe acquired technology directly bolsters Cortex XSIAM by correlating non-human identity (NHI) service accounts, token impersonation attempts, and lateral movement in real time:\n\n* **Non-Human Identity Defense**: Continuously audits API keys, service principals, and machine credentials across multi-cloud nodes.\n* **Automated Token Revocation**: Automatically severs compromised OAuth grants and active session cookies upon detecting anomalous token usage.\n* **Native Platform Integration**: Binds identity context directly into enterprise EDR and cloud firewalls.\n\n---\n\n*This SecTech venture analysis was synthesized by the **HackerPost Autonomous Newsroom Engine**. Primary reporting referenced from **SecurityWeek M&A & Funding** (https://www.securityweek.com/category/mergers-acquisitions/).*",
    category: "M&A & Funding",
    location: "Cyber-M&A",
    publishedAt: "2026-08-19T14:30:00Z",
    sourceUrl: "https://www.securityweek.com/category/mergers-acquisitions/",
    similarityScore: 0,
    views: 640,
    severity: "High",
    affectedProduct: "Palo Alto Networks / Cortex",
    fundingAmount: "$650M",
    fundingRound: "M&A Acquisition",
    disclosureStatus: "Acquired",
    disclosureDate: "2026-08-19",
    versions: [
      {
        version: 1,
        timestamp: "2026-08-19T14:30:00.000Z",
        title: "M&A Deal: Palo Alto Networks Completes $650M Strategic Acquisition of Agentic Identity Startup",
        content: "> [!TIP]\n> **SecTech Market & CISO Investment Takeaway:**\n> * **Transaction Profile**: Strategic Enterprise Acquisition — $650M Cash\n> * **Strategic Objective**: Integrating automated identity threat detection (ITDR) into the Cortex XSIAM SOC platform\n> * **CISO Budget Impact**: Eliminates standalone identity monitoring tools in favor of unified platform consolidation."
      }
    ]
  },
  {
    id: "pub-20260914-1",
    slug: "how-threat-actors-are-turning-trusted-ai-platforms-into-an-attack-surface",
    rawId: "raw-20260914-1",
    providerName: "The Hacker News",
    originalTitle: "How Threat Actors Are Turning Trusted AI Platforms Into an Attack Surface",
    title: "How Threat Actors Are Turning Trusted AI Platforms Into an Attack Surface",
    content: "> [!IMPORTANT]\n> **CISO Executive Threat Advisory:**\n> * **Threat Class**: Adversarial AI Infrastructure Hijacking & Prompt Injection RCE\n> * **Primary Reporting Wire**: The Hacker News & Mandiant Intelligence\n> * **Affected Vectors**: Enterprise Agentic AI Deployments, Tool-Use APIs, and LangChain RAG Pipelines\n> * **Operational Directive**: Enforce strict egress sandboxing and input validation on multi-modal model prompts.\n\nAdversaries are weaponizing trusted artificial intelligence runtime environments, pivoting from standard jailbreaks to full-blown remote command execution and sensitive enterprise data exfiltration.\n\n### Attack Mechanics & Indirect Tool Poisoning\n\nSecurity researchers have identified multi-stage exploit chains where threat actors inject hidden ANSI and unicode payload instructions into publicly accessible documentation. When enterprise AI agents summarize or parse these documents, the embedded instructions trigger unauthorized API calls, exfiltrating internal API tokens and database connection strings to command-and-control servers.",
    category: "Advisories",
    location: "Global",
    publishedAt: "2026-09-14T09:11:26.508Z",
    sourceUrl: "https://thehackernews.com/",
    severity: "Critical",
    cve: "CVE-2026-9104",
    affectedProduct: "Enterprise AI Agents & LLM Tooling",
    disclosureStatus: "Active Threat Alert",
    disclosureDate: "2026-09-14",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "pub-20260914-2",
    slug: "whatsapp-restricted-chat-locks-a-conversation-to-your-primary-phone",
    rawId: "raw-20260914-2",
    providerName: "BleepingComputer Threat Feed",
    originalTitle: "WhatsApp Restricted Chat locks a conversation to your primary phone",
    title: "WhatsApp Restricted Chat locks a conversation to your primary phone",
    content: "> [!TIP]\n> **Consumer & Enterprise Mobile Privacy Bulletin:**\n> * **Feature Announcement**: WhatsApp Hardware-Bound Restricted Chats\n> * **Security Architecture**: Hardware Security Module (HSM) Cryptographic Key Binding\n> * **Defensive Impact**: Blocks unauthorized message synchronization to linked desktop or web sessions.\n\nMeta has introduced a major privacy enhancement for WhatsApp called Restricted Chat, which permanently tethers designated sensitive conversations to the user's primary mobile device hardware.",
    category: "Advisories",
    location: "Mobile Security",
    publishedAt: "2026-09-14T08:56:28.075Z",
    sourceUrl: "https://www.bleepingcomputer.com/",
    severity: "Medium",
    cve: "",
    affectedProduct: "WhatsApp iOS & Android",
    disclosureStatus: "Disclosed",
    disclosureDate: "2026-09-14",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "pub-20260914-3",
    slug: "microsoft-september-updates-break-audio-on-some-windows-pcs",
    rawId: "raw-20260914-3",
    providerName: "BleepingComputer Threat Feed",
    originalTitle: "Microsoft: September updates break audio on some Windows PCs",
    title: "Microsoft: September updates break audio on some Windows PCs",
    content: "> [!WARNING]\n> **Endpoint Administration & Patch Tuesday Alert:**\n> * **Impacted Platforms**: Windows 11 23H2 & Windows 10 Enterprise\n> * **Hotfix Issue**: Audio endpoint crash following KB5043076 / KB5043064 deployment\n> * **Mitigation**: Deploy Known Issue Rollback (KIR) Group Policy or update Realtek HD Audio drivers.\n\nMicrosoft has confirmed that its September 2026 Patch Tuesday cumulative updates are causing audio hardware failures on select enterprise workstations.",
    category: "Advisories",
    location: "Windows Endpoint",
    publishedAt: "2026-09-14T08:56:28.056Z",
    sourceUrl: "https://www.bleepingcomputer.com/",
    severity: "Medium",
    cve: "KB5043076",
    affectedProduct: "Windows 11 & Windows Server",
    disclosureStatus: "Mitigated",
    disclosureDate: "2026-09-14",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "pub-20260914-4",
    slug: "revolut-discloses-data-breach-exposing-financial-info-passports",
    rawId: "raw-20260914-4",
    providerName: "BleepingComputer Threat Feed",
    originalTitle: "Revolut discloses data breach exposing financial info, passports",
    title: "Revolut discloses data breach exposing financial info, passports",
    content: "> [!CAUTION]\n> **Critical Breach Advisory:**\n> * **Breach Target**: Revolut Global Banking Infrastructure\n> * **Compromised Records**: PII, Payment Card Fragments, Government Identification / Passports\n> * **Root Cause**: Targeted Social Engineering Attack against Administrative Support Agent\n> * **SEC / GDPR Mandate**: Material breach notifications issued to data protection regulators.\n\nGlobal fintech giant Revolut has disclosed a significant unauthorized access incident compromising sensitive customer records following a sophisticated social engineering vector.",
    category: "Data Breaches",
    location: "Global FinTech",
    publishedAt: "2026-09-14T08:56:28.033Z",
    sourceUrl: "https://www.bleepingcomputer.com/",
    severity: "Critical",
    cve: "SEC-8K-REVOLUT",
    affectedProduct: "Revolut Cloud Core",
    disclosureStatus: "Disclosed",
    disclosureDate: "2026-09-14",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "pub-20260914-5",
    slug: "passkey-themed-phishing-attacks-lead-to-microsoft-365-data-theft",
    rawId: "raw-20260914-5",
    providerName: "BleepingComputer Threat Feed",
    originalTitle: "Passkey-themed phishing attacks lead to Microsoft 365 data theft",
    title: "Passkey-themed phishing attacks lead to Microsoft 365 data theft",
    content: "> [!IMPORTANT]\n> **Identity & Credential Threat Intelligence:**\n> * **Campaign Vector**: Adversary-in-the-Middle (AiTM) Passkey Registration Fraud\n> * **Targeted Suite**: Microsoft 365 Enterprise & Entra ID\n> * **Remediation**: Enforce FIDO2 Hardware Token Binding and Conditional Access Session Lifetime Policies.\n\nThreat actors are exploiting enterprise transitions toward passwordless authentication by deploying phishing landing pages that mimic official Microsoft 365 passkey enrollment workflows.",
    category: "Ransomware",
    location: "Identity-Cloud",
    publishedAt: "2026-09-14T08:00:44.835Z",
    sourceUrl: "https://www.bleepingcomputer.com/",
    severity: "High",
    cve: "AITM-PASSKEY-2026",
    affectedProduct: "Microsoft Entra ID / M365",
    disclosureStatus: "Active Phishing Campaign",
    disclosureDate: "2026-09-14",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "pub-20260914-6",
    slug: "daily-ai-security-leaderboard-recalibration-claude-4-5-opus-holds-1-2026-09-14",
    rawId: "raw-20260914-6",
    providerName: "HackerPost Research Labs",
    originalTitle: "Daily AI Security Leaderboard Recalibration: Claude 4.5 Opus Holds #1 (2026-09-14)",
    title: "Daily AI Security Leaderboard Recalibration: Claude 4.5 Opus (Agentic Reasoning) Holds #1 (2026-09-14)",
    content: "> [!TIP]\n> **Daily Benchmark Calibration Highlights (2026-09-14):**\n> * **#1 Overall**: Claude 4.5 Opus (Anthropic) — 97.4 Composite Security Index\n> * **#2 Overall**: Gemini 3 Pro Preview (Google DeepMind) — 96.9 Composite Index (99.1% SIEM Threat Hunting)\n> * **#3 Overall**: Doubao-Seed-Code (TRAE Agent) — 96.2 Composite Index (78.8% SWE-bench Verified)\n> * **#1 Open-Weights**: DeepSeek V3.2 (Cyber Reasoning) — 91.3 Composite Index\n> * **New Models Calibrated**: Meta Llama 4 CyberSec (#11, 90.6) and Mistral Codestral 2 (#12, 89.2)\n\nThe HackerPost Security Research Labs has finalized the daily empirical calibration across accredited frontier evaluation frameworks: SWE-bench Verified, Meta CyberSecEval 3, MITRE Engenuity, Stanford CAIS, and OWASP GenAI Top 10.",
    category: "AI Security",
    location: "Global",
    publishedAt: "2026-09-14T06:45:00.000Z",
    sourceUrl: "https://hackerpost.online/benchmarks",
    severity: "Medium",
    cve: "BENCH-2026-DAILY",
    affectedProduct: "Frontier AI Security Models (LLMs & SecOps Agents)",
    disclosureStatus: "Verified Benchmark Audit",
    disclosureDate: "2026-09-14",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "pub-1",
    slug: "critical-rce-regression-openssh-sshd-patched-cve-2026-3829",
    rawId: "raw-1",
    providerName: "GitHub Advisory Database",
    originalTitle: "Critical Remote Code Execution Vulnerability in OpenSSH (CVE-2026-3829)",
    title: "Critical RCE Regression in OpenSSH (sshd) Patched Globally",
    content: "# Security Advisory: OpenSSH Remote Code Execution (CVE-2026-3829)\n\nA critical regression vulnerability was discovered in the OpenSSH server (`sshd`) that allows unauthenticated remote code execution on glibc-based Linux systems. This vulnerability stems from a race condition in `sshd`'s signal handler during authentication timeouts.",
    category: "Exploits",
    location: "CVE-2026-3829",
    publishedAt: "2026-08-11T16:00:00Z",
    sourceUrl: "https://github.com/advisories/GHSA-openssh-rce-2026",
    severity: "Critical",
    cve: "CVE-2026-3829",
    affectedProduct: "OpenSSH Server 8.5p1 - 9.7p1",
    disclosureStatus: "Patched",
    disclosureDate: "2026-08-11",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "pub-startup-1",
    slug: "cyera-secures-300m-series-d-enterprise-ai-dspm",
    rawId: "raw-startup-1",
    providerName: "TechCrunch Security",
    originalTitle: "Cyera Secures $300M Series D to Lead Enterprise AI Data Security Posture Management",
    title: "SecTech Venture: Cyera Secures $300M Series D to Lead Enterprise AI Data Security Posture Management (DSPM)",
    content: "Cybersecurity innovator Cyera has announced the closing of a $300M Series D financing round, pushing the cloud data security leader's valuation to $3 Billion.",
    category: "SecTech & Startups",
    location: "SecTech-Startups",
    publishedAt: "2026-08-20T11:00:00Z",
    sourceUrl: "https://techcrunch.com/category/security/",
    severity: "Critical",
    affectedProduct: "Cyera AI DSPM",
    disclosureStatus: "Funded (Series D)",
    disclosureDate: "2026-08-20",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "pub-bench-1",
    slug: "meta-releases-cyberseceval-3-ai-security-benchmarks",
    rawId: "raw-bench-1",
    providerName: "Meta AI & MITRE Engenuity",
    originalTitle: "Meta Releases CyberSecEval 3: Standardized Benchmarks for AI in Cybersecurity",
    title: "Benchmark Report: Meta Releases CyberSecEval 3 — Ranking Claude 3.7 Sonnet, GPT-4o, and CyberSec Llama",
    content: "A joint evaluation report released by Meta AI Research, MITRE Engenuity, and USENIX has established standardized benchmarks for AI models in cybersecurity.",
    category: "AI Benchmarks",
    location: "AI-Benchmarks",
    publishedAt: "2026-08-21T09:00:00Z",
    sourceUrl: "https://ai.meta.com/research/publications/cyberseceval-3/",
    severity: "Critical",
    affectedProduct: "Frontier & Open SecLLMs",
    disclosureStatus: "Evaluated (Q3 2026)",
    disclosureDate: "2026-08-21",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
  }
];

// In-memory cache for resilient fallback if filesystem is read-only or in serverless environments
let memoryDB = null;

function getDB() {
  if (memoryDB) {
    return memoryDB;
  }

  try {
    if (!fs.existsSync(DB_DIR)) {
      try {
        fs.mkdirSync(DB_DIR, { recursive: true });
      } catch (_) {}
    }
    
    if (!fs.existsSync(DB_FILE)) {
      const defaultData = {
        providers: SEED_PROVIDERS,
        rawArticles: SEED_RAW_ARTICLES,
        publishedArticles: [...SEED_PUBLISHED_ARTICLES],
        searchLogs: []
      };
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      } catch (_) {}
      memoryDB = defaultData;
      return defaultData;
    }

    const rawData = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(rawData);
    if (!parsed.searchLogs) parsed.searchLogs = [];
    if (!parsed.publishedArticles) parsed.publishedArticles = [];
    if (!parsed.providers || parsed.providers.length === 0 || parsed.providers[0].id === 'prov-mta') {
      parsed.providers = SEED_PROVIDERS;
      parsed.rawArticles = SEED_RAW_ARTICLES;
      parsed.publishedArticles = [...SEED_PUBLISHED_ARTICLES];
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
      } catch (_) {}
    }

    // Self-healing: Ensure latest September 15 seed published articles exist in db
    for (const seed of SEED_PUBLISHED_ARTICLES) {
      const existing = parsed.publishedArticles.find(a => a.id === seed.id || (a.slug && a.slug === seed.slug));
      if (!existing) {
        parsed.publishedArticles.unshift(seed);
      } else if (!existing.slug && seed.slug) {
        existing.slug = seed.slug;
      }
    }

    parsed.publishedArticles.forEach(art => {
      if (!art.slug) {
        art.slug = slugify(art.title) || art.id;
      } else if (art.slug.length > 80) {
        art.slug = slugify(art.slug);
      }
    });

    memoryDB = parsed;
    return parsed;
  } catch (err) {
    console.warn("[NewsStore Warning] Reading database file failed, using in-memory defaults:", err.message);
    const defaultData = {
      providers: SEED_PROVIDERS,
      rawArticles: SEED_RAW_ARTICLES,
      publishedArticles: [...SEED_PUBLISHED_ARTICLES],
      searchLogs: []
    };
    memoryDB = defaultData;
    return defaultData;
  }
}

function saveDB(data) {
  memoryDB = data;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Gracefully handle read-only filesystems or restrictive Docker volume mounts
    console.warn("[NewsStore Warning] Could not persist db.json to disk (in-memory mode active):", err.message);
  }
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
  let articles = db.publishedArticles.map(art => ({
    ...art,
    imageUrl: art.imageUrl || resolveArticleThumbnail(art.category, art.title),
    slug: art.slug || slugify(art.title) || art.id
  }));
  
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

export function getPublishedArticleById(idOrSlug) {
  if (!idOrSlug) return null;
  const db = getDB();
  let rawTarget = "";
  try {
    rawTarget = decodeURIComponent(String(idOrSlug)).trim();
  } catch (_) {
    rawTarget = String(idOrSlug).trim();
  }
  const target = rawTarget.toLowerCase();
  const targetClean = target.replace(/[^a-z0-9]/g, '');

  // 1. Direct ID match
  let art = db.publishedArticles.find(a => a.id && a.id.toLowerCase() === target);
  
  // 2. Direct slug match
  if (!art) {
    art = db.publishedArticles.find(a => a.slug && a.slug.toLowerCase() === target);
  }

  // 3. Normalized alphanumeric slug match (ignoring hyphens/punctuation)
  if (!art && targetClean.length >= 3) {
    art = db.publishedArticles.find(a => {
      const artSlugClean = (a.slug || slugify(a.title) || a.id).replace(/[^a-z0-9]/g, '');
      return artSlugClean === targetClean || 
        (targetClean.length >= 10 && (artSlugClean.startsWith(targetClean) || targetClean.startsWith(artSlugClean)));
    });
  }

  // 4. Computed slug match (slugify(title))
  if (!art) {
    art = db.publishedArticles.find(a => {
      const computedSlug = slugify(a.title);
      return computedSlug === target || 
        (target.length >= 10 && (target.startsWith(computedSlug) || computedSlug.startsWith(target)));
    });
  }

  // 5. CVE Code Match (e.g. "cve-2026-3829" or "CVE-2026-21887")
  if (!art && targetClean.length >= 5) {
    art = db.publishedArticles.find(a => {
      if (!a.cve) return false;
      const cleanCve = a.cve.toLowerCase().replace(/[^a-z0-9]/g, '');
      return targetClean.includes(cleanCve) || cleanCve.includes(targetClean);
    });
  }

  // 6. ID suffix/substring match (e.g. if URL is "cyera-secures-300m-pub-startup-1")
  if (!art) {
    art = db.publishedArticles.find(a => a.id && (target.endsWith(a.id.toLowerCase()) || target.includes(a.id.toLowerCase())));
  }

  // 7. Distinct title keyword overlap match (fallback)
  if (!art && target.length > 5) {
    const targetWords = target.split(/[-_\s]+/).filter(w => w.length > 3);
    if (targetWords.length > 0) {
      let bestMatch = null;
      let maxMatches = 0;
      for (const a of db.publishedArticles) {
        const titleLower = (a.title || "").toLowerCase();
        let matches = 0;
        for (const w of targetWords) {
          if (titleLower.includes(w)) matches++;
        }
        if (matches > maxMatches && matches >= Math.min(2, targetWords.length)) {
          maxMatches = matches;
          bestMatch = a;
        }
      }
      if (bestMatch) art = bestMatch;
    }
  }

  if (art) {
    art.views = (art.views || 0) + 1;
    if (!art.imageUrl) {
      art.imageUrl = resolveArticleThumbnail(art.category, art.title);
    }
    // Attach slug if missing
    if (!art.slug) {
      art.slug = slugify(art.title) || art.id;
    }
    if (!Array.isArray(art.versions)) {
      art.versions = [
        {
          version: 1,
          timestamp: art.publishedAt || new Date().toISOString(),
          title: art.title,
          content: art.content
        }
      ];
    }
  }
  return art;
}

export function addPublishedArticle(article) {
  const db = getDB();
  const title = article.title || "Threat Intelligence Dispatch";
  const slug = (article.slug && slugify(article.slug)) || slugify(title) || `advisory-${Date.now()}`;
  const imageUrl = article.imageUrl || resolveArticleThumbnail(article.category, title);
  
  const newArticle = {
    ...article,
    id: article.id || `pub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    slug,
    views: article.views || 0,
    publishedAt: article.publishedAt || new Date().toISOString(),
    severity: article.severity || "Medium",
    cve: article.cve || "",
    affectedProduct: article.affectedProduct || "",
    disclosureStatus: article.disclosureStatus || "Under Review",
    disclosureDate: article.disclosureDate || new Date().toISOString().split('T')[0],
    imageUrl,
    versions: Array.isArray(article.versions) && article.versions.length > 0 
      ? article.versions 
      : [
          {
            version: 1,
            timestamp: new Date().toISOString(),
            title: title,
            content: article.content || ""
          }
        ],
    tweetId: article.tweetId || null,
    tweetUrl: article.tweetUrl || null,
    xStatus: article.xStatus || "unposted",
    xSyndicatedAt: article.xSyndicatedAt || null
  };
  
  db.publishedArticles.push(newArticle);
  
  if (article.rawId) {
    db.rawArticles = db.rawArticles.filter(art => art.id !== article.rawId);
  }

  saveDB(db);
  return newArticle;
}

export function updateArticleSocialMetadata(id, metadata = {}) {
  const db = getDB();
  const art = db.publishedArticles.find(a => a.id === id || a.slug === id);
  if (art) {
    if (metadata.tweetId !== undefined) art.tweetId = metadata.tweetId;
    if (metadata.tweetUrl !== undefined) art.tweetUrl = metadata.tweetUrl;
    if (metadata.xStatus !== undefined) art.xStatus = metadata.xStatus;
    if (metadata.xSyndicatedAt !== undefined) art.xSyndicatedAt = metadata.xSyndicatedAt;
    if (metadata.handle !== undefined) art.xHandle = metadata.handle;
    saveDB(db);
    return art;
  }
  return null;
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
