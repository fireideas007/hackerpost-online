import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Mock data to seed the database if it doesn't exist
const SEED_PROVIDERS = [
  { id: "prov-mta", name: "Metro Transit Authority (MTA)", category: "Transit", trustScore: 98, verifiedUrl: "https://mta.info/alerts" },
  { id: "prov-dpw", name: "Department of Public Works (DPW)", category: "Infrastructure", trustScore: 95, verifiedUrl: "https://city.gov/dpw" },
  { id: "prov-school", name: "District Education & School Board", category: "Education", trustScore: 99, verifiedUrl: "https://districtschools.edu" },
  { id: "prov-police", name: "First Precinct Police Blotter", category: "Safety", trustScore: 90, verifiedUrl: "https://police.city.gov/blotter" },
  { id: "prov-parks", name: "Municipal Parks & Recreation", category: "Community", trustScore: 92, verifiedUrl: "https://city.gov/parks" },
  { id: "prov-health", name: "County Environmental Health Board", category: "Health", trustScore: 97, verifiedUrl: "https://countyhealth.org/alerts" }
];

const SEED_RAW_ARTICLES = [
  {
    id: "raw-1",
    providerId: "prov-dpw",
    title: "Water Main Maintenance and Road Closure Scheduled for Broadway Avenue",
    content: "Notice is hereby given that the Department of Public Works will initiate critical water main repairs on Broadway Avenue between 4th Street and 8th Street. This activity is expected to cause major delays. Operations will commence at 7:00 AM on Monday, June 15th, and are projected to terminate by 6:00 PM on Friday, June 19th. The entire roadway segment will be closed to all vehicular traffic. Motorists are instructed to utilize detour pathways along Maple Avenue and Pine Street. Resident parking will be restricted throughout the construction zone, and violators will be towed. For enquiries, contact DPW hotlines at 555-0199.",
    publishedAt: "2026-06-10T14:30:00Z",
    sourceUrl: "https://city.gov/dpw/news/broadway-closure-water-main",
    category: "Infrastructure",
    defaultZipCode: "90210"
  },
  {
    id: "raw-2",
    providerId: "prov-parks",
    title: "Annual Summer Cultural Festival to Take Place in Oakridge Park next Saturday",
    content: "The Municipal Parks & Recreation Department is pleased to announce the schedule for the 22nd Annual Oakridge Summer Festival. The community event will take place on Saturday, June 20th, from 10:00 AM to 9:00 PM in the center grass meadows of Oakridge Park. Admissions will be free for all residents. The festival will feature a wide range of activities including live local music bands, over 40 artisan craft stalls, and a dedicated children's activity playground. Traditional foods will be sold by local food trucks. Security checks will be enforced at all entrance gates. No glass bottles or pets are permitted in the festival areas.",
    publishedAt: "2026-06-09T08:15:00Z",
    sourceUrl: "https://city.gov/parks/events/oakridge-summer-festival",
    category: "Community",
    defaultZipCode: "10001"
  },
  {
    id: "raw-3",
    providerId: "prov-health",
    title: "Air Quality Warning Issued for Low-Lying Valleys due to Windborne Particulates",
    content: "The County Environmental Health Board has issued an active health warning regarding elevated airborne particulate levels. Due to steady winds and low humidity, fine dust is collecting in low-lying valleys. Individuals suffering from chronic respiratory conditions, asthma, or cardiac issues are advised to restrict strenuous outdoor activities. Outdoor sports events should be postponed. Air quality levels are expected to exceed safe parameters for the next 48 hours. Residents are urged to keep windows closed and run air purifiers on high. Masks of N95 grade are recommended for anyone who must perform outdoor operations.",
    publishedAt: "2026-06-11T05:00:00Z",
    sourceUrl: "https://countyhealth.org/alerts/air-quality-june",
    category: "Health",
    defaultZipCode: "94102"
  },
  {
    id: "raw-4",
    providerId: "prov-school",
    title: "School Board Votes to Fund High School STEM Lab Expansion Project",
    content: "The District Education School Board concluded its monthly assembly with a critical vote, approving the allocation of $1.2M for the expansion of the High School STEM Lab. This funding will support the purchase of advanced 3D printers, robotic training assemblies, and upgraded high-performance computing systems. Construction is set to begin during the summer holidays starting in July and is scheduled to be completed by early September, just in time for the new academic calendar. The proposal passed with a 5-2 majority after extensive public consultation. Critics voiced concerns about budget constraints, but board members emphasized STEM literacy.",
    publishedAt: "2026-06-10T19:00:00Z",
    sourceUrl: "https://districtschools.edu/board/news/stem-funding-vote",
    category: "Education",
    defaultZipCode: "90210"
  },
  {
    id: "raw-5",
    providerId: "prov-mta",
    title: "Weekend Subway Track Maintenance to Alter Red Line Schedules on Saturday",
    content: "The Metro Transit Authority has announced that critical track maintenance and structural repairs will take place along the Red Line subway corridor this coming weekend. From 11:59 PM Friday until 5:00 AM Monday, Red Line trains will not stop at 14th Street and 23rd Street stations. Free shuttle bus services will operate continuously between 8th Street and 34th Street stations to assist commuters. Transit officials said riders should plan for an additional 20 minutes of travel time. This work is necessary to replace aging rail switches and prevent transit delays during peak commuting hours. Visit the MTA site for schedule details.",
    publishedAt: "2026-06-11T01:10:00Z",
    sourceUrl: "https://mta.info/alerts/red-line-weekend-work",
    category: "Transit",
    defaultZipCode: "10001"
  }
];

const SEED_PUBLISHED_ARTICLES = [
  {
    id: "pub-1",
    rawId: "raw-2",
    providerName: "Municipal Parks & Recreation",
    originalTitle: "Annual Summer Cultural Festival to Take Place in Oakridge Park next Saturday",
    title: "Oakridge Park to Host 22nd Annual Summer Cultural Festival on June 20",
    content: "Following updates affecting the 10001 neighborhood, the community is gearing up for the 22nd Annual Oakridge Summer Festival. The Municipal Parks & Recreation Department officially disclosed details for this highly anticipated local event.\n\nAdmissions will be free for all residents on Saturday, June 20th, with the festival running from 10:00 AM to 9:00 PM in the center grass meadows of Oakridge Park. The event is slated to occur with diverse activities, including live local music bands, over 40 artisan craft stalls, and a dedicated children's activity playground. Food options will be plentiful, with traditional meals sold by local food trucks.\n\nTo ensure safety, security checks will be enforced at all entrance gates. Attendees are reminded that no glass bottles or pets are permitted in the festival areas.\n\nFor families residing in the 10001 area, this marks a notable change in local accessibility and public operations. Neighborhood watch coordinators have advised residents to review the guidelines and walk or use transit to reduce traffic congestion.\n\n---\n\n*This news article was synthesized using AI by cross-referencing verified primary updates. Original reporting sourced from **Municipal Parks & Recreation** (https://city.gov/parks/events/oakridge-summer-festival).*",
    category: "Community",
    location: "10001",
    publishedAt: "2026-06-10T09:00:00Z",
    sourceUrl: "https://city.gov/parks/events/oakridge-summer-festival",
    similarityScore: 9,
    views: 142
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
  
  // Group and count search terms
  const counts = {};
  db.searchLogs.forEach(log => {
    // Normalize zip vs string
    const t = log.term.toUpperCase();
    counts[t] = (counts[t] || 0) + 1;
  });
  
  return Object.entries(counts)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // top 5
}

export function seedSearchLogs() {
  const db = getDB();
  db.searchLogs = [
    { term: "90210", timestamp: new Date().toISOString() },
    { term: "90210", timestamp: new Date().toISOString() },
    { term: "90210", timestamp: new Date().toISOString() },
    { term: "10001", timestamp: new Date().toISOString() },
    { term: "10001", timestamp: new Date().toISOString() },
    { term: "94102", timestamp: new Date().toISOString() },
    { term: "broadway", timestamp: new Date().toISOString() },
    { term: "broadway", timestamp: new Date().toISOString() },
    { term: "stem lab", timestamp: new Date().toISOString() }
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
      art.location.toLowerCase().includes(loc) || 
      art.content.toLowerCase().includes(loc) ||
      art.title.toLowerCase().includes(loc)
    );
  }

  // Sort descending by date
  return articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

export function getPublishedArticleById(id) {
  const db = getDB();
  const art = db.publishedArticles.find(a => a.id === id);
  if (art) {
    // Increment views as simulation
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
    ...article
  };
  
  db.publishedArticles.push(newArticle);
  
  // Remove from raw articles list so it doesn't clutter the feed
  if (article.rawId) {
    db.rawArticles = db.rawArticles.filter(art => art.id !== article.rawId);
  }

  saveDB(db);
  return newArticle;
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

