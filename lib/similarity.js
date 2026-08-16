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
 * Common stopwords to exclude from plagiarism n-gram computation to prevent false positives.
 */
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
  "by", "from", "up", "about", "into", "through", "after", "is", "are", "was", "were",
  "be", "been", "being", "have", "has", "had", "do", "does", "did", "this", "that", "it"
]);

/**
 * Splits text into meaningful n-grams (default trigrams, n=3).
 * Trigrams are highly effective at capturing copy-paste plagiarism.
 */
export function getNgrams(text, n = 3) {
  const words = normalizeText(text).split(" ").filter(w => w.length > 0 && !STOPWORDS.has(w));
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

  const continuousPhrases = groupOverlappingPhrases(overlaps);
  const percentageScore = Math.min(Math.round(jaccardScore * 100 * 1.5), 100);
  
  let status = "low";
  if (percentageScore > 35) {
    status = "high";
  } else if (percentageScore > 15) {
    status = "medium";
  }

  return {
    score: percentageScore,
    status,
    overlappingPhrases: continuousPhrases.slice(0, 5),
  };
}

/**
 * Merges overlapping trigrams into longer phrases.
 */
function groupOverlappingPhrases(trigrams) {
  if (!trigrams || trigrams.length === 0) return [];
  
  const phrases = [];
  let currentPhrase = trigrams[0].split(" ");

  for (let i = 1; i < trigrams.length; i++) {
    const currentWords = trigrams[i].split(" ");
    // Check if the current trigram overlaps with the end of our current phrase
    if (
      currentPhrase[currentPhrase.length - 2] === currentWords[0] &&
      currentPhrase[currentPhrase.length - 1] === currentWords[1]
    ) {
      currentPhrase.push(currentWords[2]);
    } else {
      phrases.push(currentPhrase.join(" "));
      currentPhrase = currentWords;
    }
  }
  phrases.push(currentPhrase.join(" "));

  return phrases;
}
