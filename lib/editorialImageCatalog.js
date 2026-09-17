/**
 * HackerPost Editorial Imagery Catalog & Senior Newsroom Visual Engine
 * Inspired by TechCrunch, Ars Technica, and The Verge.
 * 
 * Guarantees context-relevant, high-resolution, unique editorial visuals
 * across all security advisories, venture funding dispatches, and threat telemetry.
 */

// Curated library of verified, high-resolution photography & 3D tech renders (all HTTP 200 validated)
export const TOPIC_IMAGE_POOLS = {
  ai_agent: [
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1676299081847-824916de030a?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507146426996-ef05388b3be5?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80"
  ],

  cisco_networking: [
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1520869562399-e772f16ddf7f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&auto=format&fit=crop&q=80"
  ],

  cloud_servers: [
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80"
  ],

  startups_venture: [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80"
  ],

  apple_devices: [
    "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1530319067432-f2a729c03db5?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80"
  ],

  code_open_source: [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511376777868-611b54f68947?w=800&auto=format&fit=crop&q=80"
  ],

  cyber_defense_threats: [
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618060932014-4deda4932554?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1528747045269-390fe33c19f2?w=800&auto=format&fit=crop&q=80"
  ],

  hardware_chips: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517055729445-fa7d27394b48?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1592659762303-90081d34b277?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=80"
  ],

  critical_infrastructure_scada: [
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=800&auto=format&fit=crop&q=80"
  ],

  defense_satellite_space: [
    "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1457364887197-9150188c107b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?w=800&auto=format&fit=crop&q=80"
  ],

  cities_finance: [
    "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"
  ]
};

/**
 * Evaluates article context to select the most relevant visual category.
 */
export function detectArticleTopic(article) {
  const title = (article.title || "").toLowerCase();
  const product = (article.affectedProduct || "").toLowerCase();
  const cat = (article.category || "").toLowerCase();
  const full = `${title} ${product} ${cat}`;

  if (/apple|ios|macos|safari|iphone|macbook|webkit/.test(full)) return "apple_devices";
  if (/\b(cisco|firepower|ftd|nx-os|cisco fmc)\b/.test(full)) return "cisco_networking";
  if (/\b(ai|llm|agent|gpt|claude|openai|anthropic|mcp|neural|benchmark|deepseek|perplexity)\b/.test(full)) return "ai_agent";
  if (/\b(satellite|aerospace|radar|pentagon|espionage|gps)\b/.test(full)) return "defense_satellite_space";
  if (/\b(scada|ics|plc|water facility|power grid|pipeline|siemens|modbus)\b/.test(full)) return "critical_infrastructure_scada";
  if (/\b(semiconductor|chip|microchip|intel|amd|nvidia|qualcomm|arm cpu|firmware|uefi)\b/.test(full)) return "hardware_chips";
  if (/\b(funding|valuation|series [a-e]|seed round|raises \$|venture|acquisition|m&a|invests)\b/.test(full) || article.fundingAmount) return "startups_venture";
  if (/\b(ransomware|lockbit|blackcat|qilin|extortion|dark web|leak site)\b/.test(full)) return "cyber_defense_threats";
  if (/\b(docker|kubernetes|aws|azure|gcp|cpanel|backup|acronis|hosting|vps|server)\b/.test(full)) return "cloud_servers";
  if (/\b(git|github|gitlab|npm|pypi|package|dependency|library|http4s|libp2p|plugin|wordpress)\b/.test(full)) return "code_open_source";

  // Category fallback
  if (cat.includes("startup") || cat.includes("m&a") || cat.includes("funding")) return "startups_venture";
  if (cat.includes("supply")) return "code_open_source";
  if (cat.includes("zero") || cat.includes("exploit")) return "cyber_defense_threats";
  if (cat.includes("ransomware")) return "cyber_defense_threats";
  if (cat.includes("benchmark") || cat.includes("ai")) return "ai_agent";
  if (cat.includes("breach")) return "cloud_servers";

  return "cloud_servers";
}

/**
 * Senior News Manager resolver: Ensures every single article receives a UNIQUE,
 * contextually accurate editorial visual without duplicates on the feed.
 */
export function resolveUniqueEditorialImage(article, usedUrls = new Set()) {
  // 1. If article already has an authentic primary reporting photo (from TechCrunch, Krebs, THN), retain it!
  const rawUrl = article.imageUrl || article.thumbnail;
  if (rawUrl && typeof rawUrl === "string" && !rawUrl.includes("unsplash.com") && rawUrl.startsWith("http") && !rawUrl.includes("1x1") && !rawUrl.includes("pixel")) {
    if (!usedUrls.has(rawUrl)) {
      usedUrls.add(rawUrl);
      return rawUrl;
    }
  }

  // 2. Identify the specific editorial topic
  const topicKey = detectArticleTopic(article);
  const primaryPool = TOPIC_IMAGE_POOLS[topicKey] || TOPIC_IMAGE_POOLS.cloud_servers;

  // 3. Find an unassigned photo in the primary pool
  for (const imgUrl of primaryPool) {
    if (!usedUrls.has(imgUrl)) {
      usedUrls.add(imgUrl);
      return imgUrl;
    }
  }

  // 4. If primary pool exhausted, search related fallback pools
  const fallbackOrder = ["cyber_defense_threats", "code_open_source", "cloud_servers", "startups_venture", "hardware_chips", "ai_agent", "defense_satellite_space", "cities_finance"];
  for (const fallbackKey of fallbackOrder) {
    const fallbackPool = TOPIC_IMAGE_POOLS[fallbackKey];
    if (fallbackPool) {
      for (const imgUrl of fallbackPool) {
        if (!usedUrls.has(imgUrl)) {
          usedUrls.add(imgUrl);
          return imgUrl;
        }
      }
    }
  }

  // 5. TechCrunch Branded Dynamic Editorial Card fallback (100% unique per slug/ID)
  const slug = article.slug || article.id || `dispatch-${Date.now()}`;
  const dynamicSvgUrl = `/api/card/${slug}.svg`;
  usedUrls.add(dynamicSvgUrl);
  return dynamicSvgUrl;
}
