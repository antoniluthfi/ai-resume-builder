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

export interface AnalyzeJdResult {
  missingSkills: RawMissingSkill[];
  suggestions: RawAiSuggestion[];
  projectRelevance: RawProjectRelevance[];
}

export interface LlmClient {
  analyzeJobMatch(apiKey: string, resume: ResumeData, jobDescription: string): Promise<AnalyzeJdResult>;
  parseResumeFromPdf(apiKey: string, base64Pdf: string): Promise<ParsedResumeData>;
}

export function isLlmProvider(value: unknown): value is LlmProvider {
  return value === "anthropic" || value === "openai" || value === "gemini";
}
