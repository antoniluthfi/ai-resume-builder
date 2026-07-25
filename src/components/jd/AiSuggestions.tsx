"use client";

import { useResumeStore } from "@/store/resumeStore";
import {
  primaryButtonClass,
  removeButtonClass,
  sectionClass,
  sectionTitleClass,
  smallButtonClass,
} from "@/lib/formStyles";

function describeSuggestionPath(path: string): string {
  if (path === "personalInfo.title") return "Professional title";
  if (path === "summary") return "Summary";

  const experienceMatch = path.match(/^experience\[(\d+)\]\.bullets\[(\d+)\]$/);
  if (experienceMatch) return `Experience #${Number(experienceMatch[1]) + 1}, bullet ${Number(experienceMatch[2]) + 1}`;

  const projectMatch = path.match(/^projects\[(\d+)\]\.bullets\[(\d+)\]$/);
  if (projectMatch) return `Project #${Number(projectMatch[1]) + 1}, bullet ${Number(projectMatch[2]) + 1}`;

  return path;
}

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
  const setAiKeywordMatch = useResumeStore((s) => s.setAiKeywordMatch);
  const applySuggestion = useResumeStore((s) => s.applySuggestion);
  const dismissSuggestion = useResumeStore((s) => s.dismissSuggestion);
  const selectedProvider = useResumeStore((s) => s.selectedProvider);
  const apiKey = useResumeStore((s) => s.providerKeys[s.selectedProvider]) ?? "";
  const setProjectRelevance = useResumeStore((s) => s.setProjectRelevance);
  const projectRelevance = useResumeStore((s) => s.projectRelevance);
  const hiddenProjectIds = useResumeStore((s) => s.hiddenProjectIds);
  const toggleProjectVisibility = useResumeStore((s) => s.toggleProjectVisibility);
  const setSkills = useResumeStore((s) => s.setSkills);
  const pushUndoSnapshot = useResumeStore((s) => s.pushUndoSnapshot);

  async function handleEnhance() {
    if (!apiKey) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const response = await fetch("/api/analyze-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, resume, provider: selectedProvider, apiKey }),
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
      setProjectRelevance(data.projectRelevance ?? []);
      setAiKeywordMatch(data.keywordMatch ?? null);
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
          disabled={isAnalyzing || !jobDescription.trim() || !apiKey}
        >
          {isAnalyzing ? "Analyzing…" : "Enhance with AI"}
        </button>
      </div>

      {analyzeError && <p className="text-xs text-rose-600">{analyzeError}</p>}

      {aiMissingSkills.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-600 mb-1">
            Skills the job description asks for that aren&apos;t on your list:
          </p>
          <div className="space-y-2">
            {aiMissingSkills.map((m) => {
              const alreadyAdded = resume.skills.includes(m.skill);
              const confidentlyImplied = m.impliedBy.length > 0;
              return (
                <div
                  key={m.skill}
                  className={`rounded-lg border p-2 ${
                    confidentlyImplied ? "border-blue-100 bg-blue-50/40" : "border-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-slate-800">
                      {m.skill}
                      {confidentlyImplied && <span className="text-blue-600"> · Implied by your skills</span>}
                    </p>
                    {confidentlyImplied &&
                      (alreadyAdded ? (
                        <span className="shrink-0 text-xs text-emerald-600">Added</span>
                      ) : (
                        <button
                          className={`shrink-0 ${smallButtonClass}`}
                          onClick={() => {
                            pushUndoSnapshot();
                            setSkills([...resume.skills, m.skill]);
                          }}
                        >
                          + Add to skills
                        </button>
                      ))}
                  </div>
                  <p className="text-xs text-slate-500 italic">{m.reason}</p>
                  {confidentlyImplied && (
                    <p className="text-xs text-blue-600">Implied by: {m.impliedBy.join(", ")}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {projectRelevance.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-600 mb-1">Project relevance for this job:</p>
          <div className="space-y-2">
            {projectRelevance.map((pr) => {
              const project = resume.projects.find((p) => p.id === pr.projectId);
              if (!project) return null;
              const hidden = hiddenProjectIds.includes(pr.projectId);
              return (
                <div
                  key={pr.projectId}
                  className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-2"
                >
                  <div>
                    <p className="text-xs font-medium text-slate-800">
                      {project.name || "Untitled project"}{" "}
                      {pr.relevant ? (
                        <span className="text-emerald-600">· Relevant</span>
                      ) : (
                        <span className="text-amber-600">· Maybe not relevant</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 italic">{pr.reason}</p>
                  </div>
                  <label className="flex shrink-0 items-center gap-1 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={!hidden}
                      onChange={() => toggleProjectVisibility(pr.projectId)}
                    />
                    Include
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {aiSuggestions.map((s) => (
          <div key={s.id} className="rounded-lg border border-slate-100 p-3 space-y-2">
            <p className="text-xs text-slate-500">{describeSuggestionPath(s.path)}</p>
            <p className="text-sm line-through text-slate-400">{s.original}</p>
            <p className="text-sm text-slate-900">{s.suggested}</p>
            <p className="text-xs text-slate-500 italic">{s.reason}</p>
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
