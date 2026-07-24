"use client";

import { useEffect, useMemo } from "react";
import { ResumeUploadButton } from "@/components/forms/ResumeUploadButton";
import { PersonalInfoForm } from "@/components/forms/PersonalInfoForm";
import { SummaryForm } from "@/components/forms/SummaryForm";
import { ExperienceForm } from "@/components/forms/ExperienceForm";
import { EducationForm } from "@/components/forms/EducationForm";
import { SkillsForm } from "@/components/forms/SkillsForm";
import { ProjectsForm } from "@/components/forms/ProjectsForm";
import { CertificationsForm } from "@/components/forms/CertificationsForm";
import { ResumePreview } from "@/components/preview/ResumePreview";
import { PdfDownloadButton } from "@/components/pdf/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/pdf/DocxDownloadButton";
import { JobDescriptionInput } from "@/components/jd/JobDescriptionInput";
import { MatchResults } from "@/components/jd/MatchResults";
import { AiSuggestions } from "@/components/jd/AiSuggestions";
import { CoverLetterPanel } from "@/components/jd/CoverLetterPanel";
import { SettingsDrawer } from "@/components/providers/SettingsDrawer";
import { VersionsDrawer } from "@/components/versions/VersionsDrawer";
import { QualityChecklist } from "@/components/quality/QualityChecklist";
import { UndoButton } from "@/components/undo/UndoButton";
import { useResumeStore, resumeToMatchText } from "@/store/resumeStore";
import { matchResumeToJd } from "@/lib/keywordExtractor";

export default function Home() {
  const resume = useResumeStore((s) => s.resume);
  const hydrateFromStorage = useResumeStore((s) => s.hydrateFromStorage);
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const setJobDescription = useResumeStore((s) => s.setJobDescription);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const matchResult = useMemo(() => {
    if (!jobDescription.trim()) return null;
    return matchResumeToJd(resumeToMatchText(resume), jobDescription);
  }, [resume, jobDescription]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-[1680px] items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">AI Resume Builder</h1>
            <p className="text-xs text-gray-500">
              ATS-friendly resume, tailored to every job description.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <VersionsDrawer />
            <SettingsDrawer />
            <PdfDownloadButton />
            <DocxDownloadButton />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1680px] grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <ResumeUploadButton />
          <PersonalInfoForm />
          <SummaryForm />
          <ExperienceForm />
          <EducationForm />
          <SkillsForm />
          <ProjectsForm />
          <CertificationsForm />
        </div>

        <div className="space-y-4">
          <div className="flex justify-end">
            <UndoButton />
          </div>
          <ResumePreview />
          <QualityChecklist />
        </div>

        <div className="space-y-4">
          <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
          <MatchResults result={matchResult} />
          <AiSuggestions jobDescription={jobDescription} />
          <CoverLetterPanel jobDescription={jobDescription} />
        </div>
      </main>
    </div>
  );
}
