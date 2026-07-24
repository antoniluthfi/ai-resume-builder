import "server-only";
import { LlmClient, LlmProvider } from "./types";
import { anthropicClient } from "./anthropic";
import { openaiClient } from "./openai";
import { geminiClient } from "./gemini";

const PROVIDER_ENV_KEYS: Record<LlmProvider, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY",
};

const CLIENTS: Record<LlmProvider, LlmClient> = {
  anthropic: anthropicClient,
  openai: openaiClient,
  gemini: geminiClient,
};

export function listAvailableProviders(): LlmProvider[] {
  return (Object.keys(PROVIDER_ENV_KEYS) as LlmProvider[]).filter((provider) =>
    Boolean(process.env[PROVIDER_ENV_KEYS[provider]])
  );
}

export function getLlmClient(provider: LlmProvider): LlmClient {
  return CLIENTS[provider];
}

export type { LlmProvider } from "./types";
