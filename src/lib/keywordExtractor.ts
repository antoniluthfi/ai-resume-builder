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

// Bullet/list glyphs (including CJK-style "・") and emoji that job postings
// commonly use for formatting. keyword-extractor's tokenizer doesn't treat
// these as word boundaries, so "・Lead" would otherwise survive as the single
// unmatchable token "・lead" instead of "lead".
const BULLET_AND_EMOJI_PATTERN = /[•◦▪‣●○▶✓✔★・]|\p{Extended_Pictographic}/gu;

function stripFormattingNoise(text: string): string {
  return text.replace(BULLET_AND_EMOJI_PATTERN, " ");
}

const MAX_SIGNAL_LINE_WORDS = 35;

/**
 * Job postings pasted as raw text mix concise requirement/responsibility
 * lines (real signal) with narrative paragraphs - company blurbs, "thanks for
 * applying" disclaimers, EEOC boilerplate (noise that dilutes the match %
 * with words that will never appear on any resume). Bullet lines and short
 * section headings are almost always a single sentence; boilerplate
 * paragraphs, when copy-pasted, tend to collapse several sentences into one
 * line. Filtering on that shape - not a company-specific word blocklist -
 * keeps this generic across job postings.
 */
function isProseLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const sentenceEnders = (trimmed.match(/[.!?]+(?=\s|$)/g) ?? []).length;
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  return sentenceEnders > 1 || wordCount > MAX_SIGNAL_LINE_WORDS;
}

function extractSignalText(text: string): string {
  return text
    .split("\n")
    .filter((line) => !isProseLine(line))
    .join("\n");
}

function extractSingleTokens(text: string): string[] {
  return keywordExtractor.extract(stripFormattingNoise(text), {
    language: "english",
    remove_digits: false,
    return_changed_case: true,
    remove_duplicates: true,
  });
}

function extractPhrases(text: string): string[] {
  const lower = stripFormattingNoise(text).toLowerCase();
  return KNOWN_PHRASES.filter((phrase) => lower.includes(phrase));
}

/** All candidate keywords/phrases found in a job description. */
export function extractJdKeywords(jobDescription: string): string[] {
  const signalText = extractSignalText(jobDescription);
  const tokens = extractSingleTokens(signalText).filter((t) => t.length > 2);
  const phrases = extractPhrases(signalText);

  // Drop single-token words already covered by a matched phrase, e.g. don't
  // separately list "machine"/"learning" or the punctuation-collapsed
  // "nodejs" alongside "machine learning" / "node.js".
  const phraseWords = new Set([
    ...phrases.flatMap((p) => p.split(/\W+/)),
    ...phrases.map((p) => p.replace(/\W+/g, "")),
  ]);
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
