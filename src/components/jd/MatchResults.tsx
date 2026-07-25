"use client";

import { MatchResult } from "@/lib/keywordExtractor";
import { RawKeywordMatch } from "@/lib/llm/types";
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

export function MatchResults({
  result,
  aiResult,
}: {
  result: MatchResult | null;
  aiResult: RawKeywordMatch | null;
}) {
  const displayed = aiResult ?? result;
  if (!displayed) return null;

  return (
    <div className={sectionClass}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className={sectionTitleClass}>Keyword Match</h2>
          {aiResult && (
            <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
              AI-powered
            </span>
          )}
        </div>
        <span className={`text-lg font-bold ${scoreColor(displayed.matchPercentage)}`}>
          {displayed.matchPercentage}%
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${scoreBarColor(displayed.matchPercentage)}`}
          style={{ width: `${Math.min(100, Math.max(0, displayed.matchPercentage))}%` }}
        />
      </div>

      {!aiResult && (
        <p className="text-xs text-slate-400">
          Estimated from keyword patterns. Click &quot;Enhance with AI&quot; below for a more accurate match.
        </p>
      )}

      {displayed.matched.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-600 mb-1">Matched ({displayed.matched.length})</p>
          <div className="flex flex-wrap gap-1">
            {displayed.matched.map((keyword) => (
              <span key={keyword} className={`bg-emerald-50 text-emerald-700 ${tagClass}`}>
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {displayed.missing.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-600 mb-1">Missing ({displayed.missing.length})</p>
          <div className="flex flex-wrap gap-1">
            {displayed.missing.map((keyword) => (
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
