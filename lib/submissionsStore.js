import fs from 'fs';
import path from 'path';

const SUBMISSIONS_FILE = path.join(process.cwd(), 'data', 'submissions.json');

// In-memory cache for serverless environments
let memorySubmissions = null;

const SEED_SUBMISSIONS = [
  {
    id: "sub-seed-1",
    type: "funding",
    tier: "Spotlight",
    companyName: "Cyera",
    contactName: "Yotam Segev",
    contactEmail: "press@cyera.io",
    website: "https://www.cyera.com",
    title: "Cyera Secures $300M Series D to Lead Enterprise AI Data Security Posture Management",
    fundingAmount: "$300M",
    fundingRound: "Series D",
    category: "SecTech & Startups",
    summary: "Secured $300M Series D financing round valuing company at $3 Billion, led by Sequoia Capital, Accel, and Cyberstarts.",
    pressReleaseUrl: "https://www.cyera.com/news/series-d-300m",
    status: "approved_published",
    submittedAt: "2026-08-20T10:00:00Z"
  }
];

function getStore() {
  if (memorySubmissions) return memorySubmissions;

  try {
    if (!fs.existsSync(path.dirname(SUBMISSIONS_FILE))) {
      fs.mkdirSync(path.dirname(SUBMISSIONS_FILE), { recursive: true });
    }

    if (!fs.existsSync(SUBMISSIONS_FILE)) {
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(SEED_SUBMISSIONS, null, 2), 'utf-8');
      memorySubmissions = SEED_SUBMISSIONS;
      return SEED_SUBMISSIONS;
    }

    const raw = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    memorySubmissions = Array.isArray(parsed) ? parsed : SEED_SUBMISSIONS;
    return memorySubmissions;
  } catch (err) {
    memorySubmissions = SEED_SUBMISSIONS;
    return SEED_SUBMISSIONS;
  }
}

function saveStore(data) {
  memorySubmissions = data;
  try {
    if (!fs.existsSync(path.dirname(SUBMISSIONS_FILE))) {
      fs.mkdirSync(path.dirname(SUBMISSIONS_FILE), { recursive: true });
    }
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (_) {}
}

export function getSubmissions() {
  return getStore();
}

export function addSubmission(payload) {
  const store = getStore();
  const newSubmission = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: payload.type || "press_release", // "press_release" | "funding" | "vulnerability" | "claim_profile"
    tier: payload.tier || "Free", // "Free" | "FastTrack" | "Spotlight"
    companyName: payload.companyName ? String(payload.companyName).trim() : "Independent Contributor",
    contactName: payload.contactName ? String(payload.contactName).trim() : "",
    contactEmail: payload.contactEmail ? String(payload.contactEmail).trim().toLowerCase() : "",
    website: payload.website ? String(payload.website).trim() : "",
    title: payload.title ? String(payload.title).trim() : "Breaking SecTech Submission",
    fundingAmount: payload.fundingAmount || "",
    fundingRound: payload.fundingRound || "",
    category: payload.category || "SecTech & Startups",
    summary: payload.summary || "",
    pressReleaseUrl: payload.pressReleaseUrl || "",
    cve: payload.cve || "",
    status: "pending_review",
    submittedAt: new Date().toISOString()
  };

  store.unshift(newSubmission);
  saveStore(store);
  return newSubmission;
}

export function updateSubmissionStatus(id, newStatus) {
  const store = getStore();
  const target = store.find(s => s.id === id);
  if (target) {
    target.status = newStatus;
    saveStore(store);
    return target;
  }
  return null;
}
