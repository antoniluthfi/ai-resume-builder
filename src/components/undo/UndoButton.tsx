"use client";

import { ArrowCounterClockwiseIcon as ArrowCounterClockwise } from "@phosphor-icons/react/dist/ssr/ArrowCounterClockwise";
import { useResumeStore } from "@/store/resumeStore";

export function UndoButton() {
  const canUndo = useResumeStore((s) => s.undoStack.length > 0);
  const undo = useResumeStore((s) => s.undo);

  if (!canUndo) return null;

  return (
    <button
      type="button"
      onClick={undo}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
    >
      <ArrowCounterClockwise size={14} weight="bold" />
      <span className="hidden sm:inline">Undo last AI change</span>
    </button>
  );
}
