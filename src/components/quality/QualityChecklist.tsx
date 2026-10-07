"use client";

import { useMemo } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { useToastStore } from "@/store/toastStore";
import { checkResumeQuality } from "@/lib/resumeQualityCheck";
import { AccordionSection } from "@/components/forms/AccordionSection";
import { primaryButtonClass, removeButtonClass, smallButtonClass } from "@/lib/formStyles";
import { withoutPhoto } from "@/lib/photo";

export function QualityChecklist() {
  const resume = useResumeStore((s) => s.resume);
  const issues = useMemo(() => checkResumeQuality(resume), [resume]);

  const qualitySuggestions = useResumeStore((s) => s.qualitySuggestions);
  const isRewritingQuality = useResumeStore((s) => s.isRewritingQuality);
  const rewriteQualityError = useResumeStore((s) => s.rewriteQualityError);
  const setQualitySuggestions = useResumeStore((s) => s.setQualitySuggestions);
  const setRewritingQuality = useResumeStore((s) => s.setRewritingQuality);
  const setRewriteQualityError = useResumeStore((s) => s.setRewriteQualityError);
  const applyQualitySuggestion = useResumeStore((s) => s.applyQualitySuggestion);
  const dismissQualitySuggestion = useResumeStore((s) => s.dismissQualitySuggestion);
  const selectedProvider = useResumeStore((s) => s.selectedProvider);
  const apiKey = useResumeStore((s) => s.providerKeys[s.selectedProvider]) ?? "";
  const showToast = useToastStore((s) => s.showToast);

  const bulletCount =
    resume.experience.reduce((sum, e) => sum + e.bullets.filter(Boolean).length, 0) +
    resume.projects.reduce((sum, p) => sum + (p.bullets?.filter(Boolean).length ?? 0), 0);

  if (bulletCount === 0) return null;

  async function handleRewrite() {
    if (!apiKey || issues.length === 0) return;
    setRewritingQuality(true);
    setRewriteQualityError(null);
    try {
      const response = await fetch("/api/rewrite-bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: withoutPhoto(resume),
          issues: issues.map((issue) => ({ path: issue.path, text: issue.text, problems: issue.problems })),
          provider: selectedProvider,
          apiKey,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Rewrite failed");
      }
      const rewrites = (data.rewrites as {
        path: string;
        original: string;
        suggested: string;
        reason: string;
        needsUserInput: boolean;
      }[]).map((r, i) => ({ id: `${Date.now()}-${i}`, ...r }));
      setQualitySuggestions(rewrites);
      showToast("success", rewrites.length === 0 ? "No rewrites needed" : "Bullet rewrites ready");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Rewrite failed";
      setRewriteQualityError(message);
      showToast("error", message);
    } finally {
      setRewritingQuality(false);
    }
  }

  return (
    <AccordionSection
      title="Bullet Writing Suggestions"
      badge={
        <span className={issues.length === 0 ? "text-xs text-emerald-600" : "text-xs text-amber-600"}>
          {issues.length === 0 ? "Nothing to suggest" : `${issues.length} suggestion${issues.length === 1 ? "" : "s"}`}
        </span>
      }
      actions={
        issues.length > 0 ? (
          <button
            className={primaryButtonClass}
            onClick={handleRewrite}
            disabled={isRewritingQuality || !apiKey}
          >
            {isRewritingQuality ? "Rewriting…" : "Rewrite with AI"}
          </button>
        ) : undefined
      }
    >
      {issues.length === 0 ? (
        <p className="text-xs text-slate-500">
          No common style patterns flagged — this isn&rsquo;t a guarantee your bullets are strong, just that nothing obvious stood out.
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {issues.map((issue) => (
              <div key={issue.path} className="rounded-lg border border-amber-100 bg-amber-50/60 p-3">
                <p className="text-xs font-medium text-slate-700">{issue.location}</p>
                <p className="text-sm text-slate-900 italic mt-1">&ldquo;{issue.text}&rdquo;</p>
                <ul className="mt-2 space-y-1" aria-label="Suggestions, not rules">
                  {issue.problems.map((problem) => (
                    <li key={problem} className="text-xs text-amber-700">
                      • {problem}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {!apiKey && (
            <p className="text-xs text-slate-400">Add an API key in Settings to enable AI rewrites.</p>
          )}
          {rewriteQualityError && <p className="text-xs text-rose-600">{rewriteQualityError}</p>}

          {qualitySuggestions.length > 0 && (
            <div className="space-y-3">
              {qualitySuggestions.map((s) => (
                <div key={s.id} className="rounded-lg border border-slate-100 p-3 space-y-2">
                  <p className="text-sm line-through text-slate-400">{s.original}</p>
                  <p className="text-sm text-slate-900">{s.suggested}</p>
                  <p className="text-xs text-slate-500 italic">{s.reason}</p>
                  {s.needsUserInput && (
                    <p className="text-xs font-medium text-amber-700">
                      ⚠ Fill in a real number before using this — don&rsquo;t leave the [ ] as-is.
                    </p>
                  )}
                  <div className="flex gap-3">
                    <button className={smallButtonClass} onClick={() => applyQualitySuggestion(s.id)}>
                      Apply
                    </button>
                    <button className={removeButtonClass} onClick={() => dismissQualitySuggestion(s.id)}>
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AccordionSection>
  );
}
