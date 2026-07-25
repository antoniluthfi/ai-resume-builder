"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ClockCounterClockwiseIcon as ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr/ClockCounterClockwise";
import { XIcon as X } from "@phosphor-icons/react/dist/ssr/X";
import { useResumeStore } from "@/store/resumeStore";
import { secondaryButtonClass } from "@/lib/formStyles";
import { VersionsPanel } from "./VersionsPanel";

export function VersionsDrawer() {
  const [open, setOpen] = useState(false);
  const versionCount = useResumeStore((s) => s.versions.length);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={secondaryButtonClass}>
        <ClockCounterClockwise size={16} weight="bold" />
        <span className="hidden sm:inline">Versions</span>
        {versionCount > 0 && (
          <span className="rounded-full bg-slate-100 px-1.5 text-xs text-slate-600">{versionCount}</span>
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
                <h2 className="text-sm font-semibold text-slate-900">Resume Versions</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Close versions"
                >
                  <X size={18} />
                </button>
              </div>
              <VersionsPanel />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
