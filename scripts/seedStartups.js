import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

if (fs.existsSync(DB_FILE)) {
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  if (!db.publishedArticles) db.publishedArticles = [];

  const hasCyera = db.publishedArticles.some(a => a.id === 'pub-startup-1');
  if (!hasCyera) {
    db.publishedArticles.unshift({
      id: 'pub-startup-1',
      providerName: 'TechCrunch Security',
      originalTitle: 'Cyera Secures $300M Series D to Lead Enterprise AI Data Security Posture Management',
      title: 'SecTech Venture: Cyera Secures $300M Series D to Lead Enterprise AI Data Security Posture Management (DSPM)',
      content: `> [!TIP]\n> **SecTech Market & CISO Investment Takeaway:**\n> * **Transaction Profile**: Cyera — $300M (Series D, $3.0B Valuation)\n> * **Lead Institutional Backers**: Sequoia Capital, Accel, Cyberstarts\n> * **Core Innovation Focus**: Automated AI data discovery, multi-cloud DSPM, and automated sensitive data classification\n> * **CISO Budget Impact**: Enterprises are consolidating fragmented DLP tools into unified cloud DSPM platforms.\n\nCybersecurity innovator **Cyera** has announced the closing of a **$300M Series D** financing round, pushing the cloud data security leader's valuation to $3 Billion. The capital raise reflects a major acceleration in enterprise CISO spending to secure sensitive structured and unstructured data across multi-cloud and SaaS environments.\n\n### Architectural Differentiation & Technical Moat\n\nUnlike legacy Data Loss Prevention (DLP) tools that rely on cumbersome endpoint agents and brittle regular expressions, Cyera operates agentlessly across AWS, Azure, Google Cloud, and SaaS environments:\n\n* **Deep Data Discovery**: Discovers shadow datastores, AI pipeline training corpora, and orphaned data buckets in minutes.\n* **Automated Context Mapping**: Automatically classifies sensitive PII, intellectual property, and cryptographic keys.\n* **Contextual Access Governance**: Connects data exposure risks with IAM identities to prevent privilege escalation.\n\n### CISO Buyer Dynamics & Competitive Landscape\n\nSecurity leaders are shifting security budgets toward proactive data posture management:\n\n1. **AI Governance**: Rapid enterprise adoption of LLMs requires precise visibility into what data enters training and inference pipelines.\n2. **Regulatory Mandates**: Ensuring strict adherence to EU NIS2, HIPAA, and global privacy frameworks.\n3. **Operational Simplicity**: Agentless API-based deployment requires zero production downtime.\n\n---\n\n*This SecTech venture analysis was synthesized by the **HackerPost Autonomous Newsroom Engine**. Primary reporting referenced from **TechCrunch Security** (https://techcrunch.com/category/security/).*`,
      category: 'SecTech & Startups',
      location: 'SecTech-Startups',
      publishedAt: new Date().toISOString(),
      sourceUrl: 'https://techcrunch.com/category/security/',
      similarityScore: 0,
      views: 890,
      severity: 'Critical',
      affectedProduct: 'Cyera AI DSPM',
      fundingAmount: '$300M',
      fundingRound: 'Series D ($3.0B Valuation)',
      disclosureStatus: 'Funded (Series D)',
      disclosureDate: '2026-08-20'
    });

    db.publishedArticles.unshift({
      id: 'pub-ma-1',
      providerName: 'SecurityWeek M&A & Funding',
      originalTitle: 'Palo Alto Networks Completes $650M Strategic Acquisition of Agentic Identity Startup',
      title: 'M&A Deal: Palo Alto Networks Completes $650M Strategic Acquisition of Agentic Identity Startup',
      content: `> [!TIP]\n> **SecTech Market & CISO Investment Takeaway:**\n> * **Transaction Profile**: Strategic Enterprise Acquisition — $650M Cash\n> * **Strategic Objective**: Integrating automated identity threat detection (ITDR) into the Cortex XSIAM SOC platform\n> * **CISO Budget Impact**: Eliminates standalone identity monitoring tools in favor of unified platform consolidation.\n\nIn a major strategic consolidation within the cybersecurity ecosystem, **Palo Alto Networks** has finalized its **$650M strategic acquisition** of leading Identity Threat Detection and Response (ITDR) pioneer. The transaction accelerates the industry-wide consolidation toward unified autonomous Security Operations Centers (SOCs).\n\n### Architectural Differentiation & Technical Moat\n\nThe acquired technology directly bolsters Cortex XSIAM by correlating non-human identity (NHI) service accounts, token impersonation attempts, and lateral movement in real time:\n\n* **Non-Human Identity Defense**: Continuously audits API keys, service principals, and machine credentials across multi-cloud nodes.\n* **Automated Token Revocation**: Automatically severs compromised OAuth grants and active session cookies upon detecting anomalous token usage.\n* **Native Platform Integration**: Binds identity context directly into enterprise EDR and cloud firewalls.\n\n---\n\n*This SecTech venture analysis was synthesized by the **HackerPost Autonomous Newsroom Engine**. Primary reporting referenced from **SecurityWeek M&A & Funding** (https://www.securityweek.com/category/mergers-acquisitions/).*`,
      category: 'M&A & Funding',
      location: 'Cyber-M&A',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      sourceUrl: 'https://www.securityweek.com/category/mergers-acquisitions/',
      similarityScore: 0,
      views: 640,
      severity: 'High',
      affectedProduct: 'Palo Alto Networks / Cortex',
      fundingAmount: '$650M',
      fundingRound: 'M&A Acquisition',
      disclosureStatus: 'Acquired',
      disclosureDate: '2026-08-19'
    });
  }

  const hasBench = db.publishedArticles.some(a => a.id === 'pub-bench-1');
  if (!hasBench) {
    db.publishedArticles.unshift({
      id: 'pub-bench-1',
      providerName: 'Meta AI & MITRE Engenuity',
      originalTitle: 'Meta Releases CyberSecEval 3: Standardized Benchmarks for AI in Cybersecurity',
      title: 'Benchmark Report: Meta Releases CyberSecEval 3 — Ranking Claude 3.7 Sonnet, GPT-4o, and CyberSec Llama on Exploit Synthesis & Prompt Injection',
      content: `> [!TIP]\n> **AI Security Benchmark Executive Takeaway:**\n> * **Benchmark Release**: Meta AI CyberSecEval 3 & MITRE Engenuity Cyber AI Bench\n> * **#1 Overall Performer**: Claude 3.7 Sonnet (94.2 Overall Security Index, 71.4% SWE-bench Sec Patching)\n> * **Highest Prompt Injection Defense**: Claude 3.7 Sonnet (93.8%) followed by Gemini 2.0 Pro (92.0%)\n> * **Top Open-Weights Model**: CyberSec Llama 3.3 70B (89.4 Overall, Air-Gapped Ready)\n> * **CISO Procurement Advice**: For automated code remediation, frontier reasoning models outperform general-purpose LLMs by 34% in multi-file patch validation.\n\nA joint evaluation report released by **Meta AI Research**, **MITRE Engenuity**, and the **USENIX Security Consortium** has established the latest standardized benchmarks for Large Language Models deployed across enterprise cybersecurity environments.\n\n### Benchmark Vectors & Testing Methodology\n\nThe **CyberSecEval 3** framework subjects models to automated red-teaming across five critical domains:\n\n1. **Autonomous CVE Remediation (SWE-bench Sec)**: Models are tasked with fixing real-world historical CVEs without introducing regressions or secondary flaws.\n2. **Threat Hunting & SIEM Correlation (MITRE ATT&CK)**: Generating Sigma, KQL, and Splunk SPL queries from raw firewall and endpoint telemetry.\n3. **Prompt Injection & Jailbreak Defense**: Resistance against multi-turn indirect prompt injections delivered via malicious email headers and RAG attachments.\n4. **Offensive Exploit Discovery & CTF Solving**: Identifying memory corruptions and synthesizing working proof-of-concept exploits.\n5. **Insecure Code Generation Rate**: Frequency at which the model suggests vulnerable code snippets (e.g. SQL injection, buffer overflows) during normal development tasks.\n\n### Comparative Leaderboard Highlights\n\n* **Claude 3.7 Sonnet** achieved the highest score in autonomous vulnerability patching (**71.4%**) and lowest insecure code generation rate (**3.2%**).\n* **GPT-4o / o3-mini** led the field in high-speed SOC alert triage and JSON schema reliability for automated SOAR orchestration.\n* **Gemini 2.0 Pro** leveraged its 2M token context window to outperform all models in ingesting raw, multi-gigabyte PCAP packet captures and enterprise forensic logs.\n* **CyberSec Llama 3.3 70B** set the benchmark for open-weights models, offering sovereign on-premise deployment with zero external API telemetry leakage.\n\n---\n\n*This AI security benchmark analysis was synthesized by the **HackerPost Autonomous Newsroom Engine**. Primary benchmark datasets referenced from **Meta AI Research & MITRE Engenuity** (https://hackerpost.online/benchmarks).*`,
      category: 'AI Benchmarks',
      location: 'AI-Benchmarks',
      publishedAt: new Date().toISOString(),
      sourceUrl: 'https://ai.meta.com/research/publications/cyberseceval-3/',
      similarityScore: 0,
      views: 1420,
      severity: 'Critical',
      affectedProduct: 'Frontier & Open SecLLMs',
      fundingAmount: 'Top Score: 94.2',
      fundingRound: 'Benchmark Leaderboard',
      disclosureStatus: 'Evaluated (Q3 2026)',
      disclosureDate: '2026-08-21'
    });
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  console.log('Seeded database successfully with Benchmarks and SecTech Startups!');
}
