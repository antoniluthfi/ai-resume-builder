"use client";

import { useMemo, useState } from "react";
import { PersonalInfoForm } from "@/components/forms/PersonalInfoForm";
import { SummaryForm } from "@/components/forms/SummaryForm";
import { ExperienceForm } from "@/components/forms/ExperienceForm";
import { EducationForm } from "@/components/forms/EducationForm";
import { SkillsForm } from "@/components/forms/SkillsForm";
import { ProjectsForm } from "@/components/forms/ProjectsForm";
import { CertificationsForm } from "@/components/forms/CertificationsForm";
import { ResumePreview } from "@/components/preview/ResumePreview";
import { PdfDownloadButton } from "@/components/pdf/PdfDownloadButton";
import { JobDescriptionInput } from "@/components/jd/JobDescriptionInput";
import { MatchResults } from "@/components/jd/MatchResults";
import { AiSuggestions } from "@/components/jd/AiSuggestions";
import { useResumeStore, resumeToMatchText } from "@/store/resumeStore";
import { matchResumeToJd } from "@/lib/keywordExtractor";

export default function Home() {
  const resume = useResumeStore((s) => s.resume);
  const [jobDescription, setJobDescription] = useState("");

  const matchResult = useMemo(() => {
    if (!jobDescription.trim()) return null;
    return matchResumeToJd(resumeToMatchText(resume), jobDescription);
  }, [resume, jobDescription]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">AI Resume Builder</h1>
            <p className="text-xs text-gray-500">
              ATS-friendly resume, tailored to every job description.
            </p>
          </div>
          <PdfDownloadButton />
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <PersonalInfoForm />
          <SummaryForm />
          <ExperienceForm />
          <EducationForm />
          <SkillsForm />
          <ProjectsForm />
          <CertificationsForm />
        </div>

        <div className="lg:col-span-1">
          <ResumePreview />
        </div>

        <div className="space-y-4 lg:col-span-1">
          <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
          <MatchResults result={matchResult} />
          <AiSuggestions jobDescription={jobDescription} />
        </div>
      </main>
    </div>
  );
}
