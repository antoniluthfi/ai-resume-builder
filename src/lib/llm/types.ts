import { ParsedResumeData, ResumeData } from "@/types/resume";

export type LlmProvider = "anthropic" | "openai" | "gemini";

export const PROVIDER_LABELS: Record<LlmProvider, string> = {
  anthropic: "Claude (Anthropic)",
  openai: "GPT (OpenAI)",
  gemini: "Gemini (Google)",
};

export interface RawAiSuggestion {
  path: string;
  original: string;
  suggested: string;
  reason: string;
}

export interface AnalyzeJdResult {
  missingSkills: string[];
  suggestions: RawAiSuggestion[];
}

export interface LlmClient {
  analyzeJobMatch(resume: ResumeData, jobDescription: string): Promise<AnalyzeJdResult>;
  parseResumeFromPdf(base64Pdf: string): Promise<ParsedResumeData>;
}

export function isLlmProvider(value: unknown): value is LlmProvider {
  return value === "anthropic" || value === "openai" || value === "gemini";
}
