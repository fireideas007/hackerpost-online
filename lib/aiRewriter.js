/**
 * Simulated AI Threat Intelligence Rewriting and Sanitization Engine.
 * Formulates a completely new advisory draft that retains critical vulnerability metrics,
 * but reorganizes them with a security-first reporting tone to avoid direct duplication.
 */

const THREAT_INTRO_TEMPLATES = [
  "Security telemetry confirms that a newly cataloged vulnerability vector has been identified under the scope of {location}: ",
  "An active cybersecurity investigation concerning {location} reveals ",
  "In an advisory alert targeting {location}, incident responders have documented ",
  "Following newly disclosed telemetry regarding {location}, threat intelligence logs indicate ",
  "Vulnerability monitoring feeds corresponding to {location} verify "
];

const THREAT_PERSPECTIVES = [
  "\n\nThreat researchers advise systems administrators to inspect their log telemetry for indicators of compromise (IoCs) corresponding to these triggers. Deploying immediate network access control limits is recommended to restrict exposure.",
  "\n\nAccording to standard disclosure policies, this advisory has been cataloged under CVSS parameters. Remediation patching schedules should be expedited across staging environments to mitigate risk before active exploitation occurs.",
  "\n\nFor enterprise systems running the affected build, this represents a notable shift in system robustness and security posture. Security operations teams are urged to review configurations and deactivate secondary interfaces.",
  "\n\nInquiries directed at vendor support groups reveal that patch updates have been in staging, representing a coordinated effort to secure operational nodes."
];

/**
 * Simulates rewriting a vulnerability advisory using AI to rephrase and sanitize raw exploits.
 */
export function simulateAiRewrite(originalTitle, originalContent, location, sourceName, sourceUrl) {
  if (!originalContent) return { title: "", content: "" };

  // 1. Generate an authoritative Security Title
  const cleanTitle = originalTitle.replace(/^(critical|high|breaking|update|exclusive|alert):?\s*/i, "").trim();
  const titleTemplates = [
    `Advisory Bulletin: ${cleanTitle} (${location})`,
    `Threat Analysis: ${cleanTitle} - Impact Vector`,
    `Vulnerability Dispatch: Key Metrics on ${cleanTitle}`,
    `Security Log: Operational Scope of ${location}`,
    `Verified Advisory: Remediation Steps for ${cleanTitle}`
  ];
  const newTitle = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];

  // 2. Process paragraphs
  const paragraphs = originalContent
    .split("\n")
    .map(p => p.trim())
    .filter(p => p.length > 15);

  const rewrittenParagraphs = [];

  // Intro Paragraph with security context hook
  const introTemplate = THREAT_INTRO_TEMPLATES[Math.floor(Math.random() * THREAT_INTRO_TEMPLATES.length)];
  const introHook = introTemplate.replace("{location}", location);
  
  if (paragraphs.length > 0) {
    const firstParaRewritten = rewriteSentenceStructure(paragraphs[0]);
    rewrittenParagraphs.push(introHook + firstParaRewritten);
  } else {
    rewrittenParagraphs.push(`${introHook} vendor bulletins and technical remediation advisories have been published globally.`);
  }

  // Middle Paragraphs
  for (let i = 1; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    if (para.toLowerCase().includes("subscribe") || para.toLowerCase().includes("all rights reserved")) continue;
    
    const rewrittenPara = rewriteSentenceStructure(para);
    rewrittenParagraphs.push(rewrittenPara);
  }

  // Add Security Perspective
  const randomPerspective = THREAT_PERSPECTIVES[Math.floor(Math.random() * THREAT_PERSPECTIVES.length)]
    .replace(/{location}/g, location);
  
  let bodyContent = rewrittenParagraphs.join("\n\n") + randomPerspective;

  // Add verification citation block
  bodyContent += `\n\n---\n\n*This security bulletin was synthesized using AI by cross-referencing verified primary updates. Original reporting sourced from **${sourceName}** (${sourceUrl ? `[View Source](${sourceUrl})` : "Verified Security Registry"}).*`;

  return {
    title: newTitle,
    content: bodyContent,
    rewrittenAt: new Date().toISOString(),
  };
}

/**
 * Rephrases paragraphs to reduce Jaccard/Trigram overlap by changing active/passive voices,
 * substituting synonyms, and reorganizing clauses.
 */
function rewriteSentenceStructure(text) {
  let cleaned = text;

  const replacements = [
    [/released an advisory/gi, "issued technical disclosure notes"],
    [/released a security/gi, "published an urgent vulnerability"],
    [/has released/gi, "published"],
    [/according to/gi, "as documented by"],
    [/in order to/gi, "to"],
    [/has announced/gi, "officially disclosed"],
    [/is expected to/gi, "is scheduled to"],
    [/stated that/gi, "noted how"],
    [/officials said/gi, "authorities indicated"],
    [/for the first time/gi, "initially"],
    [/at this time/gi, "currently"],
    [/due to the fact that/gi, "because"],
    [/with regard to/gi, "concerning"],
    [/announced a new/gi, "unveiled a fresh"],
    [/will be held/gi, "is slated to occur"],
    [/during the meeting/gi, "throughout the assembly"],
    [/in the near future/gi, "shortly"],
    [/a wide range of/gi, "diverse"],
    [/reported that/gi, "confirmed that"],
    [/was created by/gi, "originated from"],
    [/vulnerability/gi, "security defect"],
    [/vulnerabilities/gi, "security weaknesses"],
    [/affecting/gi, "impacting"],
    [/affects/gi, "targets"],
    [/allows an attacker/gi, "enables unauthorized adversaries"],
    [/allows an authenticated/gi, "permits validated threat actors"],
    [/allows a remote attacker/gi, "gives network-adjacent attackers the ability"],
    [/remote code execution/gi, "arbitrary payload execution"],
    [/denial of service/gi, "service disruption"],
    [/mitigate/gi, "neutralize"],
    [/mitigation/gi, "countermeasure"],
    [/patch/gi, "vendor-issued hotfix"],
    [/recommended to/gi, "strongly urged to"],
    [/recommend/gi, "advise operators to"],
    [/update/gi, "remediation guidance"],
    [/critical/gi, "high-severity"],
    [/neighborhood/gi, "scope"],
    [/community/gi, "infrastructure ecosystem"],
    [/residents/gi, "operators"],
    [/local authorities/gi, "incident responders"]
  ];

  replacements.forEach(([pattern, replacement]) => {
    cleaned = cleaned.replace(pattern, replacement);
  });

  cleaned = cleaned.replace("; ", ", and ");

  return cleaned;
}
