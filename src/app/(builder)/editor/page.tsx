"use client";

import { ResumeUploadButton } from "@/components/forms/ResumeUploadButton";
import { AccordionSection } from "@/components/forms/AccordionSection";
import { QualityChecklist } from "@/components/quality/QualityChecklist";
import { PersonalInfoForm } from "@/components/forms/PersonalInfoForm";
import { SummaryForm } from "@/components/forms/SummaryForm";
import { ExperienceForm } from "@/components/forms/ExperienceForm";
import { EducationForm } from "@/components/forms/EducationForm";
import { SkillsForm } from "@/components/forms/SkillsForm";
import { ProjectsForm } from "@/components/forms/ProjectsForm";
import { CertificationsForm } from "@/components/forms/CertificationsForm";

const optionalBadge = (
  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
    Optional
  </span>
);

export default function EditorPage() {
  return (
    <div className="space-y-4">
      <ResumeUploadButton />

      <QualityChecklist />

      <AccordionSection title="Personal Info" defaultOpen>
        <PersonalInfoForm />
      </AccordionSection>

      <AccordionSection title="Summary">
        <SummaryForm />
      </AccordionSection>

      <AccordionSection title="Experience">
        <ExperienceForm />
      </AccordionSection>

      <AccordionSection title="Education">
        <EducationForm />
      </AccordionSection>

      <AccordionSection title="Skills">
        <SkillsForm />
      </AccordionSection>

      <AccordionSection title="Projects" badge={optionalBadge}>
        <ProjectsForm />
      </AccordionSection>

      <AccordionSection title="Certifications" badge={optionalBadge}>
        <CertificationsForm />
      </AccordionSection>
    </div>
  );
}
