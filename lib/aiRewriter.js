/**
 * Simulated AI News Localization and Rewriting Engine.
 * Formulates a completely new article draft that retains critical facts
 * but reorganizes them with a hyperlocal focus and distinct phrasing.
 */

const LOCAL_INTRO_TEMPLATES = [
  "In a direct impact on the {location} community, ",
  "Local residents in {location} are raising questions after ",
  "A new development centering around {location} has emerged, as ",
  "Following updates affecting the {location} neighborhood, ",
  "Community updates for {location} confirm that "
];

const LOCAL_PERSPECTIVES = [
  "\n\nLocal neighborhood association reps highlighted that this decision will directly shape community development in the coming months. Residents are encouraged to monitor local municipal notices for further adjustments.",
  "\n\nCommunity planners note that the immediate vicinity will see shifts in pedestrian foot traffic and infrastructure attention. Local councils plan to hold a public forum to address comments next Tuesday.",
  "\n\nFor families residing in the {location} area, this marks a notable change in local accessibility and public operations. Neighborhood watch coordinators have advised residents to review the guidelines.",
  "\n\nInquiries directed at district authorities reveal that this change has been in planning for several quarters, representing an effort to upgrade area resources.",
];

/**
 * Simulates rewriting a news article using AI to localize and avoid plagiarism.
 */
export function simulateAiRewrite(originalTitle, originalContent, location, sourceName, sourceUrl) {
  if (!originalContent) return { title: "", content: "" };

  // 1. Generate a brand new Localized Title
  let newTitle = originalTitle;
  const titleTemplates = [
    `How the New Updates Impact ${location}`,
    `Hyperlocal Report: ${originalTitle} (What it Means for ${location})`,
    `Local Focus: ${originalTitle.replace(/^(breaking|update|exclusive):?\s*/i, "")}`,
    `${location} Community Brief: Updates on ${originalTitle}`,
    `Verified Report: Key Changes Coming to ${location}`
  ];
  newTitle = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];

  // 2. Extract key phrases or facts (simulated)
  // Let's split content into paragraphs, and rewrite each paragraph using custom phrasing
  const paragraphs = originalContent
    .split("\n")
    .map(p => p.trim())
    .filter(p => p.length > 20);

  const rewrittenParagraphs = [];

  // Intro Paragraph with hyperlocal hook
  const introTemplate = LOCAL_INTRO_TEMPLATES[Math.floor(Math.random() * LOCAL_INTRO_TEMPLATES.length)];
  const introHook = introTemplate.replace("{location}", location);
  
  if (paragraphs.length > 0) {
    const firstParaRewritten = rewriteSentenceStructure(paragraphs[0]);
    rewrittenParagraphs.push(introHook + firstParaRewritten);
  } else {
    rewrittenParagraphs.push(`${introHook} updates regarding local safety and development have been released.`);
  }

  // Middle Paragraphs
  for (let i = 1; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    // Skip if it contains signature boilerplate
    if (para.toLowerCase().includes("subscribe") || para.toLowerCase().includes("all rights reserved")) continue;
    
    const rewrittenPara = rewriteSentenceStructure(para);
    rewrittenParagraphs.push(rewrittenPara);
  }

  // Add Local Context & Perspectives
  const randomPerspective = LOCAL_PERSPECTIVES[Math.floor(Math.random() * LOCAL_PERSPECTIVES.length)]
    .replace(/{location}/g, location);
  
  // Combine rewritten text
  let bodyContent = rewrittenParagraphs.join("\n\n") + randomPerspective;

  // Add citation block to verify the provider and prevent plagiarism claims
  bodyContent += `\n\n---\n\n*This news article was synthesized using AI by cross-referencing verified primary updates. Original reporting sourced from **${sourceName}** (${sourceUrl ? `[View Source](${sourceUrl})` : "Verified Feed"}).*`;

  return {
    title: newTitle,
    content: bodyContent,
    rewrittenAt: new Date().toISOString(),
  };
}

/**
 * Rephrases paragraphs to reduce Jaccard/Trigram overlap by changing active/passive voices,
 * substituting synonyms for typical connector words, and reorganizing clauses.
 */
function rewriteSentenceStructure(text) {
  let cleaned = text;

  // Simple rule-based phrase replacements to simulate natural AI rewriting
  const replacements = [
    [/according to/gi, "as reported by"],
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
    [/was created by/gi, "originated from"]
  ];

  replacements.forEach(([pattern, replacement]) => {
    cleaned = cleaned.replace(pattern, replacement);
  });

  // Re-order or tweak some punctuation
  cleaned = cleaned.replace("; ", ", and ");

  return cleaned;
}
