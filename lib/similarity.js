/**
 * Normalizes text for comparison by lowercasing, stripping punctuation,
 * and normalizing whitespaces.
 */
export function normalizeText(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Splits text into a set of n-grams (default trigrams, n=3).
 * Trigrams are highly effective at capturing copy-paste plagiarism.
 */
export function getNgrams(text, n = 3) {
  const words = normalizeText(text).split(" ");
  const ngrams = new Set();
  
  if (words.length < n) {
    if (words.join(" ")) {
      ngrams.add(words.join(" "));
    }
    return ngrams;
  }

  for (let i = 0; i <= words.length - n; i++) {
    const ngram = words.slice(i, i + n).join(" ");
    ngrams.add(ngram);
  }
  return ngrams;
}

/**
 * Calculates the Jaccard Similarity score (0 to 1) between two sets.
 */
export function calculateJaccardSimilarity(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  
  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionCount++;
    }
  }
  
  const unionSize = setA.size + setB.size - intersectionCount;
  return intersectionCount / unionSize;
}

/**
 * Audits a source text against reference text for similarity.
 * Returns a score out of 100, a status, and highlighted overlapping phrases.
 */
export function auditPlagiarism(sourceText, referenceText) {
  if (!sourceText || !referenceText) {
    return { score: 0, status: "low", overlappingPhrases: [] };
  }

  const sourceNgrams = getNgrams(sourceText, 3);
  const refNgrams = getNgrams(referenceText, 3);

  // Compute Jaccard Similarity on Trigrams
  const jaccardScore = calculateJaccardSimilarity(sourceNgrams, refNgrams);
  
  // Find exact overlapping trigrams
  const overlaps = [];
  for (const ngram of sourceNgrams) {
    if (refNgrams.has(ngram)) {
      overlaps.push(ngram);
    }
  }

  // Group overlapping trigrams into continuous matching phrases for display
  const continuousPhrases = groupOverlappingPhrases(overlaps);

  const percentageScore = Math.min(Math.round(jaccardScore * 100 * 2.5), 100); // Scale multiplier for sensitive detection
  
  let status = "low";
  if (percentageScore > 35) {
    status = "high";
  } else if (percentageScore > 15) {
    status = "medium";
  }

  return {
    score: percentageScore,
    status,
    overlappingPhrases: continuousPhrases.slice(0, 5), // Return top 5 matching phrases
  };
}

/**
 * Merges overlapping trigrams into longer phrases.
 * E.g., ["a news outlet", "news outlet has", "outlet has published"] -> ["a news outlet has published"]
 */
function groupOverlappingPhrases(trigrams) {
  if (!trigrams || trigrams.length === 0) return [];
  
  const sorted = [...trigrams];
  const merged = [];
  
  while (sorted.length > 0) {
    let currentPhrase = sorted.shift().split(" ");
    let expanded = true;
    
    while (expanded) {
      expanded = false;
      for (let i = 0; i < sorted.length; i++) {
        const candidate = sorted[i].split(" ");
        // Case 1: candidate overlaps current phrase tail (shifted by 1)
        if (
          currentPhrase[currentPhrase.length - 2] === candidate[0] &&
          currentPhrase[currentPhrase.length - 1] === candidate[1]
        ) {
          currentPhrase.push(candidate[2]);
          sorted.splice(i, 1);
          expanded = true;
          break;
        }
        // Case 2: candidate overlaps current phrase head (shifted by 1)
        if (
          currentPhrase[0] === candidate[1] &&
          currentPhrase[1] === candidate[2]
        ) {
          currentPhrase.unshift(candidate[0]);
          sorted.splice(i, 1);
          expanded = true;
          break;
        }
      }
    }
    merged.push(currentPhrase.join(" "));
  }
  
  // Filter out short fragments, keep phrases with 4 or more words for readability
  return merged.filter(p => p.split(" ").length >= 4);
}
