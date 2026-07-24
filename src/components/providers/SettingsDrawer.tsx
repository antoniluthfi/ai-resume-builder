"use client";

import { useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { ProviderSettings } from "./ProviderSettings";

export function SettingsDrawer() {
  const [open, setOpen] = useState(false);
  const hasKey = useResumeStore((s) => Boolean(s.providerKeys[s.selectedProvider]));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <span aria-hidden>⚙️</span>
        Settings
        {!hasKey && <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-label="API key required" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="relative flex h-full w-80 flex-col gap-4 overflow-y-auto bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">AI Settings</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close settings"
              >
                ✕
              </button>
            </div>
            <ProviderSettings />
          </div>
        </div>
      )}
    </>
  );
}
