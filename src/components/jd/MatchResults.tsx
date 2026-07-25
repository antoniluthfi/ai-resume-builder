"use client";

import { MatchResult } from "@/lib/keywordExtractor";
import { sectionClass, sectionTitleClass, tagClass } from "@/lib/formStyles";

function scoreColor(percentage: number) {
  if (percentage >= 70) return "text-emerald-600";
  if (percentage >= 40) return "text-amber-600";
  return "text-rose-600";
}

function scoreBarColor(percentage: number) {
  if (percentage >= 70) return "bg-emerald-500";
  if (percentage >= 40) return "bg-amber-500";
  return "bg-rose-500";
}

export function MatchResults({ result }: { result: MatchResult | null }) {
  if (!result) return null;

  return (
    <div className={sectionClass}>
      <div className="flex items-center justify-between">
        <h2 className={sectionTitleClass}>Keyword Match</h2>
        <span className={`text-lg font-bold ${scoreColor(result.matchPercentage)}`}>
          {result.matchPercentage}%
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${scoreBarColor(result.matchPercentage)}`}
          style={{ width: `${Math.min(100, Math.max(0, result.matchPercentage))}%` }}
        />
      </div>

      {result.matched.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-600 mb-1">Matched ({result.matched.length})</p>
          <div className="flex flex-wrap gap-1">
            {result.matched.map((keyword) => (
              <span key={keyword} className={`bg-emerald-50 text-emerald-700 ${tagClass}`}>
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.missing.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-600 mb-1">Missing ({result.missing.length})</p>
          <div className="flex flex-wrap gap-1">
            {result.missing.map((keyword) => (
              <span key={keyword} className={`bg-rose-50 text-rose-700 ${tagClass}`}>
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
