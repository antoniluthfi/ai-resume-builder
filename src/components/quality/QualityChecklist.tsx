"use client";

import { useMemo } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { checkResumeQuality } from "@/lib/resumeQualityCheck";
import { sectionClass, sectionTitleClass } from "@/lib/formStyles";

export function QualityChecklist() {
  const resume = useResumeStore((s) => s.resume);
  const issues = useMemo(() => checkResumeQuality(resume), [resume]);

  const bulletCount =
    resume.experience.reduce((sum, e) => sum + e.bullets.filter(Boolean).length, 0) +
    resume.projects.reduce((sum, p) => sum + (p.bullets?.filter(Boolean).length ?? 0), 0);

  if (bulletCount === 0) return null;

  return (
    <div className={sectionClass}>
      <div className="flex items-center justify-between">
        <h2 className={sectionTitleClass}>Bullet Quality Check</h2>
        <span className={issues.length === 0 ? "text-xs text-emerald-600" : "text-xs text-amber-600"}>
          {issues.length === 0 ? "All clear" : `${issues.length} to review`}
        </span>
      </div>

      {issues.length === 0 ? (
        <p className="text-xs text-slate-500">No obvious issues found in your bullet points.</p>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div key={issue.path} className="rounded-lg border border-amber-100 bg-amber-50/60 p-3">
              <p className="text-xs font-medium text-slate-700">{issue.location}</p>
              <p className="text-sm text-slate-900 italic mt-1">&ldquo;{issue.text}&rdquo;</p>
              <ul className="mt-2 space-y-1">
                {issue.problems.map((problem) => (
                  <li key={problem} className="text-xs text-amber-700">
                    • {problem}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
