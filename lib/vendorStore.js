import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'vendorLeaderboard.json');

// In-memory fallback
let memoryData = null;

function readLeaderboardFile() {
  if (memoryData) return memoryData;

  try {
    if (fs.existsSync(LEADERBOARD_FILE)) {
      const raw = fs.readFileSync(LEADERBOARD_FILE, 'utf-8');
      memoryData = JSON.parse(raw);
      return memoryData;
    }
  } catch (err) {
    console.error("Error reading vendorLeaderboard.json:", err);
  }

  // Fallback defaults if file missing or unreadable
  memoryData = {
    lastUpdated: new Date().toISOString(),
    totalVoters: 1420,
    domains: [
      "All Domains",
      "Cloud Security & DSPM",
      "Autonomous SOC & AI Defense",
      "Identity Threat Defense (ITDR)",
      "Endpoint Protection & XDR",
      "AppSec & DevSecOps",
      "Emerging High-Growth Startups"
    ],
    vendors: [],
    nominations: []
  };
  return memoryData;
}

function saveLeaderboardFile(data) {
  memoryData = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Non-fatal on read-only/container filesystems
    console.warn("Could not persist vendorLeaderboard.json to disk (in-memory preserved):", err.message);
  }
}

/**
 * Recalculate composite CISO Score (0-100) based on weighted capability metrics and community endorsements
 */
export function calculateCisoCompositeScore(vendor) {
  const autonomy = Number(vendor.autonomyScore) || 80;
  const precision = Number(vendor.precisionScore) || 80;
  const integration = Number(vendor.integrationScore) || 80;
  const value = Number(vendor.valueScore) || 80;

  // Baseline capability average (65% weight)
  const capabilityWeight = (autonomy * 0.25) + (precision * 0.25) + (integration * 0.25) + (value * 0.25);

  // Community endorsement sentiment (35% weight)
  const up = Number(vendor.upvotes) || 0;
  const down = Number(vendor.downvotes) || 0;
  const total = up + down;
  const sentimentRate = total > 0 ? (up / total) * 100 : 85;

  const composite = (capabilityWeight * 0.65) + (sentimentRate * 0.35);
  return Math.round(composite * 10) / 10;
}

/**
 * Fetch vendors with filtering, sorting, and search
 */
export function getVendorLeaderboard({ category = "All Domains", sortBy = "rank", search = "" } = {}) {
  const data = readLeaderboardFile();
  let vendors = [...data.vendors];

  // 1. Filter by category domain
  if (category && category !== "All Domains" && category !== "all") {
    const cleanCat = category.trim().toLowerCase();
    vendors = vendors.filter(v => v.category.toLowerCase().includes(cleanCat));
  }

  // 2. Filter by search query
  if (search && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    vendors = vendors.filter(v => 
      v.name.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.primaryDifferentiator.toLowerCase().includes(q) ||
      (v.tags && v.tags.some(t => t.toLowerCase().includes(q))) ||
      v.headquarters.toLowerCase().includes(q)
    );
  }

  // 3. Dynamic recalculation of scores & ranks
  vendors = vendors.map(v => ({
    ...v,
    cisoScore: calculateCisoCompositeScore(v),
    netScore: (v.upvotes || 0) - (v.downvotes || 0)
  }));

  // 4. Sort
  if (sortBy === "endorsements" || sortBy === "upvotes") {
    vendors.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  } else if (sortBy === "autonomy") {
    vendors.sort((a, b) => b.autonomyScore - a.autonomyScore);
  } else if (sortBy === "precision") {
    vendors.sort((a, b) => b.precisionScore - a.precisionScore);
  } else if (sortBy === "integration") {
    vendors.sort((a, b) => b.integrationScore - a.integrationScore);
  } else if (sortBy === "value") {
    vendors.sort((a, b) => b.valueScore - a.valueScore);
  } else if (sortBy === "cisoScore") {
    vendors.sort((a, b) => b.cisoScore - a.cisoScore);
  } else {
    // Default rank by composite CISO score
    vendors.sort((a, b) => b.cisoScore - a.cisoScore);
  }

  // Assign visible rank indexes
  vendors = vendors.map((v, idx) => ({
    ...v,
    rank: idx + 1
  }));

  return {
    success: true,
    lastUpdated: data.lastUpdated,
    totalVoters: data.totalVoters,
    totalVendors: vendors.length,
    domains: data.domains,
    vendors
  };
}

/**
 * Get vendor by unique ID
 */
export function getVendorById(id) {
  const data = readLeaderboardFile();
  const vendor = data.vendors.find(v => v.id === id);
  if (!vendor) return null;

  return {
    ...vendor,
    cisoScore: calculateCisoCompositeScore(vendor),
    netScore: (vendor.upvotes || 0) - (vendor.downvotes || 0)
  };
}

/**
 * Cast a CISO vote / capability endorsement
 */
export function castVendorVote({ vendorId, voteType = "up", voterRole = "CISO / Security Director", voterOrg = "Enterprise" }) {
  const data = readLeaderboardFile();
  const index = data.vendors.findIndex(v => v.id === vendorId);
  
  if (index === -1) {
    return { success: false, message: "Vendor not found in capability index." };
  }

  const vendor = data.vendors[index];

  if (voteType === "up" || voteType === "endorse") {
    vendor.upvotes = (vendor.upvotes || 0) + 1;
    vendor.endorsementsCount = (vendor.endorsementsCount || 0) + 1;
  } else if (voteType === "down") {
    vendor.downvotes = (vendor.downvotes || 0) + 1;
  }

  // Increment platform voter tally
  data.totalVoters = (data.totalVoters || 1420) + 1;
  data.lastUpdated = new Date().toISOString();

  // Recalculate score
  vendor.cisoScore = calculateCisoCompositeScore(vendor);

  saveLeaderboardFile(data);

  return {
    success: true,
    message: `Vote recorded for ${vendor.name}. Current score: ${vendor.cisoScore} (${vendor.upvotes} endorsements).`,
    vendor: {
      id: vendor.id,
      name: vendor.name,
      upvotes: vendor.upvotes,
      downvotes: vendor.downvotes,
      endorsementsCount: vendor.endorsementsCount,
      cisoScore: vendor.cisoScore,
      netScore: vendor.upvotes - vendor.downvotes
    },
    totalVoters: data.totalVoters
  };
}

/**
 * Nominate a new startup or claim profile
 */
export function submitStartupNomination({ companyName, website, category, founderEmail, differentiator, valuationOrFunding }) {
  if (!companyName || !founderEmail) {
    return { success: false, message: "Company name and submitter email are required." };
  }

  const data = readLeaderboardFile();
  if (!data.nominations) data.nominations = [];

  const nomination = {
    id: `nom-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    companyName: companyName.trim(),
    website: website ? website.trim() : "",
    category: category || "Emerging High-Growth Startups",
    founderEmail: founderEmail.trim().toLowerCase(),
    differentiator: differentiator ? differentiator.trim() : "",
    valuationOrFunding: valuationOrFunding ? valuationOrFunding.trim() : "Seed / Series A",
    status: "Pending Editorial Review"
  };

  data.nominations.push(nomination);
  saveLeaderboardFile(data);

  return {
    success: true,
    message: "Nomination submitted successfully. Our editorial desk reviews all submissions within 24 hours.",
    nominationId: nomination.id
  };
}
