"use client";

import { useState } from "react";
import { EyeIcon as Eye } from "@phosphor-icons/react/dist/ssr/Eye";
import { XIcon as X } from "@phosphor-icons/react/dist/ssr/X";
import { ResumePreview } from "@/components/preview/ResumePreview";
import { QualityChecklist } from "@/components/quality/QualityChecklist";

export function PreviewPane() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden min-w-0 space-y-4 pb-6 lg:block">
        <ResumePreview />
        <QualityChecklist />
      </aside>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-medium text-white shadow-lg shadow-accent/30 transition-transform active:scale-95 lg:hidden"
      >
        <Eye size={18} weight="bold" />
        Preview
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Resume Preview</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close preview"
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
            <ResumePreview />
            <QualityChecklist />
          </div>
        </div>
      )}
    </>
  );
}
