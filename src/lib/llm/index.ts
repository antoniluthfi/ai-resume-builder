import "server-only";
import { LlmClient, LlmProvider } from "./types";
import { anthropicClient } from "./anthropic";
import { openaiClient } from "./openai";
import { geminiClient } from "./gemini";

const CLIENTS: Record<LlmProvider, LlmClient> = {
  anthropic: anthropicClient,
  openai: openaiClient,
  gemini: geminiClient,
};

export function getLlmClient(provider: LlmProvider): LlmClient {
  return CLIENTS[provider];
}

export type { LlmProvider } from "./types";
