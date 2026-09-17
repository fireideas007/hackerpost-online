import { getPublishedArticles, getPublishedArticleById } from "../../../../lib/newsStore.js";

export const dynamic = "force-dynamic";

const CATEGORY_THEMES = {
  "Zero-Days": { primary: "#ef4444", secondary: "#7f1d1d", accent: "#f87171", bg1: "#180608", bg2: "#080203" },
  "Ransomware": { primary: "#f97316", secondary: "#7c2d12", accent: "#fb923c", bg1: "#190a04", bg2: "#070201" },
  "Exploits": { primary: "#eab308", secondary: "#713f12", accent: "#fde047", bg1: "#181303", bg2: "#080601" },
  "Supply Chain": { primary: "#a855f7", secondary: "#581c87", accent: "#c084fc", bg1: "#14061f", bg2: "#06020a" },
  "SecTech & Startups": { primary: "#00d084", secondary: "#065f46", accent: "#34d399", bg1: "#021a12", bg2: "#010805" },
  "M&A & Funding": { primary: "#10b981", secondary: "#064e3b", accent: "#6ee7b7", bg1: "#021a13", bg2: "#010906" },
  "Data Breaches": { primary: "#38bdf8", secondary: "#075985", accent: "#7dd3fc", bg1: "#04141e", bg2: "#02070a" },
  "AI Benchmarks": { primary: "#ec4899", secondary: "#831843", accent: "#f472b6", bg1: "#1c0410", bg2: "#080105" },
  "Advisories": { primary: "#00e5ff", secondary: "#0369a1", accent: "#38bdf8", bg1: "#031521", bg2: "#02070b" }
};

function escapeXml(unsafe = "") {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text, maxCharsPerLine = 34, maxLines = 3) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const w of words) {
    if ((currentLine + " " + w).length > maxCharsPerLine) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = w;
      if (lines.length >= maxLines) break;
    } else {
      currentLine += (currentLine ? " " : "") + w;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine.trim());
  }
  if (words.length > 0 && lines.length === maxLines && currentLine !== words[words.length - 1]) {
    lines[lines.length - 1] += "...";
  }
  return lines;
}

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const rawParam = resolvedParams.slug || "";
  const slug = rawParam.replace(/\.svg$/i, "");

  // Lookup article by slug or ID
  let article = getPublishedArticleById(slug);
  if (!article) {
    const all = getPublishedArticles();
    article = all.find(a => a.slug === slug || a.id === slug) || null;
  }

  const category = article?.category || "Advisories";
  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES["Advisories"];
  const title = article?.title || slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const cve = article?.cve || "";
  const funding = article?.fundingAmount || "";
  const vendor = article?.affectedProduct || (article?.providerName ? article.providerName.split(" ")[0] : "Enterprise");
  const date = article?.publishedAt ? new Date(article.publishedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

  const lines = wrapText(title, 32, 3);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg1}"/>
      <stop offset="60%" stop-color="${theme.bg2}"/>
      <stop offset="100%" stop-color="#020408"/>
    </linearGradient>
    <radialGradient id="glow" cx="85%" cy="20%" r="60%">
      <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="${theme.primary}" stroke-width="0.75" stroke-opacity="0.09"/>
    </pattern>
  </defs>

  <!-- Background Layers -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Tech Geometric Telemetry -->
  <circle cx="1020" cy="180" r="170" fill="none" stroke="${theme.primary}" stroke-width="1.5" stroke-opacity="0.2" stroke-dasharray="6,8"/>
  <circle cx="1020" cy="180" r="115" fill="none" stroke="${theme.accent}" stroke-width="1" stroke-opacity="0.3"/>
  <circle cx="1020" cy="180" r="45" fill="${theme.primary}" fill-opacity="0.12"/>
  <line x1="930" y1="180" x2="1110" y2="180" stroke="${theme.primary}" stroke-width="1" stroke-opacity="0.35"/>
  <line x1="1020" y1="90" x2="1020" y2="270" stroke="${theme.primary}" stroke-width="1" stroke-opacity="0.35"/>

  <!-- Header Branding -->
  <g transform="translate(80, 75)">
    <rect x="0" y="0" width="14" height="14" fill="${theme.primary}"/>
    <text x="26" y="12" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="900" fill="#f8fafc" letter-spacing="3">HACKERPOST</text>
    <text x="175" y="12" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="${theme.primary}" letter-spacing="3">DISPATCH</text>
  </g>

  <!-- Category & Badges -->
  <g transform="translate(80, 145)">
    <rect x="0" y="0" width="${escapeXml(category).length * 11 + 36}" height="36" rx="4" fill="${theme.primary}" fill-opacity="0.16" stroke="${theme.primary}" stroke-width="1.2"/>
    <text x="18" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="${theme.primary}" letter-spacing="2">${escapeXml(category.toUpperCase())}</text>

    ${cve ? `
      <g transform="translate(${escapeXml(category).length * 11 + 52}, 0)">
        <rect x="0" y="0" width="${escapeXml(cve).length * 10 + 28}" height="36" rx="4" fill="#0f172a" stroke="rgba(248, 250, 252, 0.25)" stroke-width="1"/>
        <text x="14" y="23" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="13" font-weight="700" fill="#f8fafc" letter-spacing="1">${escapeXml(cve)}</text>
      </g>
    ` : ""}

    ${funding ? `
      <g transform="translate(${escapeXml(category).length * 11 + 52}, 0)">
        <rect x="0" y="0" width="${escapeXml(funding).length * 12 + 28}" height="36" rx="4" fill="#064e3b" stroke="#10b981" stroke-width="1.2"/>
        <text x="14" y="23" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="14" font-weight="800" fill="#34d399">${escapeXml(funding)}</text>
      </g>
    ` : ""}
  </g>

  <!-- Headline Lines -->
  <g transform="translate(80, 270)">
    ${lines.map((l, i) => `<text x="0" y="${i * 68}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" fill="#f8fafc" letter-spacing="-0.5">${escapeXml(l)}</text>`).join("\n    ")}
  </g>

  <!-- Footer Metadata Bar -->
  <g transform="translate(80, 540)">
    <line x1="0" y1="0" x2="1040" y2="0" stroke="${theme.primary}" stroke-width="1" stroke-opacity="0.25"/>
    <text x="0" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#94a3b8" letter-spacing="1">VERIFIED TELEMETRY WIRE</text>
    ${vendor ? `<text x="300" y="36" font-family="ui-monospace, SFMono-Regular, monospace" font-size="14" font-weight="700" fill="${theme.accent}">// ${escapeXml(vendor.toUpperCase())}</text>` : ""}
    <text x="1040" y="36" text-anchor="end" font-family="ui-monospace, SFMono-Regular, monospace" font-size="14" font-weight="600" fill="#64748b">${escapeXml(date)}</text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
    }
  });
}
