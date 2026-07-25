"use client";

import { useConfirmStore } from "@/store/confirmStore";
import { secondaryButtonClass } from "@/lib/formStyles";

const destructiveButtonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-rose-700 active:scale-[0.98]";

export function ConfirmDialogHost() {
  const pending = useConfirmStore((s) => s.pending);
  const resolve = useConfirmStore((s) => s.resolve);

  if (!pending) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4"
      onClick={() => resolve(false)}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 space-y-4 [box-shadow:var(--shadow-card)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-slate-700">{pending.message}</p>
        <div className="flex justify-end gap-3">
          <button className={secondaryButtonClass} onClick={() => resolve(false)}>
            Cancel
          </button>
          <button className={destructiveButtonClass} onClick={() => resolve(true)}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
