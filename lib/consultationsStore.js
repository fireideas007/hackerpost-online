import fs from 'fs';
import path from 'path';

const CONSULTATIONS_FILE = path.join(process.cwd(), 'data', 'consultations.json');

let memoryConsultations = null;

const SEED_CONSULTATIONS = [
  {
    id: "consult-seed-1",
    companyName: "Global FinTech Holdings",
    contactName: "Marcus Vance",
    contactEmail: "marcus.vance@globalfintech.io",
    role: "Chief Information Security Officer (CISO)",
    infraSize: "1,000 - 5,000 Cloud Instances (AWS/Azure)",
    serviceNeeded: "Zero-Day Attack Surface Audit & SEC Compliance Readiness",
    threatConcern: "Concerned about recent unauthenticated RCE and supply chain exposures.",
    urgency: "urgent",
    status: "new_inquiry",
    submittedAt: "2026-08-25T14:20:00Z"
  }
];

function getStore() {
  if (memoryConsultations) return memoryConsultations;

  try {
    if (!fs.existsSync(path.dirname(CONSULTATIONS_FILE))) {
      fs.mkdirSync(path.dirname(CONSULTATIONS_FILE), { recursive: true });
    }

    if (!fs.existsSync(CONSULTATIONS_FILE)) {
      fs.writeFileSync(CONSULTATIONS_FILE, JSON.stringify(SEED_CONSULTATIONS, null, 2), 'utf-8');
      memoryConsultations = SEED_CONSULTATIONS;
      return SEED_CONSULTATIONS;
    }

    const raw = fs.readFileSync(CONSULTATIONS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    memoryConsultations = Array.isArray(parsed) ? parsed : SEED_CONSULTATIONS;
    return memoryConsultations;
  } catch (_) {
    memoryConsultations = SEED_CONSULTATIONS;
    return SEED_CONSULTATIONS;
  }
}

function saveStore(data) {
  memoryConsultations = data;
  try {
    if (!fs.existsSync(path.dirname(CONSULTATIONS_FILE))) {
      fs.mkdirSync(path.dirname(CONSULTATIONS_FILE), { recursive: true });
    }
    fs.writeFileSync(CONSULTATIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (_) {}
}

export function getConsultations() {
  return getStore();
}

export function addConsultation(payload) {
  const store = getStore();
  const newConsultation = {
    id: `consult-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    companyName: payload.companyName ? String(payload.companyName).trim() : "Confidential Enterprise",
    contactName: payload.contactName ? String(payload.contactName).trim() : "",
    contactEmail: payload.contactEmail ? String(payload.contactEmail).trim().toLowerCase() : "",
    role: payload.role ? String(payload.role).trim() : "CISO / Security Leader",
    infraSize: payload.infraSize ? String(payload.infraSize).trim() : "Enterprise Cloud Footprint",
    serviceNeeded: payload.serviceNeeded ? String(payload.serviceNeeded).trim() : "Penetration Testing & Remediation",
    threatConcern: payload.threatConcern ? String(payload.threatConcern).trim() : "",
    urgency: payload.urgency || "standard",
    status: "new_inquiry",
    submittedAt: new Date().toISOString()
  };

  store.unshift(newConsultation);
  saveStore(store);
  return newConsultation;
}

export function updateConsultationStatus(id, newStatus) {
  const store = getStore();
  const target = store.find(c => c.id === id);
  if (target) {
    target.status = newStatus;
    saveStore(store);
    return target;
  }
  return null;
}
