"use client";

import { useResumeStore } from "@/store/resumeStore";

export function UndoButton() {
  const canUndo = useResumeStore((s) => s.undoStack.length > 0);
  const undo = useResumeStore((s) => s.undo);

  if (!canUndo) return null;

  return (
    <button
      type="button"
      onClick={undo}
      className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"
    >
      <span aria-hidden>↶</span>
      Undo last AI change
    </button>
  );
}
