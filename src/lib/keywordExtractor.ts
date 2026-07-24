import keywordExtractor from "keyword-extractor";

/**
 * Multi-word skill/tech phrases keyword-extractor's single-token extraction
 * would otherwise split apart (e.g. "machine learning" -> "machine", "learning").
 * Checked separately against the raw lowercased text.
 */
const KNOWN_PHRASES = [
  "machine learning",
  "deep learning",
  "data analysis",
  "data science",
  "project management",
  "product management",
  "react native",
  "node.js",
  "rest api",
  "restful api",
  "ci/cd",
  "unit testing",
  "test automation",
  "cross-functional",
  "agile",
  "scrum",
  "kanban",
  "version control",
  "cloud computing",
  "customer service",
  "problem solving",
  "communication skills",
  "team leadership",
  "stakeholder management",
  "ui/ux",
  "user experience",
  "user research",
  "a/b testing",
];

export interface MatchResult {
  matchPercentage: number;
  matched: string[];
  missing: string[];
  jdKeywordCount: number;
}

function extractSingleTokens(text: string): string[] {
  return keywordExtractor.extract(text, {
    language: "english",
    remove_digits: false,
    return_changed_case: true,
    remove_duplicates: true,
  });
}

function extractPhrases(text: string): string[] {
  const lower = text.toLowerCase();
  return KNOWN_PHRASES.filter((phrase) => lower.includes(phrase));
}

/** All candidate keywords/phrases found in a job description. */
export function extractJdKeywords(jobDescription: string): string[] {
  const tokens = extractSingleTokens(jobDescription).filter((t) => t.length > 2);
  const phrases = extractPhrases(jobDescription);

  // Drop single-token words already covered by a matched phrase, e.g. don't
  // separately list "machine"/"learning" alongside "machine learning".
  const phraseWords = new Set(phrases.flatMap((p) => p.split(/\W+/)));
  const filteredTokens = tokens.filter((t) => !phraseWords.has(t));

  return Array.from(new Set([...phrases, ...filteredTokens]));
}

/** Compares JD keywords against resume text (client-side, no API call). */
export function matchResumeToJd(resumeText: string, jobDescription: string): MatchResult {
  const jdKeywords = extractJdKeywords(jobDescription);
  const resumeLower = resumeText.toLowerCase();

  const matched: string[] = [];
  const missing: string[] = [];

  for (const keyword of jdKeywords) {
    if (resumeLower.includes(keyword)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const matchPercentage = jdKeywords.length === 0 ? 0 : Math.round((matched.length / jdKeywords.length) * 100);

  return { matchPercentage, matched, missing, jdKeywordCount: jdKeywords.length };
}
