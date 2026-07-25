"use client";

import { useResumeStore } from "@/store/resumeStore";
import { inputClass } from "@/lib/formStyles";

export function SummaryForm() {
  const summary = useResumeStore((s) => s.resume.summary);
  const setSummary = useResumeStore((s) => s.setSummary);

  return (
    <textarea
      className={inputClass}
      rows={3}
      value={summary}
      onChange={(e) => setSummary(e.target.value)}
      placeholder="2-3 sentence summary of your experience and what you're looking for."
    />
  );
}
