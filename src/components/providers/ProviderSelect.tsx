"use client";

import { useEffect } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { LlmProvider, PROVIDER_LABELS } from "@/lib/llm/types";

export function ProviderSelect() {
  const availableProviders = useResumeStore((s) => s.availableProviders);
  const selectedProvider = useResumeStore((s) => s.selectedProvider);
  const setAvailableProviders = useResumeStore((s) => s.setAvailableProviders);
  const setSelectedProvider = useResumeStore((s) => s.setSelectedProvider);

  useEffect(() => {
    fetch("/api/providers")
      .then((res) => res.json())
      .then((data) => setAvailableProviders(data.providers ?? []))
      .catch(() => setAvailableProviders([]));
  }, [setAvailableProviders]);

  if (availableProviders.length === 0) {
    return (
      <p className="text-xs text-red-600">
        No AI provider configured — add an API key in .env.local
      </p>
    );
  }

  return (
    <label className="flex items-center gap-2 text-xs text-gray-600">
      AI provider
      <select
        className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900"
        value={selectedProvider ?? ""}
        onChange={(e) => setSelectedProvider(e.target.value as LlmProvider)}
      >
        {availableProviders.map((provider) => (
          <option key={provider} value={provider}>
            {PROVIDER_LABELS[provider]}
          </option>
        ))}
      </select>
    </label>
  );
}
