"use client";

import { useMemo } from "react";
import { useResumeStore, resumeToMatchText } from "@/store/resumeStore";
import { checkResumeQuality } from "@/lib/resumeQualityCheck";
import { matchResumeToJd } from "@/lib/keywordExtractor";
import { computeResumeScore } from "@/lib/resumeScore";
import { scoreColorClass, scoreBarColorClass } from "@/lib/scoreDisplay";
import { sectionClass, sectionTitleClass } from "@/lib/formStyles";

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className={`font-medium ${scoreColorClass(value)}`}>{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${scoreBarColorClass(value)}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export function ResumeScoreCard() {
  const resume = useResumeStore((s) => s.resume);
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const aiKeywordMatch = useResumeStore((s) => s.aiKeywordMatch);

  const issues = useMemo(() => checkResumeQuality(resume), [resume]);

  const matchPercentage = useMemo(() => {
    if (aiKeywordMatch) return aiKeywordMatch.matchPercentage;
    if (!jobDescription.trim()) return null;
    return matchResumeToJd(resumeToMatchText(resume), jobDescription).matchPercentage;
  }, [resume, jobDescription, aiKeywordMatch]);

  const score = useMemo(
    () => computeResumeScore(resume, issues, matchPercentage),
    [resume, issues, matchPercentage]
  );

  const bulletCount = resume.experience.reduce((sum, e) => sum + e.bullets.filter(Boolean).length, 0);
  if (!resume.personalInfo.name.trim() && !resume.summary.trim() && bulletCount === 0) return null;

  return (
    <div className={sectionClass}>
      <div className="flex items-center justify-between">
        <h2 className={sectionTitleClass}>Resume Health Score</h2>
        <span className={`text-lg font-bold ${scoreColorClass(score.overall)}`}>{score.overall}%</span>
      </div>

      <div className="space-y-2">
        <ScoreBar label="Completeness" value={score.completeness} />
        <ScoreBar label="Writing quality" value={score.writingQuality} />
        {score.keywordMatch !== null && <ScoreBar label="Keyword match" value={score.keywordMatch} />}
      </div>

      {score.tips.length > 0 && (
        <ul className="space-y-1">
          {score.tips.map((tip) => (
            <li key={tip} className="text-xs text-slate-500">
              • {tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
