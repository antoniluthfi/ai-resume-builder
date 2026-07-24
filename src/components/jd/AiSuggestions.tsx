"use client";

import { useResumeStore } from "@/store/resumeStore";
import {
  primaryButtonClass,
  removeButtonClass,
  sectionClass,
  sectionTitleClass,
  smallButtonClass,
} from "@/lib/formStyles";

export function AiSuggestions({ jobDescription }: { jobDescription: string }) {
  const resume = useResumeStore((s) => s.resume);
  const aiSuggestions = useResumeStore((s) => s.aiSuggestions);
  const aiMissingSkills = useResumeStore((s) => s.aiMissingSkills);
  const isAnalyzing = useResumeStore((s) => s.isAnalyzing);
  const analyzeError = useResumeStore((s) => s.analyzeError);
  const setAnalyzing = useResumeStore((s) => s.setAnalyzing);
  const setAnalyzeError = useResumeStore((s) => s.setAnalyzeError);
  const setAiSuggestions = useResumeStore((s) => s.setAiSuggestions);
  const setAiMissingSkills = useResumeStore((s) => s.setAiMissingSkills);
  const applySuggestion = useResumeStore((s) => s.applySuggestion);
  const dismissSuggestion = useResumeStore((s) => s.dismissSuggestion);
  const selectedProvider = useResumeStore((s) => s.selectedProvider);

  async function handleEnhance() {
    if (!selectedProvider) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const response = await fetch("/api/analyze-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, resume, provider: selectedProvider }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Analysis failed");
      }
      setAiSuggestions(
        data.suggestions.map((s: { path: string; original: string; suggested: string; reason: string }, i: number) => ({
          id: `${Date.now()}-${i}`,
          ...s,
        }))
      );
      setAiMissingSkills(data.missingSkills ?? []);
    } catch (error) {
      setAnalyzeError(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className={sectionClass}>
      <div className="flex items-center justify-between">
        <h2 className={sectionTitleClass}>AI Tailoring Suggestions</h2>
        <button
          className={primaryButtonClass}
          onClick={handleEnhance}
          disabled={isAnalyzing || !jobDescription.trim() || !selectedProvider}
        >
          {isAnalyzing ? "Analyzing…" : "Enhance with AI"}
        </button>
      </div>

      {analyzeError && <p className="text-xs text-red-600">{analyzeError}</p>}

      {aiMissingSkills.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">
            Skills in the job description not found in your resume — only add if genuinely true:
          </p>
          <div className="flex flex-wrap gap-1">
            {aiMissingSkills.map((skill) => (
              <span key={skill} className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {aiSuggestions.map((s) => (
          <div key={s.id} className="rounded-md border border-gray-100 p-3 space-y-2">
            <p className="text-xs text-gray-500">{s.path}</p>
            <p className="text-sm line-through text-gray-400">{s.original}</p>
            <p className="text-sm text-gray-900">{s.suggested}</p>
            <p className="text-xs text-gray-500 italic">{s.reason}</p>
            <div className="flex gap-3">
              <button className={smallButtonClass} onClick={() => applySuggestion(s.id)}>
                Apply
              </button>
              <button className={removeButtonClass} onClick={() => dismissSuggestion(s.id)}>
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
