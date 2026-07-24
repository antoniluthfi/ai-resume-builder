"use client";

import { MatchResult } from "@/lib/keywordExtractor";
import { sectionClass, sectionTitleClass } from "@/lib/formStyles";

function scoreColor(percentage: number) {
  if (percentage >= 70) return "text-green-600";
  if (percentage >= 40) return "text-amber-600";
  return "text-red-600";
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

      {result.matched.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Matched ({result.matched.length})</p>
          <div className="flex flex-wrap gap-1">
            {result.matched.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.missing.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">Missing ({result.missing.length})</p>
          <div className="flex flex-wrap gap-1">
            {result.missing.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
