"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { GearIcon as Gear } from "@phosphor-icons/react/dist/ssr/Gear";
import { XIcon as X } from "@phosphor-icons/react/dist/ssr/X";
import { useResumeStore } from "@/store/resumeStore";
import { secondaryButtonClass } from "@/lib/formStyles";
import { ProviderSettings } from "./ProviderSettings";

export function SettingsDrawer() {
  const [open, setOpen] = useState(false);
  const hasKey = useResumeStore((s) => Boolean(s.providerKeys[s.selectedProvider]));

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`relative ${secondaryButtonClass}`}>
        <Gear size={16} weight="bold" />
        <span className="hidden sm:inline">Settings</span>
        {!hasKey && (
          <span
            className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white"
            aria-label="API key required"
          />
        )}
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex justify-end">
            <div
              className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div className="relative flex h-full w-full flex-col gap-4 overflow-y-auto bg-white p-6 shadow-2xl sm:w-96">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">AI Settings</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Close settings"
                >
                  <X size={18} />
                </button>
              </div>
              <ProviderSettings />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
