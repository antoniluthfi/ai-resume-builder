import { ParsedResumeData, ResumeData } from "@/types/resume";

export type LlmProvider = "anthropic" | "openai" | "gemini";

export const ALL_PROVIDERS: LlmProvider[] = ["anthropic", "openai", "gemini"];

export const PROVIDER_LABELS: Record<LlmProvider, string> = {
  anthropic: "Claude (Anthropic)",
  openai: "GPT (OpenAI)",
  gemini: "Gemini (Google)",
};

export const PROVIDER_KEY_PLACEHOLDER: Record<LlmProvider, string> = {
  anthropic: "sk-ant-...",
  openai: "sk-...",
  gemini: "AIza...",
};

export interface RawAiSuggestion {
  path: string;
  original: string;
  suggested: string;
  reason: string;
}

export interface RawProjectRelevance {
  index: number;
  relevant: boolean;
  reason: string;
}

export interface RawMissingSkill {
  skill: string;
  reason: string;
  impliedBy: string[];
}

export interface RawKeywordMatch {
  matchPercentage: number;
  matched: string[];
  missing: string[];
}

export interface AnalyzeJdResult {
  missingSkills: RawMissingSkill[];
  suggestions: RawAiSuggestion[];
  projectRelevance: RawProjectRelevance[];
  keywordMatch: RawKeywordMatch;
}

export interface RawBulletIssue {
  path: string;
  text: string;
  problems: string[];
}

export interface RawBulletRewrite {
  path: string;
  original: string;
  suggested: string;
  reason: string;
  needsUserInput: boolean;
}

export interface LlmClient {
  analyzeJobMatch(apiKey: string, resume: ResumeData, jobDescription: string): Promise<AnalyzeJdResult>;
  parseResumeFromPdf(apiKey: string, base64Pdf: string): Promise<ParsedResumeData>;
  generateCoverLetter(apiKey: string, resume: ResumeData, jobDescription: string): Promise<string>;
  rewriteBullets(apiKey: string, resume: ResumeData, issues: RawBulletIssue[]): Promise<RawBulletRewrite[]>;
  generateProjectDescription(apiKey: string, pageText: string): Promise<string>;
}

export function isLlmProvider(value: unknown): value is LlmProvider {
  return value === "anthropic" || value === "openai" || value === "gemini";
}
