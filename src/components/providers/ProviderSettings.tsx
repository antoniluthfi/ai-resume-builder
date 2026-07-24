"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { ALL_PROVIDERS, LlmProvider, PROVIDER_KEY_PLACEHOLDER, PROVIDER_LABELS } from "@/lib/llm/types";
import { inputClass, labelClass } from "@/lib/formStyles";

export function ProviderSettings() {
  const selectedProvider = useResumeStore((s) => s.selectedProvider);
  const setSelectedProvider = useResumeStore((s) => s.setSelectedProvider);
  const providerKeys = useResumeStore((s) => s.providerKeys);
  const setProviderKey = useResumeStore((s) => s.setProviderKey);
  const [showKey, setShowKey] = useState(false);

  const currentKey = providerKeys[selectedProvider] ?? "";

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>AI provider</label>
        <select
          className={inputClass}
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value as LlmProvider)}
        >
          {ALL_PROVIDERS.map((provider) => (
            <option key={provider} value={provider}>
              {PROVIDER_LABELS[provider]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>{PROVIDER_LABELS[selectedProvider]} API key</label>
        <div className="flex gap-2">
          <input
            type={showKey ? "text" : "password"}
            className={inputClass}
            placeholder={PROVIDER_KEY_PLACEHOLDER[selectedProvider]}
            value={currentKey}
            onChange={(e) => setProviderKey(selectedProvider, e.target.value)}
          />
          <button
            type="button"
            className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800"
            onClick={() => setShowKey((v) => !v)}
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        Your key stays in your browser and is only sent to power your own requests — never stored on our servers.
        Each provider&apos;s key is remembered separately.
      </p>
    </div>
  );
}
