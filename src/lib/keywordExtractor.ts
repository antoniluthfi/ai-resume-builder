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

// Job postings almost universally bracket the actual role content (duties,
// requirements) between a company-pitch intro and a benefits/EEO outro.
// Neither of those surrounding sections describe the job itself, but their
// short marketing lines and stat call-outs ("500M+ discovered experiences",
// partner name lists, "backed by ...") are individually brief enough to slip
// past isProseLine's sentence/length check. Scoping to the recognizable
// heading structure - present in the vast majority of postings from
// Greenhouse/Lever/Ashby-style templates - drops that noise at the source.
// Falls back to the full text when no such heading is found.
const ROLE_SECTION_START_PATTERN =
  /^(about the role|the role|role overview|the opportunity|position overview|what you.?ll (do|own|be doing)|responsibilit(y|ies)|key responsibilities|requirements|qualifications|who you are|about you|required skills|minimum qualifications|preferred qualifications|what we.?re looking for|duties)\s*:?\s*$/i;

const ROLE_SECTION_END_PATTERN =
  /^(what you.?ll (get|receive)|benefits|perks( and benefits)?|compensation( and benefits)?|about (the company|us)|who we are|our (values|culture)|equal opportunity( employer)?|eeo statement|diversity( ?(&|and) ?inclusion)?|why (join|work with) us|application process|how to apply)\s*:?\s*$/i;

function restrictToRoleSection(text: string): string {
  const lines = text.split("\n");
  const startIdx = lines.findIndex((line) => ROLE_SECTION_START_PATTERN.test(line.trim()));
  if (startIdx === -1) return text;

  const endIdx = lines.findIndex((line, i) => i > startIdx && ROLE_SECTION_END_PATTERN.test(line.trim()));
  const sliceEnd = endIdx === -1 ? lines.length : endIdx;
  return lines.slice(startIdx + 1, sliceEnd).join("\n");
}

// Pure quantity/stat tokens ("150", "20000+", "100m+", "35k+") are never
// something a resume would literally contain, so they only dilute the match
// score. remove_digits on the tokenizer only strips all-digit tokens, not
// these mixed digit+unit shapes, so they're filtered separately here.
const QUANTITY_TOKEN_PATTERN = /^\d+([.,]\d+)*[kmb]?\+?$/i;

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
  const scopedText = restrictToRoleSection(jobDescription);
  const signalText = extractSignalText(scopedText);
  const tokens = extractSingleTokens(signalText).filter(
    (t) => t.length > 2 && !QUANTITY_TOKEN_PATTERN.test(t)
  );
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

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Word-boundary match instead of plain substring containment, so a short
// keyword like "art" doesn't count as matched just because the resume
// contains "chart" or "smart".
function includesWholeWord(haystack: string, needle: string): boolean {
  return new RegExp(`\\b${escapeRegExp(needle)}\\b`).test(haystack);
}

/** Compares JD keywords against resume text (client-side, no API call). */
export function matchResumeToJd(resumeText: string, jobDescription: string): MatchResult {
  const jdKeywords = extractJdKeywords(jobDescription);
  const resumeLower = resumeText.toLowerCase();

  const matched: string[] = [];
  const missing: string[] = [];

  for (const keyword of jdKeywords) {
    if (includesWholeWord(resumeLower, keyword)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const matchPercentage = jdKeywords.length === 0 ? 0 : Math.round((matched.length / jdKeywords.length) * 100);

  return { matchPercentage, matched, missing, jdKeywordCount: jdKeywords.length };
}
