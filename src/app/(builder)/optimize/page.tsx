"use client";

import { useMemo } from "react";
import { JobDescriptionInput } from "@/components/jd/JobDescriptionInput";
import { MatchResults } from "@/components/jd/MatchResults";
import { AiSuggestions } from "@/components/jd/AiSuggestions";
import { CoverLetterPanel } from "@/components/jd/CoverLetterPanel";
import { useResumeStore, resumeToMatchText } from "@/store/resumeStore";
import { matchResumeToJd } from "@/lib/keywordExtractor";

export default function OptimizePage() {
  const resume = useResumeStore((s) => s.resume);
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const setJobDescription = useResumeStore((s) => s.setJobDescription);

  const matchResult = useMemo(() => {
    if (!jobDescription.trim()) return null;
    return matchResumeToJd(resumeToMatchText(resume), jobDescription);
  }, [resume, jobDescription]);

  return (
    <div className="space-y-4">
      <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
      <MatchResults result={matchResult} />
      <AiSuggestions jobDescription={jobDescription} />
      <CoverLetterPanel jobDescription={jobDescription} />
    </div>
  );
}
