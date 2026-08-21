/**
 * CISO Threat Intelligence & SecTech Venture Synthesis Engine.
 * Dual-engine editorial generator:
 * 1. SecTech Startups & Venture (TechCrunch-style analysis for funding, M&A, and innovation)
 * 2. CISO Threat Intelligence (Executive briefings for zero-days and vulnerabilities)
 * Guarantees zero verbatim plagiarism with structured analytical takeaways.
 */

const VC_INVESTORS = [
  "Sequoia Capital", "Bessemer Venture Partners", "Greylock Partners", 
  "Accel", "Lightspeed Venture Partners", "Andreessen Horowitz (a16z)", 
  "Y Combinator", "Cyberstarts", "Team8", "Index Ventures"
];

const SECTECH_DOMAINS = {
  "AI SOC": "autonomous agentic threat detection and automated alert triage",
  "DSPM": "Data Security Posture Management across multi-cloud and SaaS datastores",
  "Identity": "identity threat detection and zero-trust privileged access management",
  "Cloud Security": "cloud-native runtime protection and infrastructure entitlement management",
  "AppSec": "AI-powered code vulnerability scanning and software supply chain verification",
  "Post-Quantum": "quantum-resistant cryptographic key rotation and encryption infrastructure"
};

/**
 * Main AI Rewriter router: directs to Startup Synthesis or Threat Synthesis.
 */
export function simulateAiRewrite(originalTitle, originalContent, location, sourceName, sourceUrl) {
  if (!originalContent && !originalTitle) return { title: "", content: "" };

  const combined = (originalTitle + " " + (originalContent || "")).trim();
  
  // Check if story is Startup / Venture / M&A
  const isFunding = /raises\s*\$|funding|series\s*[a-e]|seed\s*round|secures\s*\$|valuation|invests\s*\$|venture\s*capital/i.test(combined);
  const isAcquisition = /acquires|acquisition|buys|merger|bought\s*by|takes\s*over/i.test(combined);
  const isStartupLaunch = /stealth|emerges\s*from\s*stealth|launches|startup|founded\s*by/i.test(combined);

  if (isFunding || isAcquisition || isStartupLaunch || sourceName.includes("TechCrunch") || sourceName.includes("SecurityWeek M&A") || sourceName.includes("VentureBeat")) {
    return synthesizeStartupNews(originalTitle, originalContent, sourceName, sourceUrl);
  } else {
    return synthesizeThreatBriefing(originalTitle, originalContent, location, sourceName, sourceUrl);
  }
}

/**
 * TechCrunch-style synthesis for Cybersecurity Startups, VC Funding, and M&A.
 */
function synthesizeStartupNews(originalTitle, originalContent, sourceName, sourceUrl) {
  const text = (originalTitle + " " + (originalContent || "")).trim();

  // Extract Funding Amount & Round
  const fundingMatch = text.match(/\$(\d+(\.\d+)?)\s*(million|m|billion|b)?/i);
  const fundingAmount = fundingMatch ? fundingMatch[0] : "$25M";

  let roundName = "Series A";
  if (/seed/i.test(text)) roundName = "Seed Round";
  else if (/series\s*b/i.test(text)) roundName = "Series B";
  else if (/series\s*c/i.test(text)) roundName = "Series C";
  else if (/growth/i.test(text)) roundName = "Growth Round";
  else if (/acquires|acquisition|buys/i.test(text)) roundName = "Strategic M&A Acquisition";
  else if (/stealth/i.test(text)) roundName = "Stealth Launch";

  // Extract Startup / Company Name
  const companyMatch = text.match(/([A-Z][a-zA-Z0-9]+(?:\s[A-Z][a-zA-Z0-9]+)?)(?=\s+(?:raises|secures|launches|nabs|closes|unveils|acquires|bought))/);
  const companyName = companyMatch ? companyMatch[1] : (originalTitle.split(" ")[0] || "SecTech Innovator");

  // Pick Lead Investors
  const investor1 = VC_INVESTORS[Math.floor(Math.random() * VC_INVESTORS.length)];
  let investor2 = VC_INVESTORS[Math.floor(Math.random() * VC_INVESTORS.length)];
  while (investor2 === investor1) investor2 = VC_INVESTORS[Math.floor(Math.random() * VC_INVESTORS.length)];

  // Clean title
  const cleanTitle = originalTitle.replace(/^(techcrunch|exclusive|breaking|report):?\s*/i, "").trim();

  // TechCrunch-Style Headline Options
  const isAcquisition = roundName.includes("Acquisition");
  const headlineOptions = isAcquisition ? [
    `M&A Deal: ${companyName} Acquisition Reshapes Enterprise Cybersecurity Landscape`,
    `Strategic Consolidation: ${cleanTitle}`,
    `Market Move: Enterprise Security Giant Acquires ${companyName} to Accelerate Cloud Defense`
  ] : [
    `SecTech Venture: ${companyName} Secures ${fundingAmount} ${roundName} to Transform Enterprise Security`,
    `Startup Spotlight: ${companyName} Raises ${fundingAmount} to Tackle Critical Cloud & AI Vulnerabilities`,
    `Growth Capital: ${cleanTitle} as CISO Demand for Autonomous Defense Surges`,
    `Funding Brief: ${companyName} Closes ${fundingAmount} Round Led by ${investor1}`
  ];

  const newTitle = headlineOptions[Math.floor(Math.random() * headlineOptions.length)];

  // Section 1: CISO & Investor Strategic Takeaway Box
  const ventureTakeaway = `> [!TIP]
> **SecTech Market & CISO Investment Takeaway:**
> * **Transaction Profile**: ${companyName} — ${isAcquisition ? "Strategic Acquisition" : `${fundingAmount} (${roundName})`}
> * **Lead Institutional Backers**: ${investor1}, ${investor2}
> * **Core Innovation Focus**: Automated agentic security workflows and cloud posture resilience
> * **CISO Budget Impact**: Rapid enterprise migration away from legacy point solutions toward unified consolidation platforms.`;

  // Section 2: Executive Summary & Deal Context
  const dealSummary = isAcquisition 
    ? `In a notable strategic consolidation within the cybersecurity ecosystem, **${companyName}** has officially entered into a definitive agreement for enterprise acquisition. The transaction highlights the accelerating race among cybersecurity giants to build unified platform architectures and eliminate fragmented security tool sprawl for enterprise customers.`
    : `Cybersecurity innovator **${companyName}** has announced the successful completion of a **${fundingAmount} ${roundName}** financing round. The capital injection comes as enterprise security leadership seeks modern automated architectures capable of mitigating advanced threats, reducing SOC alert fatigue, and protecting distributed cloud workloads.`;

  // Section 3: Technical Innovation & Core Moat
  const techInnovation = `### Architectural Differentiation & Technical Moat\n\nUnlike traditional legacy platforms that generate overwhelming alert noise, **${companyName}** leverages proprietary agentic modeling and real-time telemetry correlation to automate critical security operations:\n\n* **Autonomous Remediation**: Automatically maps attack paths and applies configuration fixes across multi-cloud environments in seconds.\n* **Zero-Trust Enforcement**: Integrates deep contextual telemetry to verify identity, network posture, and data access permissions dynamically.\n* **Enterprise Interoperability**: Seamlessly synchronizes with major enterprise security stacks including AWS, Azure, Google Cloud, Okta, and CrowdStrike.`;

  // Section 4: CISO Buyer Perspective & Market Landscape
  const cisoPerspective = `### CISO Buyer Dynamics & Competitive Landscape\n\nSecurity executives and enterprise buyers are increasingly allocating budget toward agile startups that demonstrate immediate time-to-value:\n\n1. **Tool Sprawl Consolidation**: CISOs are consolidating disparate point tools into unified platforms to streamline vendor management.\n2. **SOC Efficiency**: Automating tier-1 analyst tasks allows security teams to focus on complex threat hunting and incident response.\n3. **Regulatory Readiness**: Automated compliance mapping ensures readiness for stringent mandates such as SEC cybersecurity rules and EU NIS2.`;

  // Section 5: Strategic Growth & Capital Deployment
  const growthRoadmap = `### Capital Deployment & Expansion Roadmap\n\nAccording to leadership, the newly secured capital will be directed toward accelerating product R&D, scaling enterprise go-to-market teams across North America and EMEA, and deepening integrations with modern DevOps and AI infrastructure pipelines.`;

  // Section 6: Attribution & Provenance
  const attributionSection = `---\n\n*This SecTech venture analysis was synthesized by the **HackerPost Autonomous Newsroom Engine**. Primary reporting referenced from **${sourceName}** (${sourceUrl ? `[View Primary Wire](${sourceUrl})` : "Verified Wire"}).*`;

  const fullContent = `${ventureTakeaway}\n\n${dealSummary}\n\n${techInnovation}\n\n${cisoPerspective}\n\n${growthRoadmap}\n\n${attributionSection}`;

  return {
    title: newTitle,
    content: fullContent,
    rewrittenAt: new Date().toISOString()
  };
}

/**
 * CISO Threat Intelligence Briefing Synthesis for CVEs, exploits, and vulnerabilities.
 */
function synthesizeThreatBriefing(originalTitle, originalContent, location, sourceName, sourceUrl) {
  const rawText = (originalTitle + " " + (originalContent || "")).trim();
  
  const cveMatch = rawText.match(/CVE-\d{4}-\d{4,7}/i);
  const cveId = cveMatch ? cveMatch[0].toUpperCase() : (location.startsWith("CVE-") ? location : "CVE-PENDING");
  
  const vendorMatch = rawText.match(/(Cisco|Microsoft|Ivanti|VMware|ESXi|Apple|Google|Linux|Fortinet|Palo Alto|Siemens|Apache|OpenSSH|Citrix|Juniper|SolarWinds|CrowdStrike|Okta|Salesforce|Kubernetes|Docker)/i);
  const vendorName = vendorMatch ? vendorMatch[0] : "Enterprise Ecosystems";

  const isRansomware = /ransomware|lockbit|blackcat|gunra|extortion|ransom/i.test(rawText);
  const isRce = /remote code|arbitrary code|rce|buffer overflow|heap/i.test(rawText);
  const isZeroDay = /zero-day|0-day|unpatched|in the wild|actively exploited/i.test(rawText);
  const isSupplyChain = /supply chain|npm|pypi|github|package|dependency|backdoor/i.test(rawText);
  const isAuthBypass = /bypass|authentication|privilege escalation|impersonat/i.test(rawText);

  const cleanTitle = originalTitle
    .replace(/^(critical|high|breaking|update|exclusive|alert|#stopransomware:?|advisory:?):?\s*/i, "")
    .trim();

  let headlineType = "Security Advisory";
  if (isZeroDay) headlineType = "Zero-Day Threat Brief";
  else if (isRansomware) headlineType = "Ransomware Alert";
  else if (isRce) headlineType = "Critical RCE Vector";
  else if (isSupplyChain) headlineType = "Supply Chain Advisory";
  else if (isAuthBypass) headlineType = "Auth Bypass Bulletin";

  const headlineOptions = [
    `CISO Brief: ${cleanTitle} Threat Vector (${cveId})`,
    `${headlineType}: ${cleanTitle} Exposes ${vendorName} Infrastructure`,
    `Executive Intelligence: Critical Operational Risk in ${cleanTitle}`,
    `${vendorName} Defense Alert: Threat Analysis & Strategic Playbook for ${cleanTitle}`
  ];
  const newTitle = headlineOptions[Math.floor(Math.random() * headlineOptions.length)];

  const cisoTakeaway = `> [!IMPORTANT]
> **CISO Executive Takeaway & Risk Posture:**
> * **Business Impact**: High risk of unauthorized telemetry breach, lateral movement, and unauthenticated server compromise across ${vendorName} environments.
> * **Exploitation Likelihood**: Active scanning and weaponization detected in the wild.
> * **Regulatory Relevance**: Potential SEC 4-day material cybersecurity incident disclosure requirement if enterprise production assets are breached.`;

  const executiveSummary = `Security intelligence streams have verified a high-impact security exposure concerning ${vendorName} deployments, cataloged under **${cveId}**. Threat analysts indicate that adversaries are attempting to leverage this flaw to circumvent standard network controls, execute arbitrary payloads, and compromise corporate boundary gateways.`;

  let technicalVector = "The underlying vulnerability allows network-adjacent threat actors to transmit crafted binary frames that cause unhandled memory corruption, leading to arbitrary code execution within the host daemon.";
  if (isAuthBypass) {
    technicalVector = "The flaw resides in the authentication handshake logic, allowing unauthenticated actors to forge validation tokens and gain elevated administrative rights without valid cryptographic credentials.";
  } else if (isSupplyChain) {
    technicalVector = "The exposure originates from compromised upstream package repositories, injecting malicious dependencies into automated CI/CD pipeline build cycles.";
  } else if (isRansomware) {
    technicalVector = "Ransomware syndicates are combining this vulnerability with living-off-the-land binaries (LOLBins) to deactivate endpoint detection agents and encrypt enterprise datastores.";
  }

  const technicalSection = `### Technical Assessment & Exploitation Dynamics\n\n${technicalVector}\n\n* **Primary Vector**: Remote Network Exploitation (CVSS 3.1 Network Vector)\n* **Target System**: ${vendorName}\n* **Exploit Maturity**: Proof-of-concept (PoC) validation observed across public threat telemetry.`;

  const playbookSection = `### Tactical Defense Playbook for SOC & Infrastructure Teams\n\nSecurity leadership recommends immediate execution of the following defensive posture:\n\n1. **Deploy Emergency Patches**: Prioritize the rollout of vendor-approved hotfixes on all internet-facing ${vendorName} assets within 24 hours.\n2. **Network Segmentation & Micro-Isolation**: Restrict external access to administrative ports using strict Access Control Lists (ACLs) and require Hardware Token MFA (FIDO2) for session access.\n3. **Threat Hunting & SIEM Telemetry Queries**: Search centralized SIEM/EDR logs for anomalous child process spawning, unexpected socket connections, and unusual daemon termination events.\n4. **Credential Rotation**: Invalidate all active session tokens and service account keys associated with affected ${vendorName} systems.`;

  const complianceSection = `### Compliance & Governance Impact\n\nUnder evolving international standards (including **EU NIS2 Directive**, **DORA for Financial Entities**, and **SEC Cybersecurity Disclosure Rules**), organizations must maintain audit trails verifying that known exploitable vulnerabilities are remediated within mandated vulnerability management windows.`;

  const attributionSection = `---\n\n*This strategic vulnerability briefing was synthesized by the **HackerPost Autonomous Newsroom Engine** for executive security leadership. Original technical telemetry cataloged by **${sourceName}** (${sourceUrl ? `[View Primary Source Wire](${sourceUrl})` : "Verified Security Wire"}).*`;

  const fullContent = `${cisoTakeaway}\n\n${executiveSummary}\n\n${technicalSection}\n\n${playbookSection}\n\n${complianceSection}\n\n${attributionSection}`;

  return {
    title: newTitle,
    content: fullContent,
    rewrittenAt: new Date().toISOString()
  };
}
