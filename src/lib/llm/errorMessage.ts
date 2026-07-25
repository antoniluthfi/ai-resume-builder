import "server-only";

/**
 * The Anthropic, OpenAI, and Google GenAI SDKs all throw errors whose
 * `.message` is the raw provider response (status code + full JSON error
 * body) - not something to show a user. Each SDK's error class does expose a
 * `.status` HTTP code though, so map the common cases to a clean message and
 * fall back to a generic one rather than leaking the provider's raw payload.
 */
export function friendlyLlmErrorMessage(error: unknown, fallback: string): string {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? (error as { status?: unknown }).status
      : undefined;

  if (status === 401 || status === 403) {
    return "Invalid API key — check your key in Settings.";
  }
  if (status === 429) {
    return "Rate limited by the provider — try again in a moment.";
  }
  if (typeof status === "number" && status >= 500) {
    return "The AI provider is having issues right now — try again shortly.";
  }
  return fallback;
}
