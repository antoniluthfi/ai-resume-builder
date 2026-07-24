"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { ALL_PROVIDERS, LlmProvider, PROVIDER_KEY_PLACEHOLDER, PROVIDER_LABELS } from "@/lib/llm/types";

export function ProviderSelect() {
  const selectedProvider = useResumeStore((s) => s.selectedProvider);
  const setSelectedProvider = useResumeStore((s) => s.setSelectedProvider);
  const providerKeys = useResumeStore((s) => s.providerKeys);
  const setProviderKey = useResumeStore((s) => s.setProviderKey);
  const [showKey, setShowKey] = useState(false);

  const currentKey = providerKeys[selectedProvider] ?? "";

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <label className="flex items-center gap-2">
          AI provider
          <select
            className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as LlmProvider)}
          >
            {ALL_PROVIDERS.map((provider) => (
              <option key={provider} value={provider}>
                {PROVIDER_LABELS[provider]}
              </option>
            ))}
          </select>
        </label>
        <input
          type={showKey ? "text" : "password"}
          className="w-44 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900"
          placeholder={PROVIDER_KEY_PLACEHOLDER[selectedProvider]}
          value={currentKey}
          onChange={(e) => setProviderKey(selectedProvider, e.target.value)}
        />
        <button
          type="button"
          className="text-blue-600 hover:text-blue-800"
          onClick={() => setShowKey((v) => !v)}
        >
          {showKey ? "Hide" : "Show"}
        </button>
      </div>
      {!currentKey && (
        <p className="text-[11px] text-gray-400">
          Your key stays in your browser and is only sent to power your own requests — never stored on our servers.
        </p>
      )}
    </div>
  );
}
